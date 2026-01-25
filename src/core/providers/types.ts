import type { ExtensionConfig } from "../config";

export interface DiffPayload {
  diff: string;
  changedPaths: string[];
  mode: "staged" | "workingTree";
  config: ExtensionConfig;
}

export interface MessageProvider {
  id: "account" | "apikey";
  isAvailable(): boolean;
  isUsable(): Promise<boolean>;
  generate(payload: DiffPayload): Promise<string>;
}
