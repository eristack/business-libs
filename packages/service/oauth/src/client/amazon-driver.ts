import { createOidcOAuthDriver } from "./oidc-driver.js";

const AMAZON_AUTH = "https://www.amazon.com/ap/oa";
const AMAZON_TOKEN = "https://api.amazon.com/auth/o2/token";
const AMAZON_PROFILE = "https://api.amazon.com/user/profile";

export function createAmazonOAuthDriver(options: {
  clientId: string;
  clientSecret: string;
  defaultScopes?: string;
  fetch?: typeof fetch;
}) {
  return createOidcOAuthDriver({
    provider: "amazon",
    clientId: options.clientId,
    clientSecret: options.clientSecret,
    authorizationEndpoint: AMAZON_AUTH,
    tokenEndpoint: AMAZON_TOKEN,
    userinfoEndpoint: AMAZON_PROFILE,
    defaultScopes: options.defaultScopes ?? "profile",
    fetch: options.fetch,
  });
}
