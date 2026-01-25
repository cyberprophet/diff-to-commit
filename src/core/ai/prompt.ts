import type { CommitMessage } from "../commit/types";

export interface PromptInput {
  diff: string;
  scopeHint?: string;
  changedPaths: string[];
  language: "english" | "korean" | "auto";
}

export function buildPrompt(input: PromptInput): string {
  const scopeLine = input.scopeHint ? `Scope hint: ${input.scopeHint}` : "Scope hint: (none)";
  const paths = input.changedPaths.length
    ? input.changedPaths.map((p) => `- ${p}`).join("\n")
    : "(no paths detected)";

  return [
    "You are generating a Conventional Commit message from a git diff.",
    "Rules:",
    "- Output JSON only.",
    "- type(scope): subject format.",
    "- subject <= 72 characters.",
    "- bodyBullets is a list of bullet items (no hyphen).",
    "- Use scope based on top-level folder if appropriate; otherwise omit scope.",
    `- Language: ${input.language}.`,
    "- Do not include sensitive data.",
    "JSON shape:",
    "{\"type\":string,\"scope\"?:string,\"subject\":string,\"bodyBullets\":string[]}",
    "\nChanged paths:",
    paths,
    "\n" + scopeLine,
    "\nDiff:",
    input.diff
  ].join("\n");
}

export function parseCommitMessageJson(raw: string): CommitMessage {
  const jsonText = extractJson(raw);
  const parsed = JSON.parse(jsonText) as CommitMessage;

  return {
    type: parsed.type ?? "chore",
    scope: parsed.scope,
    subject: parsed.subject ?? "update changes",
    bodyBullets: Array.isArray(parsed.bodyBullets) ? parsed.bodyBullets : []
  };
}

function extractJson(raw: string): string {
  const firstBrace = raw.indexOf("{");
  const lastBrace = raw.lastIndexOf("}");
  if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
    throw new Error("AI response did not contain JSON");
  }
  return raw.slice(firstBrace, lastBrace + 1);
}
