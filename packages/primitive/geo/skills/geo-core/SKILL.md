---
name: geo-core
description: >
  @eristack/geo GeoPoint { latitude, longitude } decimal strings: normalizeGeoPoint (trim, range
  check lat ±90 / lng ±180, canonical toFixed, GeoParseError code GEO_PARSE_ERROR), geoDistanceKm
  (haversine, R=6371, HALF_UP to scale default 3, zero-padded), formatGeoPoint "lat, lng",
  zod geoPointSchema. Use for depot/site coordinates and radius checks; geocoding, routing, and
  PostGIS stay in the app. Drizzle numeric(10,7) not double.
metadata:
  author: eristack
  version: "0.1"
  type: core
  library: "@eristack/geo"
sources:
  - packages/primitive/geo/docs/getting-started.md
---

# @eristack/geo

Strings in, strings out, explicit rounding.

```ts
import { normalizeGeoPoint, geoDistanceKm, GeoParseError } from "@eristack/geo";
import { geoPointSchema } from "@eristack/geo/zod";

const p = normalizeGeoPoint({ latitude: " -6.2088 ", longitude: "106.8456000" }); // { "-6.2088", "106.8456" }
geoDistanceKm(p, { latitude: "1.3521", longitude: "103.8198" });                  // "905.354"
geoDistanceKm(p, q, { scale: 0 });                                                 // "905"
```

## Checklist

1. `normalizeGeoPoint` on every write; provider numbers → `String()` immediately.
2. Drizzle `numeric(10,7)` / `numeric(11,7)` (strings round-trip); never `doublePrecision`.
3. Zod transform **throws `GeoParseError`** (not ZodError) — catch both at the boundary → 400.
4. Compare/sort distances with `decimal.js` (`new Decimal(km).lte(25)`), not `parseFloat`.
5. Radius over many rows → SQL haversine or PostGIS `ST_DWithin`; re-rank shortlist with `geoDistanceKm`.

## Do not

- Geocode or route inside this package.
- Use `===` between `normalizeGeoPoint` output (unpadded) and `geoDistanceKm` output (padded).
- Pass `formatGeoPoint` strings to map SDKs expecting `[lng, lat]`.
