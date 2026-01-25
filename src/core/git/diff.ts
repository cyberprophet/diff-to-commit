import { runGit } from "./gitExec";

export interface GetDiffOptions {
  repoRoot: string;
  mode: "staged" | "workingTree";
  maxChars: number;
}

const baseArgs = [
  "-c",
  "core.quotepath=false",
  "--no-ext-diff",
  "--no-color",
  "diff",
  "-U3"
];

export async function getDiff(options: GetDiffOptions): Promise<string> {
  const args = options.mode === "staged" ? [...baseArgs, "--staged"] : baseArgs;
  const diff = await runGit(args, { cwd: options.repoRoot });
  if (diff.length <= options.maxChars) {
    return diff;
  }
  return truncateDiff(diff, options.maxChars);
}

function truncateDiff(diff: string, maxChars: number): string {
  const headerMatches = diff.match(/^diff --git .*$/gm) ?? [];
  const headerBlock = headerMatches.join("\n");
  const remaining = maxChars - headerBlock.length - 50;
  if (remaining <= 0) {
    return headerBlock.slice(0, maxChars);
  }
  const body = diff.slice(0, remaining);
  return `${headerBlock}\n\n${body}\n\n[Diff truncated]`;
}
