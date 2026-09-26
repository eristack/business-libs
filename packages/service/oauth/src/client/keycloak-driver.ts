import { createOidcOAuthDriver } from "./oidc-driver.js";

export function createKeycloakOAuthDriver(options: {
  clientId: string;
  clientSecret: string;
  /** Realm issuer URL, e.g. `https://auth.example.com/realms/acme`. */
  issuer: string;
  defaultScopes?: string;
  fetch?: typeof fetch;
}) {
  const issuer = options.issuer.replace(/\/$/, "");
  return createOidcOAuthDriver({
    provider: "keycloak",
    clientId: options.clientId,
    clientSecret: options.clientSecret,
    authorizationEndpoint: `${issuer}/protocol/openid-connect/auth`,
    tokenEndpoint: `${issuer}/protocol/openid-connect/token`,
    userinfoEndpoint: `${issuer}/protocol/openid-connect/userinfo`,
    defaultScopes: options.defaultScopes ?? "openid profile email",
    fetch: options.fetch,
  });
}
