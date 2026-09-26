import { describe, expect, it } from "vitest";
import { createOAuthConsumer } from "../src/core/create-oauth-consumer.js";
import { createMemoryOAuthPendingStore } from "../src/core/memory-pending-store.js";
import { createMemoryOAuthIdpDriver } from "../src/client/memory-idp-driver.js";
import { codeChallengeS256, generateCodeVerifier } from "../src/core/pkce.js";

describe("createOAuthConsumer", () => {
  it("beginLogin + completeLogin with memory IdP", async () => {
    const redirectUri = "https://app.test/cb";
    const consumer = createOAuthConsumer({
      drivers: { memory: createMemoryOAuthIdpDriver("memory") },
      pendingStore: createMemoryOAuthPendingStore(),
      allowedRedirectUris: [redirectUri],
    });

    const begin = await consumer.beginLogin({
      provider: "memory",
      redirectUri,
    });
    expect(begin.authorizationUrl).toContain("memory-idp.test");
    const url = new URL(begin.authorizationUrl);
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state");
    expect(code).toBeTruthy();
    expect(state).toBe(begin.state);

    const done = await consumer.completeLogin({
      provider: "memory",
      query: { code: code!, state: state! },
    });
    expect(done.profile.subject).toContain("mem_sub_");
    expect(done.tokens.accessToken).toContain("mem_access_");
  });
});

describe("PKCE", () => {
  it("S256 challenge round-trip", () => {
    const verifier = generateCodeVerifier();
    expect(codeChallengeS256(verifier)).toMatch(/^[A-Za-z0-9_-]+$/);
  });
});
