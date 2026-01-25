import type * as vscode from "vscode";
import type { MessageProvider, DiffPayload } from "../../core/providers/types";
import { generateMessageFromDiff } from "../../core/commit/message";

export class ApiKeyProvider implements MessageProvider {
  public readonly id = "apikey" as const;
  private readonly context: vscode.ExtensionContext;
  private readonly secretKey: string;

  public constructor(context: vscode.ExtensionContext, secretKey: string) {
    this.context = context;
    this.secretKey = secretKey;
  }

  public isAvailable(): boolean {
    return true;
  }

  public async isUsable(): Promise<boolean> {
    const apiKey = await this.context.secrets.get(this.secretKey);
    return Boolean(apiKey);
  }

  public async generate(payload: DiffPayload): Promise<string> {
    const apiKey = await this.context.secrets.get(this.secretKey);
    if (!apiKey) {
      throw new Error("API key not set.");
    }
    return generateMessageFromDiff({
      diff: payload.diff,
      changedPaths: payload.changedPaths,
      mode: payload.mode,
      config: payload.config,
      apiKey
    });
  }
}
