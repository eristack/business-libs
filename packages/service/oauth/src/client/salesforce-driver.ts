import { createOidcOAuthDriver } from "./oidc-driver.js";

export function createSalesforceOAuthDriver(options: {
  clientId: string;
  clientSecret: string;
  /** `login` (prod) or `test` (sandbox). */
  environment?: "login" | "test";
  defaultScopes?: string;
  fetch?: typeof fetch;
}) {
  const env = options.environment ?? "login";
  const base = `https://${env}.salesforce.com`;
  return createOidcOAuthDriver({
    provider: "salesforce",
    clientId: options.clientId,
    clientSecret: options.clientSecret,
    authorizationEndpoint: `${base}/services/oauth2/authorize`,
    tokenEndpoint: `${base}/services/oauth2/token`,
    userinfoEndpoint: `${base}/services/oauth2/userinfo`,
    defaultScopes: options.defaultScopes ?? "openid profile email",
    fetch: options.fetch,
  });
}
