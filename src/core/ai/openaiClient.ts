import { buildPrompt, parseCommitMessageJson } from "./prompt";
import type { CommitMessage } from "../commit/types";

export interface OpenAIRequestOptions {
  baseUrl: string;
  model: string;
  apiKey: string;
  prompt: string;
}

export async function requestCommitMessage(
  options: OpenAIRequestOptions
): Promise<CommitMessage> {
  if (process.env.DIFF_TO_COMMIT_TEST_MODE === "1") {
    return {
      type: "chore",
      scope: "test",
      subject: "update generated commit message",
      bodyBullets: ["add test-mode commit output"]
    };
  }

  const url = buildEndpoint(options.baseUrl);
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${options.apiKey}`
    },
    body: JSON.stringify({
      model: options.model,
      messages: [
        {
          role: "system",
          content:
            "You are a commit message generator. Follow instructions strictly."
        },
        {
          role: "user",
          content: options.prompt
        }
      ],
      temperature: 0.2
    })
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`AI request failed: ${response.status} ${text}`);
  }

  const data = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const content = data.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error("AI response missing content");
  }

  return parseCommitMessageJson(content);
}

export function buildEndpoint(baseUrl: string): string {
  const trimmed = baseUrl.replace(/\/$/, "");
  if (trimmed.endsWith("/v1")) {
    return `${trimmed}/chat/completions`;
  }
  return `${trimmed}/v1/chat/completions`;
}

export function buildPromptInput(args: {
  diff: string;
  scopeHint?: string;
  changedPaths: string[];
  language: "english" | "korean" | "auto";
}): string {
  return buildPrompt({
    diff: args.diff,
    scopeHint: args.scopeHint,
    changedPaths: args.changedPaths,
    language: args.language
  });
}
