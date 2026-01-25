import * as vscode from "vscode";

export async function clearApiKey(
  context: vscode.ExtensionContext,
  secretKey: string
): Promise<void> {
  await context.secrets.delete(secretKey);
  vscode.window.showInformationMessage("API key cleared.");
}
