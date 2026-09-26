import request from "supertest";
import { describe, expect, it } from "vitest";
import { createTestOAuthConsumerApp } from "./helpers.js";

describe("express oauth consumer E2E", () => {
  it("login redirect then callback returns profile", async () => {
    const { app, redirectUri } = createTestOAuthConsumerApp();

    const login = await request(app)
      .get("/oauth/memory/login")
      .query({ redirect_uri: redirectUri });

    expect(login.status).toBe(302);
    const location = login.headers.location as string;
    expect(location).toContain("memory-idp.test");

    const url = new URL(location);
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state");

    const callback = await request(app)
      .get("/oauth/memory/callback")
      .query({ code, state });

    expect(callback.status).toBe(200);
    expect(callback.body.profile.provider).toBe("memory");
  });
});
