import { describe, expect, it } from "vitest";
import { suggestPackageFromStackTrace } from "../src/suggest-package.js";

describe("suggestPackageFromStackTrace", () => {
  it("maps monorepo stack paths to @eristack package names", () => {
    const trace = `
Error: boom
    at foo (/Users/dev/business-libs/packages/capability/qups/src/core/calculate.ts:12:3)
    at bar (/Users/dev/business-libs/packages/service/jwt-auth/src/core/login.ts:4:1)
`;
    expect(suggestPackageFromStackTrace(trace)).toBe("@eristack/qups");
  });

  it("returns null when no packages path matches", () => {
    expect(suggestPackageFromStackTrace("at app/src/main.ts:1:1")).toBeNull();
  });
});
