---
title: Getting started
description: Sign-in with Google/OIDC — PKCE, Express routes, jwt-auth issueTokens.
---

# Getting started (OAuth client)

## Install

```bash
pnpm add @eristack/oauth @eristack/jwt-auth drizzle-orm
pnpm add express   # optional /express peer
```

## 1. Consumer + Google driver

```ts
import { createOAuthConsumer } from "@eristack/oauth";
import { createGoogleOAuthDriver } from "@eristack/oauth/client";
import { createDrizzleOAuthPendingStore, createOAuthTables } from "@eristack/oauth/drizzle";

const tables = createOAuthTables("pgsql");

const consumer = createOAuthConsumer({
  drivers: {
    google: createGoogleOAuthDriver({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  },
  pendingStore: createDrizzleOAuthPendingStore({ db, tables }),
  allowedRedirectUris: [process.env.OAUTH_REDIRECT_URI!],
});
```

## 2. Express routes

```ts
import { createOAuthConsumerRouter } from "@eristack/oauth/express";
import { createJwtAuth } from "@eristack/jwt-auth";

app.use(
  "/oauth",
  createOAuthConsumerRouter({
    consumer,
    async onCallback(result, req, res) {
      const user = await upsertUserFromProfile(result.profile);
      const tokens = await auth.issueTokens({
        subject: user.id,
        claims: { role: user.role },
      });
      res.json(tokens);
    },
  }),
);
```

Routes:

- `GET /oauth/google/login?redirect_uri=…` → redirect to Google (PKCE)
- `GET /oauth/google/callback?code=…&state=…` → `onCallback` or JSON profile

## 3. Generic OIDC

```ts
import { createOidcOAuthDriver } from "@eristack/oauth/client";

createOidcOAuthDriver({
  provider: "azure",
  clientId: process.env.AZURE_CLIENT_ID!,
  clientSecret: process.env.AZURE_CLIENT_SECRET!,
  authorizationEndpoint: "https://login.microsoftonline.com/{tenant}/oauth2/v2.0/authorize",
  tokenEndpoint: "https://login.microsoftonline.com/{tenant}/oauth2/v2.0/token",
  userinfoEndpoint: undefined, // use id_token claims
});
```

See [jwt-auth handoff](./jwt-auth-handoff.md) and [Provider](./provider.md) for inbound OAuth.
