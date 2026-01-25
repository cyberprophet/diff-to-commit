import { runGit } from "./gitExec";

export async function resolveRepoRoot(cwd: string): Promise<string> {
  const output = await runGit(["rev-parse", "--show-toplevel"], { cwd });
  const repoRoot = output.trim();
  if (!repoRoot) {
    throw new Error("Unable to resolve repository root");
  }
  return repoRoot;
}
