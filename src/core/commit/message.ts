import type { ExtensionConfig } from "../config";
import { buildPromptInput, requestCommitMessage } from "../ai/openaiClient";
import { formatConventionalCommit, sanitizeSubject } from "./conventional";
import { inferScopeFromPaths } from "./scope";

export async function generateMessageFromDiff(args: {
  diff: string;
  changedPaths: string[];
  mode: "staged" | "workingTree";
  config: ExtensionConfig;
  apiKey: string;
  baseUrl?: string;
  model?: string;
  headers?: Record<string, string>;
}): Promise<string> {
  const scopeHint = inferScopeFromPaths(args.changedPaths);
  const prompt = buildPromptInput({
    diff: args.diff,
    scopeHint,
    changedPaths: args.changedPaths,
    language: args.config.language
  });

  const message = await requestCommitMessage({
    baseUrl: args.baseUrl ?? args.config.baseUrl,
    model: args.model ?? args.config.model,
    apiKey: args.apiKey,
    prompt,
    headers: args.headers
  });

  message.subject = sanitizeSubject(message.subject);
  if (!message.scope && scopeHint) {
    message.scope = scopeHint;
  }

  return formatConventionalCommit(message);
}
