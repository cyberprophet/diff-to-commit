import * as vscode from "vscode";
import type { MessageProvider, DiffPayload } from "../../core/providers/types";
import {
  isCopilotAvailable,
  sendCopilotChatRequest,
  clearCopilotTokenCache,
} from "../../core/copilot/copilotClient";
import { buildPrompt, parseCommitMessageJson } from "../../core/ai/prompt";
import { formatConventionalCommit, sanitizeSubject } from "../../core/commit/conventional";
import { inferScopeFromPaths } from "../../core/commit/scope";

const GITHUB_PROVIDER_ID = "github";
const GITHUB_SCOPES = ["read:user"];

export class CopilotProvider implements MessageProvider {
  public readonly id = "account" as const;
  private readonly context: vscode.ExtensionContext;

  public constructor(context: vscode.ExtensionContext) {
    this.context = context;
  }

  public isAvailable(): boolean {
    return true;
  }

  public async isUsable(): Promise<boolean> {
    const session = await this.getSession(false);
    if (!session) {
      return false;
    }
    return isCopilotAvailable(session.accessToken);
  }

  public async generate(payload: DiffPayload): Promise<string> {
    const session = await this.getSession(false);
    if (!session) {
      throw new Error("GitHub account not signed in.");
    }

    const scopeHint = inferScopeFromPaths(payload.changedPaths);
    const prompt = buildPrompt({
      diff: payload.diff,
      scopeHint,
      changedPaths: payload.changedPaths,
      language: payload.config.language,
    });

    const response = await sendCopilotChatRequest(
      session.accessToken,
      [
        {
          role: "system",
          content: "You are a commit message generator. Follow instructions strictly.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      "gpt-4o"
    );

    const content = response.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error("Copilot response missing content");
    }

    const message = parseCommitMessageJson(content);
    message.subject = sanitizeSubject(message.subject);
    if (!message.scope && scopeHint) {
      message.scope = scopeHint;
    }

    return formatConventionalCommit(message);
  }

  private async getSession(
    createIfNone: boolean
  ): Promise<vscode.AuthenticationSession | undefined> {
    return vscode.authentication.getSession(GITHUB_PROVIDER_ID, GITHUB_SCOPES, {
      createIfNone,
    });
  }

  public clearCache(): void {
    clearCopilotTokenCache();
  }
}
