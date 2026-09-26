import { OAuthExchangeError } from "../core/errors.js";
import { createOidcOAuthDriver, type OidcOAuthDriverConfig } from "./oidc-driver.js";

export type OidcDiscoveryDocument = {
  issuer: string;
  authorization_endpoint: string;
  token_endpoint: string;
  userinfo_endpoint?: string;
};

/** Fetch `/.well-known/openid-configuration` for Keycloak, Authentik, custom IdPs. */
export async function fetchOidcDiscovery(
  issuer: string,
  fetchFn: typeof fetch = fetch,
): Promise<OidcDiscoveryDocument> {
  const base = issuer.replace(/\/$/, "");
  const res = await fetchFn(`${base}/.well-known/openid-configuration`);
  if (!res.ok) {
    throw new OAuthExchangeError(`OIDC discovery failed: HTTP ${res.status}`);
  }
  const json = (await res.json()) as OidcDiscoveryDocument;
  if (!json.authorization_endpoint || !json.token_endpoint) {
    throw new OAuthExchangeError("OIDC discovery missing authorization or token endpoint");
  }
  return json;
}

export async function createOidcOAuthDriverFromIssuer(
  options: Pick<
    OidcOAuthDriverConfig,
    "provider" | "clientId" | "clientSecret" | "defaultScopes" | "fetch" | "extraAuthorizeParams"
  > & { issuer: string },
) {
  const fetchFn = options.fetch ?? fetch;
  const doc = await fetchOidcDiscovery(options.issuer, fetchFn);
  return createOidcOAuthDriver({
    provider: options.provider,
    clientId: options.clientId,
    clientSecret: options.clientSecret,
    authorizationEndpoint: doc.authorization_endpoint,
    tokenEndpoint: doc.token_endpoint,
    userinfoEndpoint: doc.userinfo_endpoint,
    defaultScopes: options.defaultScopes,
    extraAuthorizeParams: options.extraAuthorizeParams,
    fetch: fetchFn,
  });
}
