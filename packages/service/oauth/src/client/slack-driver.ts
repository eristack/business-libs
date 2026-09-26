import { createOidcOAuthDriver } from "./oidc-driver.js";

const SLACK_AUTH = "https://slack.com/openid/connect/authorize";
const SLACK_TOKEN = "https://slack.com/api/openid.connect.token";
const SLACK_USERINFO = "https://slack.com/api/openid.connect.userInfo";

export function createSlackOAuthDriver(options: {
  clientId: string;
  clientSecret: string;
  defaultScopes?: string;
  fetch?: typeof fetch;
}) {
  return createOidcOAuthDriver({
    provider: "slack",
    clientId: options.clientId,
    clientSecret: options.clientSecret,
    authorizationEndpoint: SLACK_AUTH,
    tokenEndpoint: SLACK_TOKEN,
    userinfoEndpoint: SLACK_USERINFO,
    defaultScopes: options.defaultScopes ?? "openid profile email",
    fetch: options.fetch,
  });
}
