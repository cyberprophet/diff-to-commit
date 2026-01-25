import * as vscode from "vscode";
import type { ExtensionConfig } from "../core/config";

export function getConfig(): ExtensionConfig {
  const config = vscode.workspace.getConfiguration("diffToCommit");

  return {
    baseUrl: config.get<string>("ai.baseUrl", "https://api.openai.com/v1"),
    model: config.get<string>("ai.model", "gpt-4o-mini"),
    allowOverwrite: config.get<boolean>("behavior.allowOverwrite", false),
    maxDiffChars: config.get<number>("diff.maxChars", 20000),
    language: config.get<"english" | "korean" | "auto">("output.language", "english"),
    backend: config.get<"auto" | "account" | "apikey">("backend", "auto"),
    accountProviderId: config.get<string>("account.providerId", "github"),
    accountScopes: config.get<string[]>("account.scopes", ["read:user"]),
    accountBaseUrl: config.get<string>("account.baseUrl", ""),
    accountAuthHeaderName: config.get<string>("account.authHeaderName", "Authorization"),
    accountAuthHeaderPrefix: config.get<string>("account.authHeaderPrefix", "Bearer "),
    accountUsableEndpoint: config.get<string>("account.usableEndpoint", "/v1/models")
  };
}
