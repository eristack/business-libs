import { codeChallengeS256, generateCodeVerifier } from "../core/pkce.js";
import { OAuthProviderError } from "../core/errors.js";
import { toOAuthErrorResponse } from "./errors.js";
import type { RestOAuthProviderConfig, RestRequest, RestResponse } from "./types.js";

function readBody(req: RestRequest): Record<string, unknown> {
  if (!req.body || typeof req.body !== "object" || Array.isArray(req.body)) return {};
  return req.body as Record<string, unknown>;
}

function queryString(
  query: Record<string, string | string[] | undefined>,
  key: string,
): string | undefined {
  const v = query[key];
  if (typeof v === "string") return v;
  if (Array.isArray(v)) return v[0];
  return undefined;
}

export function createRestOAuthProviderActions(config: RestOAuthProviderConfig) {
  return {
    async token(req: RestRequest): Promise<RestResponse> {
      try {
        const contentType = req.headers.get("content-type") ?? "";
        let params: Record<string, unknown> = readBody(req);
        if (contentType.includes("application/x-www-form-urlencoded") && typeof req.body === "string") {
          params = Object.fromEntries(new URLSearchParams(req.body));
        }

        const grantType = params.grant_type;
        if (grantType !== "authorization_code") {
          return {
            status: 400,
            body: { error: "unsupported_grant_type" },
          };
        }

        const result = await config.provider.exchangeAuthorizationCode({
          clientId: String(params.client_id ?? ""),
          clientSecret:
            typeof params.client_secret === "string" ? params.client_secret : undefined,
          code: String(params.code ?? ""),
          redirectUri: String(params.redirect_uri ?? ""),
          codeVerifier: String(params.code_verifier ?? ""),
        });

        return {
          status: 200,
          body: {
            access_token: result.accessToken,
            token_type: result.tokenType,
            expires_in: result.expiresIn,
            scope: result.scope,
          },
        };
      } catch (err) {
        if (err instanceof OAuthProviderError) {
          return { status: 400, body: { error: err.code, error_description: err.message } };
        }
        return toOAuthErrorResponse(err);
      }
    },

    /** Dev helper: mint code when subject already authenticated — production wraps with consent UI. */
    async devAuthorize(req: RestRequest): Promise<RestResponse> {
      try {
        const clientId = queryString(req.query, "client_id");
        const redirectUri = queryString(req.query, "redirect_uri");
        const subject = queryString(req.query, "subject");
        const scope = queryString(req.query, "scope") ?? "openid profile";
        if (!clientId || !redirectUri || !subject) {
          return { status: 400, body: { code: "INVALID_INPUT", message: "client_id, redirect_uri, subject required" } };
        }
        const codeVerifier = generateCodeVerifier();
        const { code } = await config.provider.createAuthorizationCode({
          clientId,
          redirectUri,
          subject,
          scopes: scope.split(/\s+/).filter(Boolean),
          codeChallenge: codeChallengeS256(codeVerifier),
        });
        const location = config.provider.buildAuthorizationRedirect({
          redirectUri,
          code,
          state: queryString(req.query, "state"),
        });
        return {
          status: 200,
          body: { redirect: location, codeVerifierForTokenExchange: codeVerifier },
        };
      } catch (err) {
        return toOAuthErrorResponse(err);
      }
    },
  };
}
