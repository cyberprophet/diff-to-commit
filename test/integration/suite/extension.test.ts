import * as assert from "node:assert";
import * as vscode from "vscode";

interface GitAPI {
  repositories: Array<{
    inputBox: { value: string };
  }>;
}

suite("Diff to Commit Extension", () => {
  test("fills SCM input box for staged diff", async () => {
    const gitExtension = vscode.extensions.getExtension("vscode.git");
    assert.ok(gitExtension, "Git extension not found");
    const activated = gitExtension.isActive
      ? gitExtension
      : await gitExtension.activate();
    const gitApi = (activated.exports as { getAPI: (version: number) => GitAPI }).getAPI(1);
    const repo = gitApi.repositories[0];
    assert.ok(repo, "No repository found");

    const inputBox = repo.inputBox;
    inputBox.value = "";

    await vscode.commands.executeCommand(
      "diff-to-commit.fillMessageStaged"
    );

    assert.ok(inputBox.value.includes("chore(test):"));
  });
});
