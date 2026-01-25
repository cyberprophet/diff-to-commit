import * as path from "node:path";
import * as fs from "node:fs";
import { execSync } from "node:child_process";
import { runTests } from "@vscode/test-electron";

async function main(): Promise<void> {
  const repoRoot = path.resolve(__dirname, "../../../../");
  const extensionDevelopmentPath = repoRoot;
  const extensionTestsPath = path.resolve(
    repoRoot,
    "test/integration/suite/index.js"
  );
  const fixtureRepo = path.resolve(repoRoot, "test/integration/fixtures/repo");

  prepareFixtureRepo(fixtureRepo);

  await runTests({
    extensionDevelopmentPath,
    extensionTestsPath,
    launchArgs: [fixtureRepo],
    extensionTestsEnv: {
      DIFF_TO_COMMIT_TEST_MODE: "1"
    }
  });
}

function prepareFixtureRepo(repoPath: string): void {
  if (!fs.existsSync(repoPath)) {
    fs.mkdirSync(repoPath, { recursive: true });
  }

  const gitDir = path.join(repoPath, ".git");
  if (!fs.existsSync(gitDir)) {
    execSync("git init", { cwd: repoPath, stdio: "ignore" });
    execSync("git config user.email test@example.com", {
      cwd: repoPath,
      stdio: "ignore"
    });
    execSync("git config user.name Test User", {
      cwd: repoPath,
      stdio: "ignore"
    });
    fs.writeFileSync(path.join(repoPath, "README.md"), "hello\n");
    execSync("git add README.md", { cwd: repoPath, stdio: "ignore" });
    execSync("git commit -m \"chore: init\"", { cwd: repoPath, stdio: "ignore" });
  }

  fs.writeFileSync(path.join(repoPath, "README.md"), "hello world\n");
  execSync("git add README.md", { cwd: repoPath, stdio: "ignore" });
}

main().catch((error) => {
  console.error("Failed to run tests", error);
  process.exit(1);
});
