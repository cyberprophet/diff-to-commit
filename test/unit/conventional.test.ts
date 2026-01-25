import { describe, expect, it } from "vitest";
import { formatConventionalCommit, sanitizeSubject } from "../../src/core/commit/conventional";

describe("conventional commit formatting", () => {
  it("formats type scope and bullet body", () => {
    const message = formatConventionalCommit({
      type: "feat",
      scope: "core",
      subject: "add diff parser",
      bodyBullets: ["add parser", "add tests"]
    });
    expect(message).toBe(
      "feat(core): add diff parser\n\n- add parser\n- add tests"
    );
  });

  it("truncates subject to 72 characters", () => {
    const longSubject = "a".repeat(80);
    const trimmed = sanitizeSubject(longSubject);
    expect(trimmed.length).toBeLessThanOrEqual(72);
  });
});
