import { codeChallengeS256 } from "../core/pkce.js";
import { assertRedirectUriAllowed } from "../core/redirect-uri.js";
import { InvalidRedirectUriError, OAuthProviderError } from "../core/errors.js";
import { hashClientSecret, randomOpaqueToken, verifyClientSecret } from "./crypto.js";
import type { OAuthProviderStore, RegisteredOAuthClient } from "./types.js";

export type OAuthProviderConfig = {
  store: OAuthProviderStore;
  authorizationCodeTtlSeconds?: number;
  accessTokenTtlSeconds?: number;
};

export type RegisterClientInput = {
  clientId: string;
  clientSecret?: string;
  redirectUris: string[];
  allowedScopes?: string[];
};

export function createOAuthProvider(config: OAuthProviderConfig) {
  const codeTtl = config.authorizationCodeTtlSeconds ?? 300;
  const tokenTtl = config.accessTokenTtlSeconds ?? 3600;

  return {
    async registerClient(input: RegisterClientInput): Promise<RegisteredOAuthClient> {
      if (!input.clientId.trim()) {
        throw new OAuthProviderError("INVALID_CLIENT", "clientId is required");
      }
      if (input.redirectUris.length === 0) {
        throw new InvalidRedirectUriError("At least one redirectUri is required");
      }
      const client: RegisteredOAuthClient = {
        clientId: input.clientId,
        clientSecretHash: input.clientSecret
          ? hashClientSecret(input.clientSecret)
          : undefined,
        redirectUris: [...input.redirectUris],
        allowedScopes: input.allowedScopes ?? ["openid", "profile"],
        createdAt: new Date().toISOString(),
      };
      await config.store.saveClient(client);
      return client;
    },

    /** After your UI confirms the logged-in user (jwt-auth), mint a code for the partner redirect. */
    async createAuthorizationCode(input: {
      clientId: string;
      redirectUri: string;
      subject: string;
      scopes: string[];
      codeChallenge: string;
    }): Promise<{ code: string; expiresAt: string }> {
      const client = await config.store.getClient(input.clientId);
      if (!client) throw new OAuthProviderError("INVALID_CLIENT", "Unknown client_id");
      assertRedirectUriAllowed(input.redirectUri, client.redirectUris);

      for (const scope of input.scopes) {
        if (!client.allowedScopes.includes(scope)) {
          throw new OAuthProviderError("INVALID_SCOPE", `Scope not allowed: ${scope}`);
        }
      }

      const code = randomOpaqueToken(24);
      const expiresAt = new Date(Date.now() + codeTtl * 1000).toISOString();
      await config.store.saveAuthorizationCode({
        code,
        clientId: input.clientId,
        redirectUri: input.redirectUri,
        subject: input.subject,
        scopes: input.scopes,
        codeChallenge: input.codeChallenge,
        expiresAt,
        createdAt: new Date().toISOString(),
      });
      return { code, expiresAt };
    },

    buildAuthorizationRedirect(input: {
      redirectUri: string;
      code: string;
      state?: string;
    }): string {
      const url = new URL(input.redirectUri);
      url.searchParams.set("code", input.code);
      if (input.state) url.searchParams.set("state", input.state);
      return url.toString();
    },

    async exchangeAuthorizationCode(input: {
      clientId: string;
      clientSecret?: string;
      code: string;
      redirectUri: string;
      codeVerifier: string;
    }): Promise<{ accessToken: string; tokenType: "Bearer"; expiresIn: number; scope: string }> {
      const client = await config.store.getClient(input.clientId);
      if (!client) throw new OAuthProviderError("INVALID_CLIENT", "Unknown client_id");

      if (client.clientSecretHash) {
        if (!input.clientSecret || !verifyClientSecret(input.clientSecret, client.clientSecretHash)) {
          throw new OAuthProviderError("INVALID_CLIENT", "Invalid client credentials");
        }
      }

      const record = await config.store.consumeAuthorizationCode(input.code);
      if (!record || record.clientId !== input.clientId) {
        throw new OAuthProviderError("INVALID_GRANT", "Invalid or expired authorization code");
      }
      if (record.redirectUri !== input.redirectUri) {
        throw new OAuthProviderError("INVALID_GRANT", "redirect_uri mismatch");
      }

      const expectedChallenge = codeChallengeS256(input.codeVerifier);
      if (record.codeChallenge !== expectedChallenge) {
        throw new OAuthProviderError("INVALID_GRANT", "PKCE verification failed");
      }

      const accessToken = randomOpaqueToken(32);
      const expiresAt = new Date(Date.now() + tokenTtl * 1000).toISOString();
      await config.store.saveAccessToken({
        token: accessToken,
        clientId: input.clientId,
        subject: record.subject,
        scopes: record.scopes,
        expiresAt,
        createdAt: new Date().toISOString(),
      });

      return {
        accessToken,
        tokenType: "Bearer",
        expiresIn: tokenTtl,
        scope: record.scopes.join(" "),
      };
    },

    async introspectAccessToken(token: string) {
      const row = await config.store.getAccessToken(token);
      if (!row) return null;
      return {
        active: true,
        clientId: row.clientId,
        subject: row.subject,
        scope: row.scopes.join(" "),
        exp: Math.floor(new Date(row.expiresAt).getTime() / 1000),
      };
    },
  };
}

export type OAuthProvider = ReturnType<typeof createOAuthProvider>;
