---
title: Concepts
description: Code lengths, unit kinds, bundled data vs app masters, errors, and refresh policy.
---

# Concepts

## Official code lengths

National registry codes are **digits only** after normalization (dots and spaces stripped):

| Level | Digits | Example | Kind(s) in bundled data |
| --- | --- | --- | --- |
| Province | 2 | `31` | `province`, `special_region` |
| Regency / city | 4 | `3171` | `regency`, `city`, `administrative_city`, sometimes `former_residency` metadata |
| District | 7 | `3171010` | `district` |
| Village | 10 | `3171010001` | `urban_village`, `rural_village` |

`parseAdminDivisionCode` exposes prefix segments (`province`, `regency`, `district`, `village`) from length — no separate delimiter in storage.

## Unit kinds (`ID_ADMIN_UNIT_KINDS`)

Every kind has English metadata in `ID_ADMIN_UNIT_KIND_META`:

| Kind | In mandatory national registry | Typical use |
| --- | --- | --- |
| `province` | yes | Top-level admin |
| `special_region` | yes | Autonomous / special status province |
| `regency` | yes | Rural county (kabupaten) |
| `city` | yes | Urban municipality (kota) |
| `administrative_city` | yes | Administrative city (e.g. Jakarta municipalities) |
| `former_residency` | no | Historical residency grouping on regency metadata |
| `district` | yes | Sub-regency (kecamatan) |
| `urban_village` | yes | Urban village (kelurahan) |
| `rural_village` | yes | Rural village (desa) |
| `hamlet` | no | App-owned under a village |
| `community_block` | no | App-owned (RW) |
| `neighborhood` | no | App-owned (RT) |

`kindInMandatoryRegistry(kind)` drives whether `normalizeAdminDivisionCode` applies to stored codes.

## Bundled snapshot vs app masters

| Concern | Library | App |
| --- | --- | --- |
| Validate official digit lengths | `normalizeAdminDivisionCode` | — |
| Resolve name/kind for a known code | `createAdminDivisionRegistry` or `/bundled` | — |
| Which rows appear in pickers | — | Drizzle masters + `@eristack/data-grid` |
| Deactivated divisions | — | `deactivatedAt` on app rows; keep stored code on old documents |
| Sub-village (hamlet / RW / RT) | `subVillageBundledRow`, `formatSubVillageLocalCode` | Your tables; merge rows into `createAdminDivisionRegistry` |
| Production refresh | Re-run `pnpm sync:data` when publishing a dataset bump | Optional DB import from same JSON |

Bundled **names** come from the upstream open snapshot (often uppercase Indonesian place names). API **labels** for kinds are English; UI copy is app i18n.

## Sub-village local codes

Not part of the national 10-digit scheme. Format:

```text
{village10}.{H|W|N}{localId}
```

- `H` — hamlet  
- `W` — community block  
- `N` — neighborhood  

Example: `3171010001.N03`. Parent in registry rows is the official village code.

## Errors

| Class | When |
| --- | --- |
| `AdminDivisionError` | Bad length, empty code, invalid kind in bundled row |
| `AdminDivisionNotFoundError` | `registry.require(code)` miss |

## Dataset updates

1. Run `node packages/registries/id-wilayah/scripts/sync-bundled-data.mjs` (downloads IndoArea zip, writes `official-registry-2024.json.gz`).
2. Ship a **patch** release of `@eristack/id-wilayah` with the new gzip.
3. Apps re-import or rely on the updated npm bundle.

Do not hot-link external URLs at runtime in ERP production — pin the package version.

## Registries layer neighbors

| Need | Package |
| --- | --- |
| Country `ID` validation | `@eristack/iso-3166` |
| Postal line shape | `@eristack/address` |
| UN/LOCODE ports | `@eristack/unlocode` |
