---
title: Getting started
description: Install and allocate your first document number
sidebar_position: 2
---

# Getting started

```bash
pnpm add @eristack/doc-number
# optional: drizzle-orm for @eristack/doc-number/drizzle
```

## Pure format (no stores)

```ts
import { formatDocumentNumber, parseDocumentNumber } from "@eristack/doc-number";

formatDocumentNumber({
  pattern: "INV-{YYYY}{MM}-{SEQ:5}",
  sequence: 42,
  at: new Date("2026-08-11T00:00:00.000Z"),
});
// → "INV-202608-00042"

parseDocumentNumber("INV-{YYYY}{MM}-{SEQ:5}", "INV-202608-00042");
// → { sequence: 42, parts: { YYYY: "2026", MM: "08", SEQ: "00042" } }
```

## Allocate with memory stores

```ts
import {
  createDocNumber,
  createMemoryFormatStore,
  createMemorySequenceStore,
} from "@eristack/doc-number";

const docNumber = createDocNumber({
  formats: createMemoryFormatStore(),
  sequences: createMemorySequenceStore(),
});

await docNumber.registerFormat({
  entityKey: "invoice",
  pattern: "INV-{YYYY}{MM}-{SEQ:5}",
  reset: "monthly",
});

const next = await docNumber.next({ entityKey: "invoice" });
// { value, sequence, periodKey, formatId, … }

await docNumber.listFormats("invoice");
await docNumber.peekNext({ entityKey: "invoice" });
```

Swap memory stores for Drizzle in production ([Stores](./stores.md)).  
For admin settings UIs, mount Express/Nest or use the React hooks ([Adapters](./adapters.md)).
