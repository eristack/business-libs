import { randomBytes } from "node:crypto";
import {
  OAuthExchangeError,
  OAuthStateError,
  UnknownOAuthProviderError,
} from "./errors.js";
import { generatePkcePair } from "./pkce.js";
import { assertRedirectUriAllowed } from "./redirect-uri.js";
import type { OAuthConsumer, OAuthConsumerConfig, OAuthConsumerDriver } from "./types.js";

const DEFAULT_PENDING_TTL_SECONDS = 600;

function driverFor(
  config: OAuthConsumerConfig,
  provider: string,
): OAuthConsumerDriver {
  const driver = config.drivers[provider];
  if (!driver) throw new UnknownOAuthProviderError(provider);
  return driver;
}

function randomState(): string {
  return randomBytes(24).toString("base64url");
}

export function createOAuthConsumer(config: OAuthConsumerConfig): OAuthConsumer {
  const ttl = config.pendingTtlSeconds ?? DEFAULT_PENDING_TTL_SECONDS;

  return {
    async beginLogin(input) {
      assertRedirectUriAllowed(input.redirectUri, config.allowedRedirectUris);
      const driver = driverFor(config, input.provider);
      const state = randomState();
      const { codeVerifier, codeChallenge } = generatePkcePair();
      const now = Date.now();
      const expiresAt = new Date(now + ttl * 1000).toISOString();

      await config.pendingStore.save({
        state,
        provider: input.provider,
        codeVerifier,
        redirectUri: input.redirectUri,
        scopes: input.scopes,
        metadata: input.metadata,
        createdAt: new Date(now).toISOString(),
        expiresAt,
      });

      const authorizationUrl = driver.buildAuthorizationUrl({
        redirectUri: input.redirectUri,
        state,
        codeChallenge,
        scopes: input.scopes,
        loginHint: input.loginHint,
      });

      return { authorizationUrl, state };
    },

    async completeLogin(input) {
      if (input.query.error) {
        throw new OAuthExchangeError(
          input.query.error_description ?? input.query.error,
        );
      }
      const code = input.query.code;
      const state = input.query.state;
      if (!code || !state) {
        throw new OAuthStateError("Missing code or state in OAuth callback");
      }

      const pending = await config.pendingStore.consume(state);
      if (!pending || pending.provider !== input.provider) {
        throw new OAuthStateError("Invalid or expired OAuth state");
      }

      assertRedirectUriAllowed(pending.redirectUri, config.allowedRedirectUris);
      const driver = driverFor(config, input.provider);

      const result = await driver.exchangeAuthorizationCode({
        code,
        redirectUri: pending.redirectUri,
        codeVerifier: pending.codeVerifier,
      });

      return {
        profile: result.profile,
        tokens: result.tokens,
        metadata: pending.metadata,
      };
    },
  };
}
