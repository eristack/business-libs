---
title: Overview
description: Generate partner API keys, store only a peppered SHA-256 hash, and verify in constant time — the B2B credential for machine-to-machine routes that jwt-auth does not cover.
---

# @eristack/api-key

Partners integrating with your ERP (a 3PL posting shipment updates, a marketplace pulling stock) do not log in with a username and password. They present a long-lived secret on every request. `@eristack/api-key` handles the three operations that secret needs — **generate**, **hash for storage**, **verify** — and nothing else. Your app owns the `api_keys` table, the partner it belongs to, and what the key is allowed to do.

## Use it when

- Exposing a `/partner/*` or `/v1/integrations/*` surface to other systems.
- A tenant admin needs to mint, rotate, and revoke keys from a settings screen.
- You want the key shown **once**, and only a hash in the database.

## Not for

- Human login, sessions, refresh tokens — `@eristack/jwt-auth`.
- Third-party OAuth clients (authorization codes, scopes, consent) — `@eristack/oauth/provider`.
- Authorizing what the caller may do — attach the key row to a subject and use `@eristack/rbac` / `@eristack/pbac`.
- Rate limiting or replay protection — `@eristack/rate-limit`, `@eristack/idempotency` (same guard chain, see below).

## Install

```bash
pnpm add @eristack/api-key
```

No peers. Node ≥ 20 (`node:crypto`).

## 30-second example

```ts
import { generateApiKey, hashApiKey, verifyApiKey } from "@eristack/api-key";

const pepper = process.env.API_KEY_PEPPER!;              // server secret, not in the DB

// Mint (admin action)
const { key, keyId } = generateApiKey("esk");            // key: "esk_<32 url-safe chars>", keyId: first 12 chars of the secret
await db.insert(apiKeys).values({ keyId, hash: hashApiKey(key, pepper), partnerId, createdAt });
return { key };                                          // show once; never persist `key`

// Verify (every partner request)
const presented = req.header("x-api-key");
const row = await findByKeyId(keyIdFrom(presented));    // lookup by public prefix
const ok = row && verifyApiKey(presented, row.hash, pepper);
```

## API

| Export | Signature | Notes |
| --- | --- | --- |
| `generateApiKey` | `(prefix = "esk") => { key: string; keyId: string }` | 24 random bytes → base64url (32 chars). `key = "${prefix}_${secret}"`. `keyId` = first 12 chars of the secret — safe to store and log, used for lookup. |
| `hashApiKey` | `(key: string, pepper = "") => string` | `sha256(pepper + key)` hex. Store this. |
| `verifyApiKey` | `(key: string, storedHashHex: string, pepper = "") => boolean` | Recomputes and `timingSafeEqual`s. Returns `false` (never throws) on length mismatch or malformed hex. |
| `GeneratedApiKey` | `{ key: string; keyId: string }` | |

### Why a pepper

Keys are high-entropy (192 bits), so brute-forcing a SHA-256 hash is infeasible even unpeppered. The pepper protects against a **database-only** leak: without it, a dumped `api_keys` table could be used to verify guessed keys offline. Keep it in the environment/secret manager, never in the DB, and rotate by re-hashing on next use.

## Guard order on partner routes

```
rate-limit  →  api-key  →  idempotency  →  handler
```

Rate-limit first (cheap, protects the hash step from abuse), then authenticate, then dedupe writes. Canonical guide: `@eristack/ai-knowledge#party-and-platform-compose` § platform API guard; recipe `platform-api-guard`.

## Works with

- `@eristack/rate-limit` — key the limiter by `keyId` (after auth) or IP (before).
- `@eristack/idempotency` — scope the idempotency key by partner: `{ tenantId: row.partnerId, scope: "POST /partner/shipments" }`.
- `@eristack/rbac` — `assignRole(subjectId = "apikey:" + keyId, "partner-3pl")`.
- `@eristack/logger` — log `keyId`, never `key`.

## For agents

- Skill: `pnpm dlx @tanstack/intent@latest load @eristack/api-key#api-key-core`
- Recipes: `api-key-partner-auth`, `platform-api-guard`.

## Next

- [Getting started](./getting-started.md) — Drizzle table, Express middleware, rotation and revocation, and the admin mint flow.
