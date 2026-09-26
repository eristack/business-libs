import { randomBytes } from "node:crypto";
import type { OAuthConsumerDriver } from "../core/types.js";

/** Unit tests and Backseat — simulates an IdP without network. */
export function createMemoryOAuthIdpDriver(provider = "memory"): OAuthConsumerDriver {
  const codes = new Set<string>();

  return {
    provider,
    buildAuthorizationUrl(input) {
      const code = `mem_code_${randomBytes(8).toString("hex")}`;
      codes.add(code);
      const url = new URL("https://memory-idp.test/authorize");
      url.searchParams.set("code", code);
      url.searchParams.set("state", input.state);
      return url.toString();
    },
    async exchangeAuthorizationCode(input) {
      if (!codes.has(input.code)) {
        throw new Error("Invalid authorization code");
      }
      codes.delete(input.code);
      return {
        tokens: {
          accessToken: `mem_access_${input.code}`,
          tokenType: "Bearer",
          expiresIn: 3600,
        },
        profile: {
          provider,
          subject: `mem_sub_${input.code.slice(-8)}`,
          email: "user@memory-idp.test",
          emailVerified: true,
          name: "Memory IdP User",
          raw: { sub: `mem_sub_${input.code.slice(-8)}` },
        },
      };
    },
  };
}
