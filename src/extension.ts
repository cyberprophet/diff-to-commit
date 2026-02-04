import * as vscode from "vscode";
import { getDiff } from "./core/git/diff";
import { getChangedPathsFromDiff } from "./core/git/paths";
import { selectProvider } from "./core/providers/router";
import { maskSensitive } from "./core/redact/redact";
import { clearApiKey } from "./extension/commands/clearApiKey";
import { setApiKey } from "./extension/commands/setApiKey";
import { signIn } from "./extension/commands/signIn";
import { signOut } from "./extension/commands/signOut";
import { getConfig } from "./extension/config";
import { getGitApi, pickRepository } from "./extension/gitApi";
import { CopilotProvider } from "./extension/providers/copilotProvider";
import { ApiKeyProvider } from "./extension/providers/apiKeyProvider";
import { API_KEY_SECRET } from "./extension/secrets";

export function activate(context: vscode.ExtensionContext): void {
  context.subscriptions.push(
    vscode.commands.registerCommand("diff-to-commit.fillMessageStaged", () =>
      fillMessage(context, "staged")
    ),
    vscode.commands.registerCommand("diff-to-commit.fillMessageWorkingTree", () =>
      fillMessage(context, "workingTree")
    ),
    vscode.commands.registerCommand("diff-to-commit.setApiKey", () =>
      setApiKey(context, API_KEY_SECRET)
    ),
    vscode.commands.registerCommand("diff-to-commit.clearApiKey", () =>
      clearApiKey(context, API_KEY_SECRET)
    ),
    vscode.commands.registerCommand("diff-to-commit.signIn", () => signIn()),
    vscode.commands.registerCommand("diff-to-commit.signOut", () => signOut())
  );
}

async function fillMessage(
  context: vscode.ExtensionContext,
  mode: "staged" | "workingTree"
): Promise<void> {
  const config = getConfig();
  let gitApi;
  try {
    gitApi = await getGitApi();
  } catch (error) {
    vscode.window.showErrorMessage(
      `Git API not available: ${error instanceof Error ? error.message : String(error)}`
    );
    return;
  }

  const workspaceFolder = await pickWorkspaceFolder();
  const repository = pickRepository(gitApi, workspaceFolder);
  if (!repository) {
    vscode.window.showErrorMessage("No git repository found for this workspace.");
    return;
  }

  const inputBox = repository.inputBox;

  if (!config.allowOverwrite && inputBox.value.trim().length > 0) {
    vscode.window.showInformationMessage(
      "SCM message is not empty. Enable overwrite to replace it."
    );
    return;
  }

  const testMode = process.env.DIFF_TO_COMMIT_TEST_MODE === "1";
  if (testMode) {
    inputBox.value =
      "chore(test): update generated commit message\n\n- add test-mode commit output";
    return;
  }

  let diff: string;
  try {
    diff = await getDiff({
      repoRoot: repository.rootUri.fsPath,
      mode,
      maxChars: config.maxDiffChars
    });
  } catch (error) {
    vscode.window.showErrorMessage(
      `Failed to get git diff: ${error instanceof Error ? error.message : String(error)}`
    );
    return;
  }

  if (diff.trim().length === 0) {
    vscode.window.showInformationMessage("No changes found for diff.");
    return;
  }

  const redacted = maskSensitive(diff);
  const changedPaths = getChangedPathsFromDiff(diff);

  try {
    const copilotProvider = new CopilotProvider(context);
    const apiKeyProvider = new ApiKeyProvider(context, API_KEY_SECRET);

    const copilotUsable =
      config.backend === "apikey" ? false : await copilotProvider.isUsable();
    const apiKeyUsable =
      config.backend === "account" ? false : await apiKeyProvider.isUsable();

    const accountProxy = {
      id: copilotProvider.id,
      isAvailable: () => true,
      isUsable: async () => copilotUsable,
      generate: (payload: Parameters<typeof copilotProvider.generate>[0]) =>
        copilotProvider.generate(payload)
    };
    const apiKeyProxy = {
      id: apiKeyProvider.id,
      isAvailable: () => true,
      isUsable: async () => apiKeyUsable,
      generate: (payload: Parameters<typeof apiKeyProvider.generate>[0]) =>
        apiKeyProvider.generate(payload)
    };

    const provider = await selectProvider(config.backend, {
      account: accountProxy,
      apikey: apiKeyProxy
    });

    if (!provider) {
      if (config.backend === "account") {
        vscode.window.showErrorMessage(
          "GitHub Copilot not available. Sign in with GitHub and check your Copilot subscription."
        );
        return;
      }
      if (config.backend === "apikey") {
        vscode.window.showErrorMessage(
          "API key not set. Run 'Diff to Commit: Set API Key'."
        );
        return;
      }
      vscode.window.showErrorMessage(
        "Sign in with GitHub (requires Copilot) or set an API key to generate a commit message."
      );
      return;
    }

    const payload = {
      diff: redacted,
      changedPaths,
      mode,
      config
    };

    const message = await vscode.window.withProgress(
      {
        location: vscode.ProgressLocation.Notification,
        title: "Generating commit message...",
        cancellable: false
      },
      async (): Promise<string> => {
        try {
          return await provider.generate(payload);
        } catch (error) {
          if (config.backend === "auto" && provider.id === "account" && apiKeyUsable) {
            return await apiKeyProxy.generate(payload);
          } else {
            throw error;
          }
        }
      }
    );

    inputBox.value = message;
  } catch (error) {
    vscode.window.showErrorMessage(
      `Failed to generate commit message: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

async function pickWorkspaceFolder(): Promise<vscode.WorkspaceFolder | undefined> {
  const activeEditor = vscode.window.activeTextEditor;
  if (activeEditor) {
    const folder = vscode.workspace.getWorkspaceFolder(activeEditor.document.uri);
    if (folder) {
      return folder;
    }
  }

  const folders = vscode.workspace.workspaceFolders;
  if (!folders || folders.length === 0) {
    return undefined;
  }
  if (folders.length === 1) {
    return folders[0];
  }

  return vscode.window.showWorkspaceFolderPick({
    placeHolder: "Select workspace folder for git diff"
  });
}
