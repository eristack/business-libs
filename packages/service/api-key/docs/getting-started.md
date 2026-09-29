---
title: Getting started
description: App-owned api_keys table, Express authentication middleware, admin mint/rotate/revoke, and the rate-limit → api-key → idempotency guard chain.
---

# Getting started

## Install

```bash
pnpm add @eristack/api-key @eristack/rate-limit @eristack/idempotency
```

## Table (app-owned)

```ts
import { pgTable, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";
import { entityIdColumn } from "@eristack/entity-id/drizzle";

export const apiKeys = pgTable(
  "api_keys",
  {
    id: entityIdColumn("pgsql", "id").primaryKey(),
    tenantId: text("tenant_id").notNull(),
    partnerId: text("partner_id").notNull(),          // FK to your partners table
    keyId: text("key_id").notNull(),                  // public prefix — lookup + logs
    hash: text("hash").notNull(),                     // hashApiKey(key, pepper)
    label: text("label"),                             // "3PL sandbox", "Marketplace prod"
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" }).notNull(),
    lastUsedAt: timestamp("last_used_at", { withTimezone: true, mode: "string" }),
    revokedAt: timestamp("revoked_at", { withTimezone: true, mode: "string" }),
  },
  (t) => [uniqueIndex("api_keys_key_id_uq").on(t.keyId)],
);
```

Never add a `key` column.

## Mint (admin endpoint)

```ts
import { generateApiKey, hashApiKey } from "@eristack/api-key";

const PEPPER = process.env.API_KEY_PEPPER!;

app.post("/settings/api-keys", requireAuth, requirePermission("api-keys:manage"), async (req, res) => {
  const { key, keyId } = generateApiKey("esk");
  await db.insert(apiKeys).values({
    id: generateEntityId(),
    tenantId: req.tenantId,
    partnerId: req.body.partnerId,
    keyId,
    hash: hashApiKey(key, PEPPER),
    label: req.body.label,
    createdAt: new Date().toISOString(),
  });
  // The only time the full key is ever visible.
  res.status(201).json({ keyId, key, note: "Store this now — it cannot be shown again." });
});
```

## Authenticate (Express middleware)

```ts
import { verifyApiKey } from "@eristack/api-key";
import type { RequestHandler } from "express";

const PREFIX = "esk_";

export const requireApiKey: RequestHandler = async (req, res, next) => {
  const presented = req.header("x-api-key")?.trim();
  if (!presented?.startsWith(PREFIX)) return res.status(401).json({ error: "API_KEY_REQUIRED" });

  const keyId = presented.slice(PREFIX.length, PREFIX.length + 12);       // mirrors generateApiKey
  const row = await db.query.apiKeys.findFirst({ where: (t, { eq }) => eq(t.keyId, keyId) });

  if (!row || row.revokedAt || !verifyApiKey(presented, row.hash, PEPPER)) {
    return res.status(401).json({ error: "API_KEY_INVALID" });
  }

  req.partner = { id: row.partnerId, tenantId: row.tenantId, keyId };
  void db.update(apiKeys).set({ lastUsedAt: new Date().toISOString() }).where(eq(apiKeys.id, row.id)); // fire-and-forget
  next();
};
```

Return the same 401 for "unknown keyId" and "wrong secret" — do not tell attackers which half they got right.

## The guard chain

```ts
import { createRateLimiter } from "@eristack/rate-limit";
import { wrapIdempotentHandler } from "@eristack/idempotency/express";

const limiter = createRateLimiter({ windowMs: 60_000, max: 600 });

const rateLimitByIp: RequestHandler = (req, res, next) => {
  const r = limiter.check(req.ip ?? "unknown");
  res.setHeader("X-RateLimit-Remaining", String(r.remaining));
  if (!r.allowed) return res.status(429).json({ error: "RATE_LIMITED", resetAt: r.resetAt });
  next();
};

app.post(
  "/partner/shipments",
  rateLimitByIp,                                   // 1. cheap, before crypto
  requireApiKey,                                   // 2. who is calling
  wrapIdempotentHandler(                           // 3. dedupe retried POSTs per partner
    { guard, scopeFromReq: (req) => ({ tenantId: req.partner.id, scope: "POST /partner/shipments" }) },
    async (req) => createShipment(req.partner, req.body),
  ),
);
```

## Rotate and revoke

Rotation = mint a new key, give the partner an overlap window, then revoke the old one. Revocation is a timestamp, not a delete — keep the row for audit.

```ts
app.delete("/settings/api-keys/:keyId", requirePermission("api-keys:manage"), async (req, res) => {
  await db.update(apiKeys).set({ revokedAt: new Date().toISOString() }).where(eq(apiKeys.keyId, req.params.keyId));
  res.status(204).end();
});
```

Pepper rotation: verify with the old pepper, on success re-hash with the new one and update the row. Support two peppers during the transition.

## Gotchas

- `keyId` is the first 12 chars of the **secret**, not of the full `key` — strip the `prefix_` before slicing (as the middleware above does).
- `verifyApiKey` never throws; a corrupt `hash` column silently yields `false`. Alert on 401 spikes for a keyId.
- The pepper is part of the hash input. Changing it invalidates every stored hash unless you re-hash on verify.
- Keys are bearer secrets. Require TLS, never put them in URLs (they end up in logs), and log `keyId` only.
- No expiry is built in. Add `expiresAt` to your table if your compliance needs it and check it in the middleware.

## Testing

```ts
import { generateApiKey, hashApiKey, verifyApiKey } from "@eristack/api-key";
import { expect, it } from "vitest";

it("round-trips with pepper", () => {
  const { key, keyId } = generateApiKey("test");
  const hash = hashApiKey(key, "pepper");
  expect(key.startsWith("test_")).toBe(true);
  expect(key.slice(5, 17)).toBe(keyId);
  expect(verifyApiKey(key, hash, "pepper")).toBe(true);
  expect(verifyApiKey(key, hash, "other")).toBe(false);
  expect(verifyApiKey(key, "zz", "pepper")).toBe(false); // malformed hex → false, no throw
});
```
