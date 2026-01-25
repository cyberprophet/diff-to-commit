export interface ExtensionConfig {
  baseUrl: string;
  model: string;
  allowOverwrite: boolean;
  maxDiffChars: number;
  language: "english" | "korean" | "auto";
  backend: "auto" | "account" | "apikey";
  accountProviderId: string;
  accountScopes: string[];
  accountBaseUrl: string;
  accountAuthHeaderName: string;
  accountAuthHeaderPrefix: string;
  accountUsableEndpoint: string;
}
