import { describe, expect, it } from "vitest";
import { createOAuthProvider } from "../src/provider/create-oauth-provider.js";
import { createMemoryOAuthProviderStore } from "../src/provider/memory-store.js";
import { codeChallengeS256, generateCodeVerifier } from "../src/core/pkce.js";

describe("createOAuthProvider", () => {
  it("authorization code + token exchange with PKCE", async () => {
    const provider = createOAuthProvider({
      store: createMemoryOAuthProviderStore(),
    });

    await provider.registerClient({
      clientId: "partner-app",
      clientSecret: "secret",
      redirectUris: ["https://partner.test/callback"],
      allowedScopes: ["openid", "profile"],
    });

    const codeVerifier = generateCodeVerifier();
    const { code } = await provider.createAuthorizationCode({
      clientId: "partner-app",
      redirectUri: "https://partner.test/callback",
      subject: "user-42",
      scopes: ["openid", "profile"],
      codeChallenge: codeChallengeS256(codeVerifier),
    });

    const tokens = await provider.exchangeAuthorizationCode({
      clientId: "partner-app",
      clientSecret: "secret",
      code,
      redirectUri: "https://partner.test/callback",
      codeVerifier,
    });

    expect(tokens.accessToken).toBeTruthy();
    const intro = await provider.introspectAccessToken(tokens.accessToken);
    expect(intro?.subject).toBe("user-42");
  });
});
