import { describe, expect, it } from "vitest";
import {
  createJwtAuth,
  createMemoryRefreshTokenStore,
  InvalidAccessTokenError,
  InvalidRefreshTokenError,
  RefreshTokenReuseError,
} from "../src/index.js";

function createAuth() {
  return createJwtAuth({
    accessSecret: "test-secret-at-least-16-chars",
    accessTokenTtl: "15m",
    refreshTokenTtl: "7d",
    store: createMemoryRefreshTokenStore(),
    issuer: "eristack-test",
  });
}

describe("createJwtAuth", () => {
  it("issues and verifies access tokens", async () => {
    const auth = createAuth();
    const pair = await auth.issueTokens({
      subject: "user-1",
      claims: { role: "admin" },
    });

    const verified = await auth.verifyAccessToken(pair.accessToken);
    expect(verified.subject).toBe("user-1");
    expect(verified.claims.role).toBe("admin");
    expect(pair.tokenType).toBe("Bearer");
  });

  it("rotates refresh tokens and rejects the old one as reuse", async () => {
    const auth = createAuth();
    const first = await auth.issueTokens({ subject: "user-1" });
    const second = await auth.refresh(first.refreshToken);

    expect(second.refreshToken).not.toBe(first.refreshToken);

    await expect(auth.refresh(first.refreshToken)).rejects.toBeInstanceOf(
      RefreshTokenReuseError,
    );
  });

  it("rejects invalid refresh tokens", async () => {
    const auth = createAuth();
    await expect(auth.refresh("not-a-real-token")).rejects.toBeInstanceOf(
      InvalidRefreshTokenError,
    );
  });

  it("revokes a refresh token", async () => {
    const auth = createAuth();
    const pair = await auth.issueTokens({ subject: "user-1" });
    await auth.revoke(pair.refreshToken);
    await expect(auth.refresh(pair.refreshToken)).rejects.toBeInstanceOf(
      RefreshTokenReuseError,
    );
  });

  it("revokes all tokens for a subject", async () => {
    const auth = createAuth();
    const a = await auth.issueTokens({ subject: "user-1" });
    const b = await auth.issueTokens({ subject: "user-1" });
    await auth.revokeAllForSubject("user-1");

    await expect(auth.refresh(a.refreshToken)).rejects.toBeInstanceOf(
      RefreshTokenReuseError,
    );
    await expect(auth.refresh(b.refreshToken)).rejects.toBeInstanceOf(
      RefreshTokenReuseError,
    );
  });

  it("rejects invalid access tokens", async () => {
    const auth = createAuth();
    await expect(auth.verifyAccessToken("bad.token.value")).rejects.toBeInstanceOf(
      InvalidAccessTokenError,
    );
  });
});
