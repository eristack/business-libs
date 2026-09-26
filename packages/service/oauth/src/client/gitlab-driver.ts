import { createOidcOAuthDriver } from "./oidc-driver.js";

export function createGitLabOAuthDriver(options: {
  clientId: string;
  clientSecret: string;
  /** Self-hosted base URL, default `https://gitlab.com`. */
  baseUrl?: string;
  defaultScopes?: string;
  fetch?: typeof fetch;
}) {
  const base = (options.baseUrl ?? "https://gitlab.com").replace(/\/$/, "");
  return createOidcOAuthDriver({
    provider: "gitlab",
    clientId: options.clientId,
    clientSecret: options.clientSecret,
    authorizationEndpoint: `${base}/oauth/authorize`,
    tokenEndpoint: `${base}/oauth/token`,
    userinfoEndpoint: `${base}/oauth/userinfo`,
    defaultScopes: options.defaultScopes ?? "openid profile email",
    fetch: options.fetch,
  });
}
