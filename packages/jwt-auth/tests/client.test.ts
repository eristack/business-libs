import { describe, expect, it, vi } from "vitest";
import {
  createJwtAuthClient,
  createMemoryTokenStorage,
} from "../src/client/index.js";

describe("createJwtAuthClient", () => {
  it("stores issued tokens and refreshes before expiry", async () => {
    const storage = createMemoryTokenStorage();
    const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      if (url.endsWith("/auth/issue")) {
        return new Response(
          JSON.stringify({
            accessToken: "access-1",
            refreshToken: "refresh-1",
            accessTokenExpiresAt: new Date(Date.now() + 120_000).toISOString(),
            refreshTokenExpiresAt: new Date(Date.now() + 86400000).toISOString(),
            tokenType: "Bearer",
          }),
          { status: 201, headers: { "Content-Type": "application/json" } },
        );
      }
      if (url.endsWith("/auth/refresh")) {
        const body = init?.body ? JSON.parse(String(init.body)) : {};
        expect(body.refreshToken).toBe("refresh-1");
        return new Response(
          JSON.stringify({
            accessToken: "access-2",
            refreshToken: "refresh-2",
            accessTokenExpiresAt: new Date(Date.now() + 120_000).toISOString(),
            refreshTokenExpiresAt: new Date(Date.now() + 86400000).toISOString(),
            tokenType: "Bearer",
          }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        );
      }
      throw new Error(`unexpected url ${url}`);
    });

    const client = createJwtAuthClient({
      baseUrl: () => "https://api.example.com",
      storage,
      fetch: fetchMock as unknown as typeof fetch,
      credentials: "omit",
    });

    await client.issue({ subject: "user-1" });
    expect(await client.getAccessToken()).toBe("access-1");

    const refreshed = await client.refresh();
    expect(refreshed.accessToken).toBe("access-2");
    expect(await storage.getRefreshToken()).toBe("refresh-2");

    client.dispose();
  });

  it("logs in with username/password", async () => {
    const storage = createMemoryTokenStorage();
    const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      expect(url.endsWith("/auth/login")).toBe(true);
      const body = init?.body ? JSON.parse(String(init.body)) : {};
      expect(body).toEqual({ username: "demo", password: "password123" });
      return new Response(
        JSON.stringify({
          accessToken: "access-login",
          refreshToken: "refresh-login",
          accessTokenExpiresAt: new Date(Date.now() + 120_000).toISOString(),
          refreshTokenExpiresAt: new Date(Date.now() + 86400000).toISOString(),
          tokenType: "Bearer",
          sessionId: "sess-1",
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      );
    });

    const client = createJwtAuthClient({
      baseUrl: "https://api.example.com",
      storage,
      fetch: fetchMock as unknown as typeof fetch,
      credentials: "omit",
    });

    const pair = await client.login({ username: "demo", password: "password123" });
    expect(pair.accessToken).toBe("access-login");
    expect(await client.getAccessToken()).toBe("access-login");
    client.dispose();
  });

  it("ensureAccessToken refreshes when near expiry", async () => {
    const storage = createMemoryTokenStorage();
    await storage.setAccessToken("stale");
    await storage.setRefreshToken("refresh-1");
    await storage.setAccessTokenExpiresAt(new Date(Date.now() + 10_000).toISOString());

    const fetchMock = vi.fn(async () => {
      return new Response(
        JSON.stringify({
          accessToken: "fresh",
          refreshToken: "refresh-2",
          accessTokenExpiresAt: new Date(Date.now() + 120_000).toISOString(),
          refreshTokenExpiresAt: new Date(Date.now() + 86400000).toISOString(),
          tokenType: "Bearer",
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      );
    });

    const client = createJwtAuthClient({
      baseUrl: "https://api.example.com",
      storage,
      fetch: fetchMock as unknown as typeof fetch,
      refreshSkewMs: 60_000,
      credentials: "omit",
    });

    const token = await client.ensureAccessToken();
    expect(token).toBe("fresh");
    client.dispose();
  });
});
