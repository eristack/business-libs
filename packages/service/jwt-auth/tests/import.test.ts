import { describe, expect, it } from "vitest";

describe("package import", () => {
  it("loads createJwtAuth without Node crypto.scrypt at module evaluation", async () => {
    const mod = await import("../src/index.js");
    expect(mod.createJwtAuth).toBeTypeOf("function");
    expect(mod.hashPassword).toBeTypeOf("function");
  });

  it("createJwtAuth works immediately after import (no credentials path)", async () => {
    const { createJwtAuth, createMemoryRefreshTokenStore } = await import(
      "../src/index.js"
    );
    const auth = createJwtAuth({
      accessSecret: "test-secret-at-least-16-chars",
      accessTokenTtl: "15m",
      refreshTokenTtl: "7d",
      store: createMemoryRefreshTokenStore(),
      issuer: "import-test",
    });

    const pair = await auth.issueTokens({ subject: "user-1" });
    const verified = await auth.verifyAccessToken(pair.accessToken);
    expect(verified.subject).toBe("user-1");
  });
});
