import * as vscode from "vscode";
import type { MessageProvider, DiffPayload } from "../../core/providers/types";
import { generateMessageFromDiff } from "../../core/commit/message";

export class AccountProvider implements MessageProvider {
  public readonly id = "account" as const;
  private readonly context: vscode.ExtensionContext;
  private readonly config: DiffPayload["config"];

  public constructor(context: vscode.ExtensionContext, config: DiffPayload["config"]) {
    this.context = context;
    this.config = config;
  }

  public isAvailable(): boolean {
    if (!this.config.accountProviderId || this.config.accountScopes.length === 0) {
      return false;
    }
    if (!this.config.accountBaseUrl) {
      return false;
    }
    return true;
  }

  public async isUsable(): Promise<boolean> {
    const session = await this.getSession(false);
    if (!session) {
      return false;
    }
    if (!this.config.accountUsableEndpoint) {
      return false;
    }
    const response = await fetch(this.buildUrl(this.config.accountUsableEndpoint), {
      method: "GET",
      headers: {
        [this.config.accountAuthHeaderName]:
          `${this.config.accountAuthHeaderPrefix}${session.accessToken}`
      }
    });
    return response.ok;
  }

  public async generate(payload: DiffPayload): Promise<string> {
    const session = await this.getSession(false);
    if (!session) {
      throw new Error("Account not signed in.");
    }
    return generateMessageFromDiff({
      diff: payload.diff,
      changedPaths: payload.changedPaths,
      mode: payload.mode,
      config: payload.config,
      apiKey: session.accessToken,
      baseUrl: this.config.accountBaseUrl,
      headers: {
        [this.config.accountAuthHeaderName]:
          `${this.config.accountAuthHeaderPrefix}${session.accessToken}`
      }
    });
  }

  private async getSession(createIfNone: boolean): Promise<vscode.AuthenticationSession | undefined> {
    if (!this.isAvailable()) {
      return undefined;
    }
    return vscode.authentication.getSession(
      this.config.accountProviderId,
      this.config.accountScopes,
      { createIfNone }
    );
  }

  private buildUrl(path: string): string {
    const base = this.config.accountBaseUrl.replace(/\/$/, "");
    const suffix = path.startsWith("/") ? path : `/${path}`;
    return `${base}${suffix}`;
  }
}
