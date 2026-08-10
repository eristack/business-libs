import { describe, expect, it } from "vitest";
import { createJwtAuth, createMemoryRefreshTokenStore } from "../src/index.js";
import {
  createRequireAuth,
  createRestActions,
} from "../src/rest/index.js";

function createHarness() {
  const jwtAuth = createJwtAuth({
    accessSecret: "test-secret-at-least-16-chars",
    store: createMemoryRefreshTokenStore(),
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
});
