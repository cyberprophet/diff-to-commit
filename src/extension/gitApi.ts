import * as vscode from "vscode";

export interface GitInputBox {
  value: string;
}

export interface GitRepository {
  rootUri: vscode.Uri;
  inputBox: GitInputBox;
}

export interface GitAPI {
  repositories: GitRepository[];
}

export async function getGitApi(): Promise<GitAPI> {
  const extension = vscode.extensions.getExtension("vscode.git");
  if (!extension) {
    throw new Error("Git extension not found");
  }
  const activated = extension.isActive ? extension : await extension.activate();
  const api = (activated.exports as { getAPI: (version: number) => GitAPI }).getAPI(1);
  if (!api) {
    throw new Error("Git API not available");
  }
  return api;
}

export function pickRepository(
  api: GitAPI,
  workspaceFolder?: vscode.WorkspaceFolder
): GitRepository | undefined {
  if (api.repositories.length === 0) {
    return undefined;
  }
  if (api.repositories.length === 1 || !workspaceFolder) {
    return api.repositories[0];
  }

  return api.repositories.find((repo) =>
    isDescendant(workspaceFolder.uri.fsPath, repo.rootUri.fsPath)
  );
}

function isDescendant(child: string, parent: string): boolean {
  const normalizedChild = child.replace(/\\/g, "/");
  const normalizedParent = parent.replace(/\\/g, "/");
  return normalizedChild === normalizedParent || normalizedChild.startsWith(`${normalizedParent}/`);
}
