---
title: OAuth provider
description: Your API as authorization server — clients, PKCE, token endpoint.
---

# OAuth provider (authorization server)

Use when **partner apps** need tokens to call **your** API on behalf of a logged-in user.

## Register a client

```ts
import { createOAuthProvider } from "@eristack/oauth/provider";
import { createDrizzleOAuthProviderStore, createOAuthTables } from "@eristack/oauth/drizzle";

const tables = createOAuthTables("pgsql");
const oauthProvider = createOAuthProvider({
  store: createDrizzleOAuthProviderStore({ db, tables }),
});

await oauthProvider.registerClient({
  clientId: "partner-crm",
  clientSecret: process.env.PARTNER_CLIENT_SECRET!,
  redirectUris: ["https://partner.example/oauth/callback"],
  allowedScopes: ["openid", "profile", "erp.read"],
});
```

## Authorize (after jwt-auth session)

Your consent UI runs **after** `requireAuth`. User approves scopes, then:

```ts
const codeVerifier = generateCodeVerifier(); // partner generated PKCE; you store codeChallenge from authorize request
const { code } = await oauthProvider.createAuthorizationCode({
  clientId,
  redirectUri,
  subject: req.user.id,
  scopes: ["openid", "profile"],
  codeChallenge: req.query.code_challenge as string,
});
const location = oauthProvider.buildAuthorizationRedirect({ redirectUri, code, state });
res.redirect(location);
```

## Token endpoint

```ts
import { createOAuthProviderRouter } from "@eristack/oauth/express";

app.use("/oauth/as", createOAuthProviderRouter({ provider: oauthProvider }));
// POST /oauth/as/token — application/x-www-form-urlencoded (authorization_code + PKCE)
```

## Introspection

```ts
const info = await oauthProvider.introspectAccessToken(bearerToken);
// { subject, clientId, scope, exp }
```

Production: replace `enableDevAuthorize` dev routes with real authorize UI + scope consent.
