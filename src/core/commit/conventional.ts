import type { CommitMessage } from "./types";

export const ALLOWED_TYPES = [
  "feat",
  "fix",
  "docs",
  "refactor",
  "test",
  "chore",
  "build",
  "ci",
  "perf",
  "style",
  "revert"
];

export function formatConventionalCommit(message: CommitMessage): string {
  const type = ALLOWED_TYPES.includes(message.type) ? message.type : "chore";
  const scope = message.scope ? `(${message.scope})` : "";
  const subject = sanitizeSubject(message.subject);
  const body = message.bodyBullets.length
    ? message.bodyBullets.map((line) => `- ${line}`).join("\n")
    : "- update changes";

  return `${type}${scope}: ${subject}\n\n${body}`;
}

export function sanitizeSubject(subject: string): string {
  const trimmed = subject.trim().replace(/\.$/, "");
  return trimmed.slice(0, 72).trim();
}
