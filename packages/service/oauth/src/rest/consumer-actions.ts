import { toOAuthErrorResponse } from "./errors.js";
import type { RestOAuthConsumerConfig, RestRequest, RestResponse } from "./types.js";

function queryString(
  query: Record<string, string | string[] | undefined>,
  key: string,
): string | undefined {
  const v = query[key];
  if (typeof v === "string") return v;
  if (Array.isArray(v)) return v[0];
  return undefined;
}

export function createRestOAuthConsumerActions(config: RestOAuthConsumerConfig) {
  return {
    async beginLogin(req: RestRequest): Promise<RestResponse> {
      try {
        const provider = req.params.provider;
        const redirectUri = queryString(req.query, "redirect_uri");
        if (!provider || !redirectUri) {
          return { status: 400, body: { code: "INVALID_INPUT", message: "provider and redirect_uri required" } };
        }
        const result = await config.consumer.beginLogin({
          provider,
          redirectUri,
          scopes: queryString(req.query, "scope"),
          loginHint: queryString(req.query, "login_hint"),
        });
        return {
          status: 302,
          body: null,
          headers: { location: result.authorizationUrl },
        };
      } catch (err) {
        return toOAuthErrorResponse(err);
      }
    },

    async callback(req: RestRequest): Promise<RestResponse> {
      try {
        const provider = req.params.provider;
        if (!provider) {
          return { status: 400, body: { code: "INVALID_INPUT", message: "provider param required" } };
        }
        const result = await config.consumer.completeLogin({
          provider,
          query: {
            code: queryString(req.query, "code"),
            state: queryString(req.query, "state"),
            error: queryString(req.query, "error"),
            error_description: queryString(req.query, "error_description"),
          },
        });
        return { status: 200, body: result };
      } catch (err) {
        return toOAuthErrorResponse(err);
      }
    },
  };
}
