import { createOidcOAuthDriver } from "./oidc-driver.js";

export function createAuth0OAuthDriver(options: {
  clientId: string;
  clientSecret: string;
  /** Auth0 tenant domain, e.g. `your-tenant.us.auth0.com`. */
  domain: string;
  defaultScopes?: string;
  fetch?: typeof fetch;
}) {
  const base = `https://${options.domain.replace(/^https?:\/\//, "").replace(/\/$/, "")}`;
  return createOidcOAuthDriver({
    provider: "auth0",
    clientId: options.clientId,
    clientSecret: options.clientSecret,
    authorizationEndpoint: `${base}/authorize`,
    tokenEndpoint: `${base}/oauth/token`,
    userinfoEndpoint: `${base}/userinfo`,
    defaultScopes: options.defaultScopes ?? "openid profile email",
    fetch: options.fetch,
  });
}
