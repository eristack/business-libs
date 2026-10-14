---
name: id-wilayah-core
description: >
  @eristack/id-wilayah Indonesia official admin division codes (2/4/7/10 digits),
  bundled registry through villages, unit kinds through hamlet/community block/neighborhood.
  Use for Indonesian ERP address masters, KTP-style hierarchy pickers, and validating
  ministry numeric codes — not geocoding or postal validation alone.
metadata:
  type: core
  library: "@eristack/id-wilayah"
  library_version: "0.0.0"
sources:
  - "eristack/business-libs:packages/registries/id-wilayah/docs/getting-started.md"
---

# Indonesia admin divisions

```ts
import {
  normalizeAdminDivisionCode,
  parseAdminDivisionCode,
  createAdminDivisionRegistry,
  ID_ADMIN_UNIT_KIND_META,
} from "@eristack/id-wilayah";
import { loadBundledAdminDivisionRegistry } from "@eristack/id-wilayah/bundled";
```

## When to use

- User asks for **Indonesia province / regency / kecamatan / desa / kelurahan** codes or pickers.
- Validate **numeric ministry-style codes** on API write — not float, not ad-hoc slugs.
- Need **English unit kinds** including **hamlet**, **community block**, **neighborhood** for forms (app-owned below village).

## Code rules

- `normalizeAdminDivisionCode(raw)` → digits only; lengths **2 / 4 / 7 / 10** or throw `AdminDivisionError`.
- `parseAdminDivisionCode` → `{ level, segments }`; `parentAdminDivisionCode` for prefix parent.
- Compare: `compareAdminDivisionCode`.

## Registry

- **Custom:** `createAdminDivisionRegistry(rows)` with compact rows `{ c, n, k, p }` or `bundledRowFromRecord`.
- **Full snapshot (Node):** `await loadBundledAdminDivisionRegistry()` — Apr 2024 gzip (~84k villages).
- **Sub-village:** `subVillageBundledRow`, `formatSubVillageLocalCode` → `{village10}.H|W|N{localId}`.

## Kinds

- `ID_ADMIN_UNIT_KINDS`, `ID_ADMIN_UNIT_KIND_META[kind].label` (English).
- `kindInMandatoryRegistry(kind)` — false for hamlet / community block / neighborhood.

## Zod

`@eristack/id-wilayah/zod` — `adminDivisionCodeSchema`, `idAdminUnitKindSchema`.

## Pairing

- Country: `@eristack/iso-3166` (`normalizeAlpha2("ID")`).
- Postal shape: `@eristack/address` — store admin codes on **app** columns, not in address core.
- Pickers / lists: app Drizzle masters + `@eristack/data-grid`; library supplies validation + optional bundled names.

## Do not

- Use Bahasa identifiers in TypeScript APIs (package exports are English).
- Treat bundled place **names** as i18n source of truth — they are snapshot labels; app owns display.
- Fetch unofficial live wilayah APIs in production — pin `@eristack/id-wilayah` version.
