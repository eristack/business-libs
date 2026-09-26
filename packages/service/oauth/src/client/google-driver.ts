import { createOidcOAuthDriver, type OidcOAuthDriverConfig } from "./oidc-driver.js";

const GOOGLE_AUTH = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN = "https://oauth2.googleapis.com/token";
const GOOGLE_USERINFO = "https://openidconnect.googleapis.com/v1/userinfo";

export function createGoogleOAuthDriver(
  options: Pick<OidcOAuthDriverConfig, "clientId" | "clientSecret" | "fetch"> & {
    defaultScopes?: string;
  },
) {
  return createOidcOAuthDriver({
    provider: "google",
    clientId: options.clientId,
    clientSecret: options.clientSecret,
    authorizationEndpoint: GOOGLE_AUTH,
    tokenEndpoint: GOOGLE_TOKEN,
    userinfoEndpoint: GOOGLE_USERINFO,
    defaultScopes: options.defaultScopes ?? "openid profile email",
    fetch: options.fetch,
  });
}
