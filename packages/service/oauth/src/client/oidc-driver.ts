import { OAuthExchangeError } from "../core/errors.js";
import type { OAuthConsumerDriver, OAuthUserProfile } from "../core/types.js";

export type OidcOAuthDriverConfig = {
  provider: string;
  clientId: string;
  clientSecret?: string;
  authorizationEndpoint: string;
  tokenEndpoint: string;
  userinfoEndpoint?: string;
  defaultScopes?: string;
  fetch?: typeof fetch;
};

function parseJwtPayload(idToken: string): Record<string, unknown> {
  const parts = idToken.split(".");
  if (parts.length < 2) return {};
  try {
    return JSON.parse(Buffer.from(parts[1]!, "base64url").toString("utf8")) as Record<
      string,
      unknown
    >;
  } catch {
    return {};
  }
}

export function createOidcOAuthDriver(config: OidcOAuthDriverConfig): OAuthConsumerDriver {
  const fetchFn = config.fetch ?? fetch;
  const defaultScopes = config.defaultScopes ?? "openid profile email";

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
        headers: { "content-type": "application/x-www-form-urlencoded" },
        body,
      });

      const json = (await res.json()) as Record<string, unknown>;
      if (!res.ok) {
        const err =
          typeof json.error_description === "string"
            ? json.error_description
            : typeof json.error === "string"
              ? json.error
              : `HTTP ${res.status}`;
        throw new OAuthExchangeError(err);
      }

      const accessToken = String(json.access_token ?? "");
      if (!accessToken) throw new OAuthExchangeError("Missing access_token");

      const idToken = typeof json.id_token === "string" ? json.id_token : undefined;
      let claims: Record<string, unknown> = idToken ? parseJwtPayload(idToken) : {};

      if (config.userinfoEndpoint) {
        const ui = await fetchFn(config.userinfoEndpoint, {
          headers: { authorization: `Bearer ${accessToken}` },
        });
        if (ui.ok) {
          claims = { ...claims, ...((await ui.json()) as Record<string, unknown>) };
        }
      }

      const sub = String(claims.sub ?? "");
      if (!sub) throw new OAuthExchangeError("Missing subject (sub) in IdP response");

      const profile: OAuthUserProfile = {
        provider: config.provider,
        subject: sub,
        email: typeof claims.email === "string" ? claims.email : undefined,
        emailVerified:
          claims.email_verified === true || claims.email_verified === "true"
            ? true
            : claims.email_verified === false
              ? false
              : undefined,
        name: typeof claims.name === "string" ? claims.name : undefined,
        picture: typeof claims.picture === "string" ? claims.picture : undefined,
        raw: claims,
      };

      return {
        tokens: {
          accessToken,
          refreshToken:
            typeof json.refresh_token === "string" ? json.refresh_token : undefined,
          idToken,
          expiresIn:
            typeof json.expires_in === "number"
              ? json.expires_in
              : typeof json.expires_in === "string"
                ? Number(json.expires_in)
                : undefined,
          tokenType: typeof json.token_type === "string" ? json.token_type : undefined,
          scope: typeof json.scope === "string" ? json.scope : undefined,
        },
        profile,
      };
    },
  };
}
