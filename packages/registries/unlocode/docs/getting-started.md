---
title: Getting started
description: Normalize port codes, display, sample list, Zod, and app master pattern.
---

# Getting started

## Install

```bash
pnpm add @eristack/unlocode @eristack/iso-3166
```

(`iso-3166` is a runtime dependency of `unlocode`.)

## 1. Normalize on write

```ts
import { normalizeUnlocode, parseUnlocode } from "@eristack/unlocode";

const pol = normalizeUnlocode("id jkt"); // "IDJKT"
const { country, location } = parseUnlocode(pol); // country "ID", location "JKT"
```

Store **compact** form (`IDJKT`) in Postgres; format for display at read time.

## 2. Display

```ts
import { formatUnlocodeDisplay } from "@eristack/unlocode";

formatUnlocodeDisplay("USNYC"); // "US NYC"
```

## 3. Sample list vs full UN register

`isSampleUnlocode` checks a **small shipped sample** (major ports) — not the full UN registry:

```ts
import { isSampleUnlocode } from "@eristack/unlocode";

isSampleUnlocode("IDJKT"); // true
isSampleUnlocode("IDZZZ"); // false (format may still pass normalizeUnlocode if country valid)
```

| API | Validates |
| --- | --- |
| `normalizeUnlocode` | Shape, charset, **assigned country** |
| `isSampleUnlocode` | In-package sample only |
| Future `@eristack/reference-data` | Full UN release files |

## 4. Zod

```ts
import { unlocodeSchema } from "@eristack/unlocode/zod";

unlocodeSchema.parse("SG SIN"); // "SGSIN"
```

## 5. App master pattern

```text
Table port_sites (
  locode text not null,  -- store normalized IDJKT
  label text,
  is_active boolean
)
```

Validate on write with `normalizeUnlocode`; list filters via `@eristack/data-grid`. The library does **not** own which ports your tenant enables.

## ERP documents

Use normalized locodes on B/L and forwarding line fields; pair with `@eristack/ai-knowledge#document-lines-erp` when lines carry money via `@eristack/qups`.
