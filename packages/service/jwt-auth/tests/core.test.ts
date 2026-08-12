import { describe, expect, it } from "vitest";
import {
  createJwtAuth,
  createMemoryCredentialStore,
  createMemoryRefreshTokenStore,
  InvalidAccessTokenError,
  InvalidCredentialsError,
  InvalidRefreshTokenError,
  RefreshTokenReuseError,
  SessionNotFoundError,
  UsernameTakenError,
} from "../src/index.js";

function createAuth(credentials = false) {
  return createJwtAuth({
    accessSecret: "test-secret-at-least-16-chars",
    accessTokenTtl: "15m",
    refreshTokenTtl: "7d",
    store: createMemoryRefreshTokenStore(),
    ...(credentials ? { credentials: createMemoryCredentialStore() } : {}),
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

  it("lists active sessions and revokes by session id", async () => {
    const auth = createAuth();
    const a = await auth.issueTokens({ subject: "user-1" });
    const b = await auth.issueTokens({ subject: "user-1" });

    const sessions = await auth.listSessions("user-1");
    expect(sessions.items).toHaveLength(2);
    expect(sessions.items.map((s) => s.id).sort()).toEqual([a.sessionId, b.sessionId].sort());

    await auth.revokeSession({ sessionId: a.sessionId, subject: "user-1" });

    await expect(auth.refresh(a.refreshToken)).rejects.toBeInstanceOf(
      RefreshTokenReuseError,
    );
    const remaining = await auth.listSessions("user-1");
    expect(remaining.items).toHaveLength(1);
    expect(remaining.items[0]?.id).toBe(b.sessionId);

    await expect(
      auth.revokeSession({ sessionId: a.sessionId, subject: "user-2" }),
    ).rejects.toBeInstanceOf(SessionNotFoundError);
  });

  it("registers credentials, logs in, and rejects bad passwords", async () => {
    const auth = createAuth(true);
    await auth.registerCredentials({
      subject: "user-1",
      username: "Demo",
      password: "password123",
    });

    await expect(
      auth.registerCredentials({
        subject: "user-2",
        username: "demo",
        password: "password123",
      }),
    ).rejects.toBeInstanceOf(UsernameTakenError);

    const pair = await auth.login({ username: "demo", password: "password123" });
    const verified = await auth.verifyAccessToken(pair.accessToken);
    expect(verified.subject).toBe("user-1");

    await expect(
      auth.login({ username: "demo", password: "wrong-password" }),
    ).rejects.toBeInstanceOf(InvalidCredentialsError);
  });

  it("changes password and invalidates the old one", async () => {
    const auth = createAuth(true);
    await auth.registerCredentials({
      subject: "user-1",
      username: "demo",
      password: "password123",
    });

    await auth.changePassword({
      subject: "user-1",
      currentPassword: "password123",
      newPassword: "password456",
    });

    await expect(
      auth.login({ username: "demo", password: "password123" }),
    ).rejects.toBeInstanceOf(InvalidCredentialsError);

    const pair = await auth.login({
      username: "demo",
      password: "password456",
    });
    expect(pair.accessToken).toBeTruthy();
  });
});
