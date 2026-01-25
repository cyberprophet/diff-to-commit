import { describe, expect, it } from "vitest";
import { inferScopeFromPaths } from "../../src/core/commit/scope";

describe("inferScopeFromPaths", () => {
  it("infers scope from dominant top-level folder", () => {
    const scope = inferScopeFromPaths([
      "src/core/file.ts",
      "src/extension/file.ts",
      "src/core/other.ts"
    ]);
    expect(scope).toBe("src");
  });

  it("returns undefined for ambiguous scopes", () => {
    const scope = inferScopeFromPaths(["src/a.ts", "test/b.ts"]);
    expect(scope).toBeUndefined();
  });

  it("returns undefined for root-level files", () => {
    const scope = inferScopeFromPaths(["README.md"]);
    expect(scope).toBeUndefined();
  });
});
