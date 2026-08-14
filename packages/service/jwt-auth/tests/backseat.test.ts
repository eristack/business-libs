import { describe, expect, it } from "vitest";
import { createJwtAuth } from "../src/core/create-jwt-auth.js";
import { createBackseatJwtAuthStores } from "../src/backseat/index.js";

describe("backseat jwt-auth stores", () => {
  it("persists credentials and refresh tokens", async () => {
    const { credentials, refreshTokens } = createBackseatJwtAuthStores();
    const auth = createJwtAuth({
      credentials,
      store: refreshTokens,
      accessSecret: "test-access-secret-min-32-chars!!",
      refreshSecret: "test-refresh-secret-min-32-chars!",
    });

    await auth.registerCredentials({
      subject: "u1",
      username: "alice",
      password: "secret123",
    });

    const pair = await auth.login({ username: "alice", password: "secret123" });
    expect(pair.accessToken).toBeTruthy();

    const cred = await credentials.findByUsername("alice");
    expect(cred?.subject).toBe("u1");
  });
});
