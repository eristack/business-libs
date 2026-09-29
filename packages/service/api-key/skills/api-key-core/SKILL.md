---
name: api-key-core
description: >
  @eristack/api-key generateApiKey (prefix_secret + public keyId), hashApiKey (peppered SHA-256),
  verifyApiKey (constant-time, never throws) — partner/B2B machine credentials for /partner routes.
  App owns the api_keys table (keyId + hash, never the key). Guard order: rate-limit → api-key →
  idempotency. Not human login (@eristack/jwt-auth) or OAuth clients (@eristack/oauth/provider).
metadata:
  author: eristack
  version: "0.1"
  type: core
  library: "@eristack/api-key"
sources:
  - packages/service/api-key/docs/getting-started.md
---

# @eristack/api-key

Three functions; the app owns storage, partner linkage, permissions, and revocation.

```ts
import { generateApiKey, hashApiKey, verifyApiKey } from "@eristack/api-key";

const { key, keyId } = generateApiKey("esk");          // key "esk_<32 base64url>", keyId = secret.slice(0,12)
await insert({ keyId, hash: hashApiKey(key, PEPPER) }); // show `key` once, never store it
const row = await findByKeyId(presented.slice(4, 16));  // strip "esk_" then 12 chars
verifyApiKey(presented, row.hash, PEPPER);              // boolean; false on bad hex, never throws
```

## Checklist

1. Table `api_keys(key_id unique, hash, partner_id, tenant_id, label, created_at, last_used_at, revoked_at)` — no `key` column.
2. `API_KEY_PEPPER` from env/secret manager; rotate by verify-old → re-hash-new.
3. Express middleware: same 401 for unknown keyId and bad secret; skip when `revoked_at` set; set `req.partner`.
4. Route chain: `@eristack/rate-limit` (IP) → `requireApiKey` → `@eristack/idempotency` `wrapIdempotentHandler` scoped by partner → handler. Recipe `platform-api-guard`.
5. Authorization via `@eristack/rbac` subject `apikey:<keyId>`; log `keyId` only.

## Do not

- Use for browser users/sessions (`@eristack/jwt-auth`) or third-party OAuth apps (`@eristack/oauth/provider`).
- Put keys in URLs or logs.
- Compare hashes with `===` — always `verifyApiKey`.
- Delete key rows on revoke — timestamp them.
