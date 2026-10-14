---
title: Getting started
description: Install, normalize official codes, bundled registry, custom rows, Zod, and address pairing for Indonesia ERP.
---

# Getting started

## Install

```bash
pnpm add @eristack/id-wilayah
```

Optional Zod 4:

```bash
pnpm add zod
```

Bundled national data (Node only):

```ts
import { loadBundledAdminDivisionRegistry } from "@eristack/id-wilayah/bundled";
```

## 1. Normalize on API and form submit

Reject bad codes before Drizzle — same string in React and Express:

```ts
import { normalizeAdminDivisionCode } from "@eristack/id-wilayah";

export function parseVillageCode(raw: string) {
  return normalizeAdminDivisionCode(raw);
  // "31.71.010.001" style input → digits only → "3171010001" when length is 10
}
```

Valid lengths: **2** (province), **4** (regency/city), **7** (district), **10** (village). Anything else throws `AdminDivisionError`.

## 2. Parse hierarchy from a code

```ts
import { parseAdminDivisionCode, parentAdminDivisionCode } from "@eristack/id-wilayah";

const parsed = parseAdminDivisionCode("3171010001");
// {
//   code: "3171010001",
//   level: "village",
//   segments: { province: "31", regency: "3171", district: "3171010", village: "3171010001" }
// }

parentAdminDivisionCode(parsed.code); // "3171010" (district)
```

Use segments to load labels from your registry or the bundled snapshot without string-splitting in the app.

## 3. In-memory registry (tests, seeds, custom imports)

```ts
import {
  createAdminDivisionRegistry,
  bundledRowFromRecord,
} from "@eristack/id-wilayah";

const registry = createAdminDivisionRegistry([
  bundledRowFromRecord({
    code: "31",
    name: "DKI JAKARTA",
    kind: "province",
  }),
  bundledRowFromRecord({
    code: "3171",
    name: "SOUTH JAKARTA",
    kind: "administrative_city",
  }),
  bundledRowFromRecord({
    code: "3171010",
    name: "JAGAKARSA",
    kind: "district",
  }),
  bundledRowFromRecord({
    code: "3171010001",
    name: "CIPEDAK",
    kind: "urban_village",
  }),
]);

registry.require("3171010001").name;
registry.childrenOf("3171").map((r) => r.code);
registry.listByKind("district");
```

`get` accepts normalized or formatted digits; `require` throws `AdminDivisionNotFoundError` when missing.

## 4. Full national snapshot (Node)

```ts
import { loadBundledAdminDivisionRegistry } from "@eristack/id-wilayah/bundled";

const registry = await loadBundledAdminDivisionRegistry();
// ~38 provinces, ~514 regencies/cities, ~7k districts, ~84k villages (Apr 2024 snapshot)

registry.require("3171010001");
registry.childrenOf("31"); // regencies/cities in Jakarta province
```

Loader reads `official-registry-2024.json.gz` shipped under `dist/bundled`. Cached in-process after first load.

For custom pipelines:

```ts
import { loadBundledAdminDivisionRows } from "@eristack/id-wilayah/bundled";
import { createAdminDivisionRegistry } from "@eristack/id-wilayah";

const rows = await loadBundledAdminDivisionRows();
const subset = rows.filter((r) => r.c.startsWith("31"));
const jakarta = createAdminDivisionRegistry(subset);
```

## 5. Hamlet, community block, neighborhood (app-owned)

National registry stops at village. Model lower levels in your DB and optional registry rows:

```ts
import {
  createAdminDivisionRegistry,
  subVillageBundledRow,
  formatSubVillageLocalCode,
} from "@eristack/id-wilayah";

const localId = formatSubVillageLocalCode("3171010001", "neighborhood", "03");
// "3171010001.N03"

const rows = [
  /* ...official bundled rows for the village... */,
  subVillageBundledRow({
    villageCode: "3171010001",
    kind: "neighborhood",
    localId: "03",
    name: "Neighborhood 3",
  }),
];

const registry = createAdminDivisionRegistry(rows);
registry.get(localId);
```

Kind metadata: `ID_ADMIN_UNIT_KIND_META.neighborhood.label` → `"Neighborhood"`.

## 6. Unit kind helpers

```ts
import {
  ID_ADMIN_UNIT_KINDS,
  ID_ADMIN_UNIT_KIND_META,
  isIdAdminUnitKind,
  kindInMandatoryRegistry,
} from "@eristack/id-wilayah";

isIdAdminUnitKind("urban_village"); // true
kindInMandatoryRegistry("hamlet"); // false
ID_ADMIN_UNIT_KIND_META.city.label; // "City"
```

Use kinds on Drizzle master columns (`kind text not null`) and data-grid filters.

## 7. Zod on HTTP bodies

```ts
import { adminDivisionCodeSchema, idAdminUnitKindSchema } from "@eristack/id-wilayah/zod";

adminDivisionCodeSchema.parse("3171010001");
idAdminUnitKindSchema.parse("rural_village");
```

## 8. With country and address

Indonesia country code validation stays on `@eristack/iso-3166`. Postal **shape** stays on `@eristack/address`. This package owns **admin division codes** only:

```ts
import { normalizeAlpha2 } from "@eristack/iso-3166";
import { normalizeAddress } from "@eristack/address";
import { normalizeAdminDivisionCode } from "@eristack/id-wilayah";

const countryCode = normalizeAlpha2("ID");
const villageCode = normalizeAdminDivisionCode(body.villageCode);
const addr = normalizeAddress({
  ...body,
  countryCode,
  region: undefined, // or ISO 3166-2 ID-JK when you use subdivisions separately
});
// Store villageCode on your partner/site row — not in @eristack/address core
```

## 9. Refresh bundled data (maintainers)

From repo root:

```bash
node packages/registries/id-wilayah/scripts/sync-bundled-data.mjs
pnpm --filter @eristack/id-wilayah build
```

Commit updated `src/bundled/official-registry-2024.json.gz` and release a patch.

## Production checklist

1. Store **normalized codes** (strings) in Postgres — not display names.
2. Pickers: app masters or `loadBundledAdminDivisionRegistry` + filter; hide `deactivatedAt` rows for new picks.
3. Validate writes with `normalizeAdminDivisionCode` (or Zod schema).
4. Pin package version; do not fetch live wilayah JSON from random URLs in API handlers.

## Related packages

| Need | Package |
| --- | --- |
| Country `ID` / ISO 3166-2 | `@eristack/iso-3166` |
| Postal address normalize | `@eristack/address` |
| List UI / filters | `@eristack/data-grid`, `@eristack/form-ui` |
