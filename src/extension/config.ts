import * as vscode from "vscode";
import type { ExtensionConfig } from "../core/config";

export function getConfig(): ExtensionConfig {
  const config = vscode.workspace.getConfiguration("diffToCommit");

  return {
    baseUrl: config.get<string>("ai.baseUrl", "https://api.openai.com/v1"),
    model: config.get<string>("ai.model", "gpt-4o-mini"),
    allowOverwrite: config.get<boolean>("behavior.allowOverwrite", false),
    maxDiffChars: config.get<number>("diff.maxChars", 20000),
    language: config.get<"english" | "korean" | "auto">("output.language", "english")
  };
}
