import { createOidcOAuthDriver } from "./oidc-driver.js";

export function createCognitoOAuthDriver(options: {
  clientId: string;
  clientSecret?: string;
  /** Hosted UI domain prefix, e.g. `myapp.auth.us-east-1.amazoncognito.com`. */
  domain: string;
  defaultScopes?: string;
  fetch?: typeof fetch;
}) {
  const host = options.domain.replace(/^https?:\/\//, "").replace(/\/$/, "");
  const base = `https://${host}`;
  return createOidcOAuthDriver({
    provider: "cognito",
    clientId: options.clientId,
    clientSecret: options.clientSecret,
    authorizationEndpoint: `${base}/oauth2/authorize`,
    tokenEndpoint: `${base}/oauth2/token`,
    userinfoEndpoint: `${base}/oauth2/userInfo`,
    defaultScopes: options.defaultScopes ?? "openid profile email",
    fetch: options.fetch,
  });
}
