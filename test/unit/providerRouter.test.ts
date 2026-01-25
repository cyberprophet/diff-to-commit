import { describe, expect, it } from "vitest";
import { selectProvider } from "../../src/core/providers/router";
import type { MessageProvider } from "../../src/core/providers/types";

function makeProvider(id: "account" | "apikey", available: boolean, usable: boolean): MessageProvider {
  return {
    id,
    isAvailable: () => available,
    isUsable: async () => usable,
    generate: async () => "message"
  };
}

describe("selectProvider", () => {
  it("prefers account provider in auto mode when usable", async () => {
    const account = makeProvider("account", true, true);
    const apikey = makeProvider("apikey", true, true);
    const result = await selectProvider("auto", { account, apikey });
    expect(result?.id).toBe("account");
  });

  it("falls back to api key in auto mode when account unusable", async () => {
    const account = makeProvider("account", true, false);
    const apikey = makeProvider("apikey", true, true);
    const result = await selectProvider("auto", { account, apikey });
    expect(result?.id).toBe("apikey");
  });

  it("returns null in account mode when unavailable", async () => {
    const account = makeProvider("account", false, false);
    const apikey = makeProvider("apikey", true, true);
    const result = await selectProvider("account", { account, apikey });
    expect(result).toBeNull();
  });

  it("uses api key in apikey mode when usable", async () => {
    const account = makeProvider("account", true, true);
    const apikey = makeProvider("apikey", true, true);
    const result = await selectProvider("apikey", { account, apikey });
    expect(result?.id).toBe("apikey");
  });

  it("returns null when no provider is usable", async () => {
    const account = makeProvider("account", true, false);
    const apikey = makeProvider("apikey", true, false);
    const result = await selectProvider("auto", { account, apikey });
    expect(result).toBeNull();
  });
});
