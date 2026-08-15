# @eristack/epoch

New service package — headless data-version epochs for cache invalidation.

## Core

- `createEpoch({ store })` — `current`, `bump`, `resolveCachePolicy`, `compareEpochs`
- `CachePolicy`: `use-cache` | `refetch`
- `StaleEpochError` on optimistic bump mismatch

## Adapters shipped

`.`, `./drizzle`, `./rest`, `./express`, `./nest`, `./client`, `./react`, `./backseat`, `./backseat/store`

## ai-knowledge

- Recipe `epoch-cache-invalidation`
- Catalog sync (17 packages)
- Upgrading §3 Backseat row for epoch

## Changesets

- `.changeset/epoch-package.md` (minor → 0.1.0)
- `.changeset/ai-knowledge-epoch-catalog.md` (patch)
