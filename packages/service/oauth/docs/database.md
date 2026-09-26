---
title: Database
description: Drizzle tables for pending logins and provider artifacts.
---

# Database

```ts
import { createOAuthTables } from "@eristack/oauth/drizzle";

const tables = createOAuthTables("pgsql", "oauth");
```

| Table | Purpose |
| --- | --- |
| `oauth_pending_logins` | PKCE verifier + state (consumer callback) |
| `oauth_provider_clients` | Registered partner apps |
| `oauth_provider_authorization_codes` | One-time codes |
| `oauth_provider_access_tokens` | Opaque integrator access tokens |

Stores: `createDrizzleOAuthPendingStore`, `createDrizzleOAuthProviderStore`.

Tests: `@eristack/oauth/testing` memory stores only.
