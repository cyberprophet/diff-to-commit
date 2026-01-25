import * as vscode from "vscode";
import { getDiff } from "./core/git/diff";
import { generateMessageFromDiff } from "./core/commit/message";
import { maskSensitive } from "./core/redact/redact";
import { getChangedPathsFromDiff } from "./core/git/paths";
import { getConfig } from "./extension/config";
import { setApiKey } from "./extension/commands/setApiKey";
import { getGitApi, pickRepository } from "./extension/gitApi";

const API_KEY_SECRET = "diffToCommit.apiKey";

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
    )
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

  const apiKey = await context.secrets.get(API_KEY_SECRET);

  if (!apiKey) {
    vscode.window.showErrorMessage(
      "API key not set. Run 'Diff to Commit: Set API Key'."
    );
    return;
  }

  try {
    const message = await generateMessageFromDiff({
      diff: redacted,
      changedPaths,
      mode,
      config,
      apiKey
    });
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
