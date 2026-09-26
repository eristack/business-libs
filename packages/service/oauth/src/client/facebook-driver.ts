import type { OAuthUserProfile } from "../core/types.js";
import { createOAuth2Driver } from "./oauth2-driver.js";

const FB_AUTH = "https://www.facebook.com/v21.0/dialog/oauth";
const FB_TOKEN = "https://graph.facebook.com/v21.0/oauth/access_token";
const FB_GRAPH = "https://graph.facebook.com/v21.0/me";

export function createFacebookOAuthDriver(options: {
  clientId: string;
  clientSecret: string;
  defaultScopes?: string;
  fetch?: typeof fetch;
}) {
  const fetchFn = options.fetch ?? fetch;

  return createOAuth2Driver({
    provider: "facebook",
    clientId: options.clientId,
    clientSecret: options.clientSecret,
    authorizationEndpoint: FB_AUTH,
    tokenEndpoint: FB_TOKEN,
    defaultScopes: options.defaultScopes ?? "email public_profile",
    fetch: fetchFn,
    async resolveProfile({ accessToken }) {
      const url = new URL(FB_GRAPH);
      url.searchParams.set("fields", "id,name,email,picture");
      url.searchParams.set("access_token", accessToken);
      const res = await fetchFn(url);
      const json = (await res.json()) as Record<string, unknown>;
      if (!res.ok) {
        throw new Error(typeof json.error === "object" ? JSON.stringify(json.error) : "Facebook profile failed");
      }
      const picture =
        typeof json.picture === "object" &&
        json.picture !== null &&
        typeof (json.picture as { data?: { url?: string } }).data?.url === "string"
          ? (json.picture as { data: { url: string } }).data.url
          : undefined;

      const profile: OAuthUserProfile = {
        provider: "facebook",
        subject: String(json.id ?? ""),
        email: typeof json.email === "string" ? json.email : undefined,
        name: typeof json.name === "string" ? json.name : undefined,
        picture,
        raw: json,
      };
      return profile;
    },
  });
}
