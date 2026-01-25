import * as vscode from "vscode";
import { clearCopilotTokenCache } from "../../core/copilot/copilotClient";

const GITHUB_PROVIDER_ID = "github";
const GITHUB_SCOPES = ["read:user"];

export async function signOut(): Promise<void> {
  const session = await vscode.authentication.getSession(
    GITHUB_PROVIDER_ID,
    GITHUB_SCOPES,
    { createIfNone: false, clearSessionPreference: true }
  );

  clearCopilotTokenCache();

  if (!session) {
    vscode.window.showInformationMessage("No active GitHub session.");
    return;
  }

  vscode.window.showInformationMessage(
    "GitHub session cleared for this extension. Use Accounts menu to sign out fully."
  );
}
