import express from "express";
import request from "supertest";
import { describe, expect, it } from "vitest";
import {
  createJwtAuth,
  createMemoryCredentialStore,
  createMemoryRefreshTokenStore,
} from "../src/index.js";
import { createJwtAuthRouter } from "../src/express/index.js";

function createTestApp() {
  const jwtAuth = createJwtAuth({
    accessSecret: "test-secret-at-least-16-chars",
    store: createMemoryRefreshTokenStore(),
    credentials: createMemoryCredentialStore(),
  });

  const app = express();
  app.use(express.json());
  app.use(
    "/auth",
    createJwtAuthRouter({ jwtAuth, refreshTokenTransport: "body" }),
  );

  return { app, jwtAuth };
}

describe("express jwt-auth supertest E2E", () => {
  it("login, refresh, list sessions, and revoke", async () => {
    const { app, jwtAuth } = createTestApp();
    await jwtAuth.registerCredentials({
      subject: "user-1",
      username: "demo",
      password: "password123",
    });

    const login = await request(app)
      .post("/auth/login")
      .send({ username: "demo", password: "password123" });

    expect(login.status).toBe(200);
    const { accessToken, refreshToken } = login.body as {
      accessToken: string;
      refreshToken: string;
    };
    expect(accessToken).toBeTruthy();
    expect(refreshToken).toBeTruthy();

    const refresh = await request(app)
      .post("/auth/refresh")
      .send({ refreshToken });

    expect(refresh.status).toBe(200);
    const nextAccess = (refresh.body as { accessToken: string }).accessToken;
    expect(nextAccess).toBeTruthy();

    const sessions = await request(app)
      .get("/auth/sessions")
      .set("Authorization", `Bearer ${nextAccess}`);

    expect(sessions.status).toBe(200);
    const items = (sessions.body as { items: { id: string }[] }).items;
    expect(items.length).toBeGreaterThan(0);
    const sessionId = items[0]!.id;

    const revoke = await request(app)
      .delete(`/auth/sessions/${sessionId}`)
      .set("Authorization", `Bearer ${nextAccess}`);

    expect(revoke.status).toBe(200);

    const after = await request(app)
      .get("/auth/sessions")
      .set("Authorization", `Bearer ${nextAccess}`);

    expect(after.status).toBe(200);
    expect((after.body as { items: unknown[] }).items).toEqual([]);
  });
});
