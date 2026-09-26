import { OAuthExchangeError } from "../core/errors.js";
import type { OAuthConsumerDriver, OAuthUserProfile } from "../core/types.js";

export type OAuth2DriverConfig = {
  provider: string;
  clientId: string;
  clientSecret?: string;
  authorizationEndpoint: string;
  tokenEndpoint: string;
  defaultScopes?: string;
  extraAuthorizeParams?: Record<string, string>;
  tokenRequestHeaders?: Record<string, string>;
  fetch?: typeof fetch;
  resolveProfile: (input: {
    accessToken: string;
    tokenResponse: Record<string, unknown>;
  }) => Promise<OAuthUserProfile>;
};

export function createOAuth2Driver(config: OAuth2DriverConfig): OAuthConsumerDriver {
  const fetchFn = config.fetch ?? fetch;
  const defaultScopes = config.defaultScopes ?? "";

  return {
    provider: config.provider,
    buildAuthorizationUrl(input) {
      const url = new URL(config.authorizationEndpoint);
      url.searchParams.set("client_id", config.clientId);
      url.searchParams.set("redirect_uri", input.redirectUri);
      url.searchParams.set("response_type", "code");
      url.searchParams.set("scope", input.scopes ?? defaultScopes);
      url.searchParams.set("state", input.state);
      url.searchParams.set("code_challenge", input.codeChallenge);
      url.searchParams.set("code_challenge_method", "S256");
      if (input.loginHint) url.searchParams.set("login_hint", input.loginHint);
      if (config.extraAuthorizeParams) {
        for (const [key, value] of Object.entries(config.extraAuthorizeParams)) {
          url.searchParams.set(key, value);
        }
      }
      return url.toString();
    },
    async exchangeAuthorizationCode(input) {
      const body = new URLSearchParams();
      body.set("grant_type", "authorization_code");
      body.set("code", input.code);
      body.set("redirect_uri", input.redirectUri);
      body.set("client_id", config.clientId);
      body.set("code_verifier", input.codeVerifier);
      if (config.clientSecret) body.set("client_secret", config.clientSecret);

      const res = await fetchFn(config.tokenEndpoint, {
        method: "POST",
        headers: {
          "content-type": "application/x-www-form-urlencoded",
          ...config.tokenRequestHeaders,
        },
        body,
      });

      const json = (await res.json()) as Record<string, unknown>;
      if (!res.ok) {
        const err =
          typeof json.error_description === "string"
            ? json.error_description
            : typeof json.error === "string"
              ? json.error
              : typeof json.message === "string"
                ? json.message
                : `HTTP ${res.status}`;
        throw new OAuthExchangeError(err);
      }

      const accessToken = String(json.access_token ?? "");
      if (!accessToken) throw new OAuthExchangeError("Missing access_token");

      const profile = await config.resolveProfile({ accessToken, tokenResponse: json });

      return {
        tokens: {
          accessToken,
          refreshToken:
            typeof json.refresh_token === "string" ? json.refresh_token : undefined,
          idToken: typeof json.id_token === "string" ? json.id_token : undefined,
          expiresIn:
            typeof json.expires_in === "number"
              ? json.expires_in
              : typeof json.expires_in === "string"
                ? Number(json.expires_in)
                : undefined,
          tokenType: typeof json.token_type === "string" ? json.token_type : undefined,
        },
        profile,
      };
    },
  };
}
