import { createOidcOAuthDriver } from "./oidc-driver.js";

const LINKEDIN_AUTH = "https://www.linkedin.com/oauth/v2/authorization";
const LINKEDIN_TOKEN = "https://www.linkedin.com/oauth/v2/accessToken";
const LINKEDIN_USERINFO = "https://api.linkedin.com/v2/userinfo";

export function createLinkedInOAuthDriver(options: {
  clientId: string;
  clientSecret: string;
  defaultScopes?: string;
  fetch?: typeof fetch;
}) {
  return createOidcOAuthDriver({
    provider: "linkedin",
    clientId: options.clientId,
    clientSecret: options.clientSecret,
    authorizationEndpoint: LINKEDIN_AUTH,
    tokenEndpoint: LINKEDIN_TOKEN,
    userinfoEndpoint: LINKEDIN_USERINFO,
    defaultScopes: options.defaultScopes ?? "openid profile email",
    fetch: options.fetch,
  });
}
