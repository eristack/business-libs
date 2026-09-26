import type { OAuthUserProfile } from "../core/types.js";
import { createOAuth2Driver } from "./oauth2-driver.js";

const X_AUTH = "https://twitter.com/i/oauth2/authorize";
const X_TOKEN = "https://api.twitter.com/2/oauth2/token";
const X_USER = "https://api.twitter.com/2/users/me";

export function createTwitterOAuthDriver(options: {
  clientId: string;
  clientSecret: string;
  defaultScopes?: string;
  fetch?: typeof fetch;
}) {
  const fetchFn = options.fetch ?? fetch;

  return createOAuth2Driver({
    provider: "twitter",
    clientId: options.clientId,
    clientSecret: options.clientSecret,
    authorizationEndpoint: X_AUTH,
    tokenEndpoint: X_TOKEN,
    defaultScopes: options.defaultScopes ?? "users.read tweet.read offline.access",
    extraAuthorizeParams: { force_login: "true" },
    fetch: fetchFn,
    async resolveProfile({ accessToken }) {
      const url = new URL(X_USER);
      url.searchParams.set(
        "user.fields",
        "profile_image_url,confirmed_email,name,username",
      );
      const res = await fetchFn(url, {
        headers: { authorization: `Bearer ${accessToken}` },
      });
      const json = (await res.json()) as { data?: Record<string, unknown> };
      const data = json.data ?? {};
      const profile: OAuthUserProfile = {
        provider: "twitter",
        subject: String(data.id ?? ""),
        email: typeof data.confirmed_email === "string" ? data.confirmed_email : undefined,
        name: typeof data.name === "string" ? data.name : undefined,
        picture:
          typeof data.profile_image_url === "string" ? data.profile_image_url : undefined,
        raw: data as Record<string, unknown>,
      };
      return profile;
    },
  });
}

/** Alias — X rebranding. Same OAuth 2.0 endpoints. */
export const createXOAuthDriver = createTwitterOAuthDriver;
