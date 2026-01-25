import { describe, expect, it } from "vitest";
import { getChangedPathsFromDiff } from "../../src/core/git/paths";

describe("getChangedPathsFromDiff", () => {
  it("extracts paths from diff headers", () => {
    const diff = [
      "diff --git a/src/a.ts b/src/a.ts",
      "index 123..456 100644",
      "--- a/src/a.ts",
      "+++ b/src/a.ts",
      "diff --git a/README.md b/README.md"
    ].join("\n");
    const paths = getChangedPathsFromDiff(diff);
    expect(paths).toContain("src/a.ts");
    expect(paths).toContain("README.md");
  });
});
