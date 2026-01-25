import type { MessageProvider } from "./types";

export type BackendMode = "auto" | "account" | "apikey";

export async function selectProvider(
  mode: BackendMode,
  providers: { account: MessageProvider; apikey: MessageProvider }
): Promise<MessageProvider | null> {
  const accountAvailable = providers.account.isAvailable();
  const apiKeyAvailable = providers.apikey.isAvailable();

  if (mode === "account") {
    if (!accountAvailable) {
      return null;
    }
    return (await providers.account.isUsable()) ? providers.account : null;
  }

  if (mode === "apikey") {
    if (!apiKeyAvailable) {
      return null;
    }
    return (await providers.apikey.isUsable()) ? providers.apikey : null;
  }

  if (accountAvailable && (await providers.account.isUsable())) {
    return providers.account;
  }

  if (apiKeyAvailable && (await providers.apikey.isUsable())) {
    return providers.apikey;
  }

  return null;
}
