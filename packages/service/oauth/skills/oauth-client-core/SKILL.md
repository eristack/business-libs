---
name: oauth-client-core
description: >
  @eristack/oauth consumer: createOAuthConsumer, PKCE, Google/OIDC drivers,
  pending login store. Complete with jwt-auth.issueTokens — not jwt-auth replacement.
metadata:
  type: core
  library: "@eristack/oauth"
  library_version: "0.1.0"
sources:
  - "eristack/business-libs:packages/service/oauth/docs/getting-started.md"
---

# OAuth client core

## Defaults

- **Production:** Drizzle `oauth_pending_logins` + allowlisted `redirect_uri` only.
- **Sessions:** `@eristack/jwt-auth` `issueTokens` after `completeLogin` — see `docs/jwt-auth-handoff.md`.
- **Never** store IdP access tokens as your SPA session unless you need Google API offline access.

## Minimal wiring

```ts
import { createOAuthConsumer } from "@eristack/oauth";
import { createGoogleOAuthDriver } from "@eristack/oauth/client";
import { createDrizzleOAuthPendingStore, createOAuthTables } from "@eristack/oauth/drizzle";

const consumer = createOAuthConsumer({
  drivers: {
    google: createGoogleOAuthDriver({ clientId, clientSecret }),
  },
  pendingStore: createDrizzleOAuthPendingStore({ db, tables: createOAuthTables("pgsql") }),
  allowedRedirectUris: [redirectUri],
});
```

Load `oauth-provider-core` for authorization-server mode.
