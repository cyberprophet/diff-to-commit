import { describe, expect, it } from "vitest";
import { maskSensitive } from "../../src/core/redact/redact";

describe("maskSensitive", () => {
  it("redacts authorization bearer token", () => {
    const input = "Authorization: Bearer abc123TOKEN==";
    const output = maskSensitive(input);
    expect(output).toContain("Authorization: Bearer [REDACTED]");
  });

  it("redacts api key assignments", () => {
    const input = "api_key=supersecretvalue";
    const output = maskSensitive(input);
    expect(output).toContain("api_key: [REDACTED]");
  });

  it("redacts private key blocks", () => {
    const input = "-----BEGIN PRIVATE KEY-----\nABC\n-----END PRIVATE KEY-----";
    const output = maskSensitive(input);
    expect(output).toContain("[REDACTED_PRIVATE_KEY]");
  });
});
