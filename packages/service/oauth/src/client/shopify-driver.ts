import { createOidcOAuthDriver } from "./oidc-driver.js";

export function createShopifyOAuthDriver(options: {
  clientId: string;
  clientSecret: string;
  /** Shop subdomain, e.g. `my-store` → `my-store.myshopify.com`. */
  shop: string;
  defaultScopes?: string;
  fetch?: typeof fetch;
}) {
  const shop = options.shop.replace(/\.myshopify\.com$/i, "");
  const host = `${shop}.myshopify.com`;
  return createOidcOAuthDriver({
    provider: "shopify",
    clientId: options.clientId,
    clientSecret: options.clientSecret,
    authorizationEndpoint: `https://${host}/admin/oauth/authorize`,
    tokenEndpoint: `https://${host}/admin/oauth/access_token`,
    defaultScopes: options.defaultScopes ?? "openid email",
    fetch: options.fetch,
  });
}
