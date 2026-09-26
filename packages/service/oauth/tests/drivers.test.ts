import { describe, expect, it } from "vitest";
import { createAppleOAuthDriver } from "../src/client/apple-driver.js";
import { createGitHubOAuthDriver } from "../src/client/github-driver.js";
import { createMicrosoftOAuthDriver } from "../src/client/microsoft-driver.js";
import { OAUTH_PRESET_PROVIDERS } from "../src/client/driver-catalog.js";
import { codeChallengeS256, generateCodeVerifier } from "../src/core/pkce.js";

describe("preset drivers", () => {
  it("catalog lists every preset id", () => {
    expect(OAUTH_PRESET_PROVIDERS.length).toBeGreaterThanOrEqual(15);
    expect(OAUTH_PRESET_PROVIDERS).toContain("google");
    expect(OAUTH_PRESET_PROVIDERS).toContain("microsoft");
  });

  it("microsoft builds authorize URL with PKCE", () => {
    const driver = createMicrosoftOAuthDriver({
      clientId: "cid",
      clientSecret: "sec",
      tenantId: "common",
    });
    const url = new URL(
      driver.buildAuthorizationUrl({
        redirectUri: "https://app.test/cb",
        state: "st",
        codeChallenge: codeChallengeS256(generateCodeVerifier()),
      }),
    );
    expect(url.hostname).toBe("login.microsoftonline.com");
    expect(url.pathname).toContain("/oauth2/v2.0/authorize");
    expect(url.searchParams.get("code_challenge_method")).toBe("S256");
  });

  it("github exchange with mocked fetch", async () => {
    const driver = createGitHubOAuthDriver({
      clientId: "cid",
      clientSecret: "sec",
      fetch: async (input, init) => {
        const url = String(input);
        if (url.includes("access_token")) {
          return new Response(JSON.stringify({ access_token: "gho_test", token_type: "bearer" }), {
            status: 200,
            headers: { "content-type": "application/json" },
          });
        }
        if (url.includes("api.github.com/user") && !url.includes("emails")) {
          return new Response(
            JSON.stringify({ id: 99, login: "octo", name: "Octo", avatar_url: "https://a.test/x.png" }),
            { status: 200 },
          );
        }
        return new Response("[]", { status: 200 });
      },
    });

    const result = await driver.exchangeAuthorizationCode({
      code: "code",
      redirectUri: "https://app.test/cb",
      codeVerifier: generateCodeVerifier(),
    });
    expect(result.profile.subject).toBe("99");
    expect(result.profile.provider).toBe("github");
  });

  it("apple authorize uses form_post", () => {
    const driver = createAppleOAuthDriver({
      clientId: "com.test.app",
      teamId: "TEAM",
      keyId: "KEY",
      privateKeyPem: "unused",
      clientSecret: "static-secret-for-test",
    });
    const url = new URL(
      driver.buildAuthorizationUrl({
        redirectUri: "https://app.test/cb",
        state: "st",
        codeChallenge: codeChallengeS256(generateCodeVerifier()),
      }),
    );
    expect(url.searchParams.get("response_mode")).toBe("form_post");
  });
});
