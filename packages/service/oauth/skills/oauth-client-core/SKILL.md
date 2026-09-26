---
name: oauth-client-core
description: >
  @eristack/oauth consumer: createOAuthConsumer, PKCE, 17+ IdP drivers (Google, Microsoft,
  GitHub, Apple, Okta, …), Drizzle pending store. End at jwt-auth.issueTokens.
metadata:
  type: core
  library: "@eristack/oauth"
  library_version: "0.1.0"
sources:
  - "eristack/business-libs:packages/service/oauth/docs/drivers.md"
---

# OAuth client core

## Defaults

- **Production:** Drizzle `oauth_pending_logins` + allowlisted `redirect_uri` only.
- **IdPs:** import preset factories from `@eristack/oauth/client` — see **`OAUTH_PRESET_PROVIDER_CATALOG`**.
- **Apple:** `response_mode=form_post` → Express **POST** `/oauth/apple/callback` + `urlencoded` middleware.
- **Sessions:** `@eristack/jwt-auth` `issueTokens` after `completeLogin` — never use IdP access token as ERP JWT.

## Multi-IdP wiring

```ts
import { createOAuthConsumer } from "@eristack/oauth";
import {
  createGoogleOAuthDriver,
  createMicrosoftOAuthDriver,
  createGitHubOAuthDriver,
} from "@eristack/oauth/client";
import { createDrizzleOAuthPendingStore, createOAuthTables } from "@eristack/oauth/drizzle";

const consumer = createOAuthConsumer({
  drivers: {
    google: createGoogleOAuthDriver({ clientId, clientSecret }),
    microsoft: createMicrosoftOAuthDriver({ clientId, clientSecret, tenantId: "common" }),
    github: createGitHubOAuthDriver({ clientId, clientSecret }),
  },
  pendingStore: createDrizzleOAuthPendingStore({ db, tables: createOAuthTables("pgsql") }),
  allowedRedirectUris: [redirectUri],
});
```

Custom OIDC: `createOidcOAuthDriver` or async `createOidcOAuthDriverFromIssuer`. Custom OAuth2 APIs: `createOAuth2Driver` + `resolveProfile`.

Load `oauth-provider-core` only for authorization-server mode.
