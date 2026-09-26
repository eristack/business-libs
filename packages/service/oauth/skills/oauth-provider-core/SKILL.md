---
name: oauth-provider-core
description: >
  @eristack/oauth/provider: registerClient, authorization codes, PKCE token exchange,
  opaque access tokens for partner APIs — user must already be logged in via jwt-auth.
metadata:
  type: core
  library: "@eristack/oauth"
  library_version: "0.1.0"
sources:
  - "eristack/business-libs:packages/service/oauth/docs/provider.md"
---

# OAuth provider core

## Defaults

- Drizzle `oauth_provider_*` tables — not jwt-auth refresh rows.
- Confidential clients + PKCE for public mobile partners.
- App owns consent UI; library mints codes/tokens after `subject` is known.

## Minimal wiring

```ts
import { createOAuthProvider } from "@eristack/oauth/provider";
import { createDrizzleOAuthProviderStore, createOAuthTables } from "@eristack/oauth/drizzle";

const provider = createOAuthProvider({
  store: createDrizzleOAuthProviderStore({ db, tables: createOAuthTables("pgsql") }),
});

await provider.registerClient({
  clientId: "partner",
  clientSecret,
  redirectUris: ["https://partner.app/callback"],
  allowedScopes: ["openid", "profile"],
});
```

Express: `createOAuthProviderRouter` — POST `/token`.
