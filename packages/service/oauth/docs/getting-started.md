---
title: Getting started
description: Multi-IdP login with PKCE, Express, Drizzle, jwt-auth issueTokens.
---

# Getting started (OAuth client)

## Install

```bash
pnpm add @eristack/oauth @eristack/jwt-auth drizzle-orm
pnpm add express   # optional /express peer
```

## 1. Register drivers (pick IdPs)

See the full [**IdP drivers**](./drivers.md) catalog. Example with three common providers:

```ts
import { createOAuthConsumer } from "@eristack/oauth";
import {
  createGoogleOAuthDriver,
  createMicrosoftOAuthDriver,
  createGitHubOAuthDriver,
} from "@eristack/oauth/client";
import { createDrizzleOAuthPendingStore, createOAuthTables } from "@eristack/oauth/drizzle";

const tables = createOAuthTables("pgsql");

const consumer = createOAuthConsumer({
  drivers: {
    google: createGoogleOAuthDriver({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    microsoft: createMicrosoftOAuthDriver({
      clientId: process.env.AZURE_CLIENT_ID!,
      clientSecret: process.env.AZURE_CLIENT_SECRET!,
      tenantId: process.env.AZURE_TENANT_ID ?? "common",
    }),
    github: createGitHubOAuthDriver({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
  },
  pendingStore: createDrizzleOAuthPendingStore({ db, tables }),
  allowedRedirectUris: [process.env.OAUTH_REDIRECT_URI!],
});
```

Add Apple, LinkedIn, Okta, Auth0, Keycloak, Slack, Discord, etc. using the matching `create*OAuthDriver` from the same import — keys in `drivers` must match the URL segment (`/oauth/linkedin/login` → `drivers.linkedin`).

## 2. Express routes

```ts
import express from "express";
import { createOAuthConsumerRouter } from "@eristack/oauth/express";

const app = express();
app.use(express.urlencoded({ extended: false })); // Sign in with Apple (form_post)

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

| Route | Behavior |
| --- | --- |
| `GET /oauth/:provider/login?redirect_uri=` | Redirect to IdP with PKCE + state |
| `GET /oauth/:provider/callback?code=&state=` | Most IdPs |
| `POST /oauth/:provider/callback` | Apple (`response_mode=form_post`) |

Without `onCallback`, callback returns JSON `{ profile, tokens }` for debugging only — production should always issue jwt-auth tokens in `onCallback`.

## 3. Environment checklist

| Variable | Used by |
| --- | --- |
| `GOOGLE_CLIENT_ID` / `SECRET` | Google |
| `AZURE_CLIENT_ID` / `SECRET` / `TENANT_ID` | Microsoft |
| `GITHUB_CLIENT_ID` / `SECRET` | GitHub |
| `OAUTH_REDIRECT_URI` | Must match allowlist and IdP console |

Enterprise IdPs: see [drivers.md](./drivers.md) for Okta domain, Auth0 tenant, Keycloak issuer, Cognito hosted UI domain.

## 4. Custom OIDC

```ts
import { createOidcOAuthDriver, createOidcOAuthDriverFromIssuer } from "@eristack/oauth/client";

// Manual endpoints
createOidcOAuthDriver({ provider: "partner", clientId, clientSecret, authorizationEndpoint, tokenEndpoint, userinfoEndpoint });

// Discovery (async init — call at startup, then pass into createOAuthConsumer)
const authentik = await createOidcOAuthDriverFromIssuer({
  provider: "authentik",
  issuer: "https://auth.example/application/o/erp/",
  clientId,
  clientSecret,
});

const consumer = createOAuthConsumer({
  drivers: { authentik, google: googleDriver },
  pendingStore,
  allowedRedirectUris: [redirectUri],
});
```

## Next

- [IdP drivers](./drivers.md) — all presets + OAuth2 extension point  
- [jwt-auth handoff](./jwt-auth-handoff.md) — sessions, not IdP tokens  
- [Provider](./provider.md) — when **you** are the authorization server  
