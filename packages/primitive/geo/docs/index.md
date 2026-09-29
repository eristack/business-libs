---
title: Overview
description: Latitude/longitude as canonical decimal strings — range-checked normalisation, haversine great-circle distance in km with configurable scale, display formatting, and a Zod schema. No geocoding, no maps.
---

# @eristack/geo

Warehouses, delivery points, branches, and service areas carry a coordinate. Stored as JS numbers those coordinates drift (`103.81980000000001`), lose trailing precision, and get compared with `===` unpredictably. `@eristack/geo` keeps a `GeoPoint` as **two decimal strings**, validates the ranges once at the boundary, and gives you the one computation an ERP actually needs from coordinates — great-circle distance — done in `decimal.js` and rounded explicitly.

Geocoding (address → coordinates), routing, and map rendering are provider concerns and stay in the app.

## Use it when

- Persisting coordinates on partner sites, depots, vehicles, or service zones.
- Validating `latitude`/`longitude` in API bodies (`@eristack/geo/zod`).
- Radius checks: "which depots are within 25 km of this delivery address?"

## Not for

- Geocoding or reverse geocoding — call Google/Mapbox/Nominatim in the app and store the result here.
- Driving distance/time — haversine is straight-line over a sphere.
- GIS queries at scale — use PostGIS `ST_DWithin`; this package is for application-level math.

## Install

```bash
pnpm add @eristack/geo
pnpm add zod        # only for @eristack/geo/zod
```

No `@eristack/*` peers.

## 30-second example

```ts
import { normalizeGeoPoint, geoDistanceKm, formatGeoPoint } from "@eristack/geo";

const jakarta = normalizeGeoPoint({ latitude: " -6.2088 ", longitude: "106.8456000" });
// → { latitude: "-6.2088", longitude: "106.8456" }   (trimmed, trailing zeros dropped)

geoDistanceKm(jakarta, { latitude: "1.3521", longitude: "103.8198" });        // "905.354"
geoDistanceKm(jakarta, { latitude: "1.3521", longitude: "103.8198" }, { scale: 0 }); // "905"
formatGeoPoint(jakarta);                                                       // "-6.2088, 106.8456"
```

## API

| Export | Signature | Notes |
| --- | --- | --- |
| `normalizeGeoPoint` | `(input: GeoPoint) => GeoPoint` | Trims, parses via `decimal.js`, checks lat ∈ [-90, 90], lng ∈ [-180, 180], returns canonical `toFixed()` strings (no exponent, no trailing zeros). Throws `GeoParseError`. |
| `geoDistanceKm` | `(a: GeoPoint, b: GeoPoint, { scale? = 3 }) => string` | Haversine, Earth radius 6371 km, `ROUND_HALF_UP` to `scale` decimals, zero-padded (`"0.000"`). Normalises both inputs first. |
| `formatGeoPoint` | `(point: GeoPoint) => string` | `"lat, lng"` after normalisation. |
| `GeoParseError` | `class extends Error { code: "GEO_PARSE_ERROR" }` | Messages: `latitude is required`, `latitude must be a decimal string`, `latitude must be finite`, `latitude out of range` (same for longitude). |
| `GeoPoint` | `{ latitude: string; longitude: string }` | |
| `GeoDistanceOptions` | `{ scale?: number }` | |
| `@eristack/geo/zod` → `geoPointSchema` | `z.object({ latitude: z.string(), longitude: z.string() }).transform(normalizeGeoPoint)` | Parse errors surface as thrown `GeoParseError` inside the transform — see getting started for `safeParse` handling. |

## Works with

- `@eristack/address` — postal fields; store `GeoPoint` beside the address row after geocoding.
- `@eristack/dimension` / `@eristack/uom` — freight volume + route distance compose in the app for rate cards.
- `@eristack/data-grid` — filter by `latitude`/`longitude` as `decimal` field types; radius filters happen in SQL.
- Drizzle — `numeric(10, 7)` columns or `text`; map to/from strings, never `double precision`.

## For agents

- Skill: `pnpm dlx @tanstack/intent@latest load @eristack/geo#geo-core`
- Recipe: `geo-distance-logistics`.

## Next

- [Getting started](./getting-started.md) — Drizzle columns, Zod error handling, depot radius search (app-level and SQL), precision guidance, and the geocoding boundary.
