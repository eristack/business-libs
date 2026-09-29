---
title: Getting started
description: Use on partner routes after @eristack/rate-limit and before @eristack/idempotency (recipe platform-api-guard).
---

# Getting started

```bash
pnpm add @eristack/api-key
```

```ts
import { generateApiKey, hashApiKey, verifyApiKey } from "@eristack/api-key";

const { key, keyId } = generateApiKey();
const hash = hashApiKey(key, process.env.API_KEY_PEPPER);
// Store keyId + hash in Drizzle; show `key` once.

verifyApiKey(presentedKey, hash, process.env.API_KEY_PEPPER);
```

## Collaboration

Use on partner routes **after** `@eristack/rate-limit` and **before** `@eristack/idempotency` (recipe **`platform-api-guard`**).
