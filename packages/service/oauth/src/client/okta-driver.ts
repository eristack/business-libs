import { createOidcOAuthDriver } from "./oidc-driver.js";

export function createOktaOAuthDriver(options: {
  clientId: string;
  clientSecret: string;
  /** Okta org domain, e.g. `dev-123456.okta.com`. */
  domain: string;
  defaultScopes?: string;
  fetch?: typeof fetch;
}) {
  const base = `https://${options.domain.replace(/^https?:\/\//, "").replace(/\/$/, "")}`;
  return createOidcOAuthDriver({
    provider: "okta",
    clientId: options.clientId,
    clientSecret: options.clientSecret,
    authorizationEndpoint: `${base}/oauth2/v1/authorize`,
    tokenEndpoint: `${base}/oauth2/v1/token`,
    userinfoEndpoint: `${base}/oauth2/v1/userinfo`,
    defaultScopes: options.defaultScopes ?? "openid profile email",
    fetch: options.fetch,
  });
}
