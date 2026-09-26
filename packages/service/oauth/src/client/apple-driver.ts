import { createPrivateKey, createSign } from "node:crypto";
import { createOidcOAuthDriver } from "./oidc-driver.js";

const APPLE_AUTH = "https://appleid.apple.com/auth/authorize";
const APPLE_TOKEN = "https://appleid.apple.com/auth/token";

/** ES256 client secret JWT required by Sign in with Apple (rotate before exp). */
export function createAppleClientSecret(options: {
  teamId: string;
  clientId: string;
  keyId: string;
  privateKeyPem: string;
  expiresInSeconds?: number;
}): string {
  const now = Math.floor(Date.now() / 1000);
  const exp = now + (options.expiresInSeconds ?? 60 * 60 * 24 * 150);
  const header = Buffer.from(JSON.stringify({ alg: "ES256", kid: options.keyId })).toString(
    "base64url",
  );
  const payload = Buffer.from(
    JSON.stringify({
      iss: options.teamId,
      iat: now,
      exp,
      aud: "https://appleid.apple.com",
      sub: options.clientId,
    }),
  ).toString("base64url");
  const data = `${header}.${payload}`;
  const sign = createSign("SHA256");
  sign.update(data);
  sign.end();
  const signature = sign
    .sign(createPrivateKey(options.privateKeyPem))
    .toString("base64url");
  return `${data}.${signature}`;
}

export type AppleOAuthDriverOptions = {
  clientId: string;
  teamId: string;
  keyId: string;
  privateKeyPem: string;
  /** Static secret if you manage rotation externally. */
  clientSecret?: string;
  defaultScopes?: string;
  fetch?: typeof fetch;
};

export function createAppleOAuthDriver(options: AppleOAuthDriverOptions) {
  return createOidcOAuthDriver({
    provider: "apple",
    clientId: options.clientId,
    clientSecret: options.clientSecret,
    resolveClientSecret: options.clientSecret
      ? undefined
      : () =>
          createAppleClientSecret({
            teamId: options.teamId,
            clientId: options.clientId,
            keyId: options.keyId,
            privateKeyPem: options.privateKeyPem,
          }),
    authorizationEndpoint: APPLE_AUTH,
    tokenEndpoint: APPLE_TOKEN,
    defaultScopes: options.defaultScopes ?? "name email",
    extraAuthorizeParams: { response_mode: "form_post" },
    fetch: options.fetch,
  });
}
