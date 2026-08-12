import { describe, expect, it } from "vitest";
import {
  createJwtAuth,
  createMemoryCredentialStore,
  createMemoryRefreshTokenStore,
} from "../src/index.js";
import {
  createRequireAuth,
  createRestActions,
} from "../src/rest/index.js";

function createHarness(withCredentials = false) {
  const jwtAuth = createJwtAuth({
    accessSecret: "test-secret-at-least-16-chars",
    store: createMemoryRefreshTokenStore(),
    ...(withCredentials
      ? { credentials: createMemoryCredentialStore() }
      : {}),
  });
  const actions = createRestActions({
    jwtAuth,
    refreshTokenTransport: "body",
  });
  return { jwtAuth, actions };
}

describe("rest actions", () => {
  it("issues and refreshes tokens through headless actions", async () => {
    const { actions } = createHarness();

    const issued = await actions.issue({
      headers: { get: () => null },
      body: { subject: "user-1", claims: { plan: "pro" } },
    });

    expect(issued.status).toBe(201);
    const issuedBody = issued.body as {
      accessToken: string;
      refreshToken: string;
    };

    const refreshed = await actions.refresh({
      headers: { get: () => null },
      body: { refreshToken: issuedBody.refreshToken },
    });

    expect(refreshed.status).toBe(200);
    expect((refreshed.body as { accessToken: string }).accessToken).toBeTruthy();
  });

  it("requireAuth accepts bearer tokens", async () => {
    const { jwtAuth, actions } = createHarness();
    const issued = await actions.issue({
      headers: { get: () => null },
      body: { subject: "user-1" },
    });
    const accessToken = (issued.body as { accessToken: string }).accessToken;
    const requireAuth = createRequireAuth({ jwtAuth });

    const ok = await requireAuth({
      headers: {
        get: (name) =>
          name.toLowerCase() === "authorization"
            ? `Bearer ${accessToken}`
            : null,
      },
    });

    expect(ok.ok).toBe(true);
    if (ok.ok) {
      expect(ok.auth.subject).toBe("user-1");
    }
  });

  it("lists and revokes sessions with access token", async () => {
    const { actions } = createHarness();
    const issued = await actions.issue({
      headers: { get: () => null },
      body: { subject: "user-1" },
    });
    const body = issued.body as {
      accessToken: string;
      refreshToken: string;
      sessionId: string;
    };

    const listed = await actions.listSessions({
      headers: {
        get: (name) =>
          name.toLowerCase() === "authorization"
            ? `Bearer ${body.accessToken}`
            : null,
      },
    });
    expect(listed.status).toBe(200);
    expect((listed.body as { items: { id: string }[] }).items).toEqual([
      expect.objectContaining({ id: body.sessionId }),
    ]);

    const revoked = await actions.revokeSession({
      headers: {
        get: (name) =>
          name.toLowerCase() === "authorization"
            ? `Bearer ${body.accessToken}`
            : null,
      },
      params: { sessionId: body.sessionId },
    });
    expect(revoked.status).toBe(200);

    const after = await actions.listSessions({
      headers: {
        get: (name) =>
          name.toLowerCase() === "authorization"
            ? `Bearer ${body.accessToken}`
            : null,
      },
    });
    expect((after.body as { items: unknown[] }).items).toEqual([]);
  });

  it("logout clears the refresh token", async () => {
    const { actions } = createHarness();
    const issued = await actions.issue({
      headers: { get: () => null },
      body: { subject: "user-1" },
    });
    const refreshToken = (issued.body as { refreshToken: string }).refreshToken;

    const logout = await actions.logout({
      headers: { get: () => null },
      body: { refreshToken },
    });
    expect(logout.status).toBe(200);

    const refresh = await actions.refresh({
      headers: { get: () => null },
      body: { refreshToken },
    });
    expect(refresh.status).toBe(401);
  });

  it("logs in with username/password", async () => {
    const { jwtAuth, actions } = createHarness(true);
    await jwtAuth.registerCredentials({
      subject: "user-1",
      username: "demo",
      password: "password123",
    });

    const loggedIn = await actions.login({
      headers: { get: () => null },
      body: { username: "demo", password: "password123" },
    });
    expect(loggedIn.status).toBe(200);
    expect((loggedIn.body as { accessToken: string }).accessToken).toBeTruthy();

    const bad = await actions.login({
      headers: { get: () => null },
      body: { username: "demo", password: "nope" },
    });
    expect(bad.status).toBe(401);
  });
});
