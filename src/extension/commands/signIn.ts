import * as vscode from "vscode";
import { isCopilotAvailable } from "../../core/copilot/copilotClient";

const GITHUB_PROVIDER_ID = "github";
const GITHUB_SCOPES = ["read:user"];

export async function signIn(): Promise<void> {
  const session = await vscode.authentication.getSession(
    GITHUB_PROVIDER_ID,
    GITHUB_SCOPES,
    { createIfNone: true }
  );
  if (!session) {
    vscode.window.showErrorMessage("GitHub sign in failed.");
    return;
  }

  const copilotAvailable = await isCopilotAvailable(session.accessToken);
  if (copilotAvailable) {
    vscode.window.showInformationMessage(
      "Signed in to GitHub. Copilot is available."
    );
  } else {
    vscode.window.showWarningMessage(
      "Signed in to GitHub, but Copilot is not available. Check your Copilot subscription."
    );
  }
}
