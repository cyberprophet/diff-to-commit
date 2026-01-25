export interface ExtensionConfig {
  baseUrl: string;
  model: string;
  allowOverwrite: boolean;
  maxDiffChars: number;
  language: "english" | "korean" | "auto";
}
