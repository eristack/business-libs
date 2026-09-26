import { createOidcOAuthDriver } from "./oidc-driver.js";

export type MicrosoftOAuthDriverOptions = {
  clientId: string;
  clientSecret: string;
  /** Azure AD tenant id, or `common` / `organizations` / `consumers`. */
  tenantId?: string;
  defaultScopes?: string;
  fetch?: typeof fetch;
};

function microsoftEndpoints(tenantId: string) {
  const base = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0`;
  return {
    authorizationEndpoint: `${base}/authorize`,
    tokenEndpoint: `${base}/token`,
  };
}

export function createMicrosoftOAuthDriver(options: MicrosoftOAuthDriverOptions) {
  const tenantId = options.tenantId ?? "common";
  const endpoints = microsoftEndpoints(tenantId);
  return createOidcOAuthDriver({
    provider: "microsoft",
    clientId: options.clientId,
    clientSecret: options.clientSecret,
    authorizationEndpoint: endpoints.authorizationEndpoint,
    tokenEndpoint: endpoints.tokenEndpoint,
    defaultScopes: options.defaultScopes ?? "openid profile email offline_access",
    fetch: options.fetch,
  });
}

/** Entra ID / Azure AD — alias of `createMicrosoftOAuthDriver`. */
export const createAzureAdOAuthDriver = createMicrosoftOAuthDriver;
