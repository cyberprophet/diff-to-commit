import * as vscode from "vscode";

export async function setApiKey(
  context: vscode.ExtensionContext,
  secretKey: string
): Promise<void> {
  const apiKey = await vscode.window.showInputBox({
    prompt: "Enter your OpenAI-compatible API key",
    password: true,
    ignoreFocusOut: true
  });

  if (!apiKey) {
    vscode.window.showInformationMessage("API key not set.");
    return;
  }

  await context.secrets.store(secretKey, apiKey);
  vscode.window.showInformationMessage("API key saved.");
}
