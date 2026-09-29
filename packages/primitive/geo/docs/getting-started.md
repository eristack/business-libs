---
title: Getting started
description: Store GeoPoints in Drizzle, validate with geoPointSchema, run nearest-depot and radius checks with geoDistanceKm, choose precision, and keep geocoding at the app boundary.
---

# Getting started

## Install

```bash
pnpm add @eristack/geo
```

## Normalise at every write

```ts
import { normalizeGeoPoint, GeoParseError } from "@eristack/geo";

try {
  const point = normalizeGeoPoint({ latitude: body.lat, longitude: body.lng });
  await db.insert(partnerSites).values({ partnerId, latitude: point.latitude, longitude: point.longitude });
} catch (e) {
  if (e instanceof GeoParseError) return res.status(400).json({ code: e.code, message: e.message });
  throw e;
}
```

## Drizzle column

```ts
import { numeric, pgTable, text } from "drizzle-orm/pg-core";
import { entityIdColumn } from "@eristack/entity-id/drizzle";

export const partnerSites = pgTable("partner_sites", {
  id: entityIdColumn("pgsql", "id").primaryKey(),
  partnerId: text("partner_id").notNull(),
  latitude: numeric("latitude", { precision: 10, scale: 7 }),      // ±90.0000000  → ~1 cm
  longitude: numeric("longitude", { precision: 11, scale: 7 }),
});
```

Drizzle returns `numeric` as strings — exactly what `GeoPoint` wants. Do not use `doublePrecision`.

## Zod at the API boundary

```ts
import { geoPointSchema } from "@eristack/geo/zod";
import { GeoParseError } from "@eristack/geo";

const bodySchema = z.object({ name: z.string(), location: geoPointSchema });

// The transform throws GeoParseError (not a ZodError) on out-of-range values:
let parsed;
try {
  parsed = bodySchema.parse(req.body);
} catch (e) {
  if (e instanceof GeoParseError) return res.status(400).json({ code: e.code, message: e.message });
  if (e instanceof z.ZodError) return res.status(400).json({ code: "VALIDATION", issues: e.issues });
  throw e;
}
```

If you prefer issues instead of throws, wrap: `geoPointSchema.catch(…)` is not appropriate — use `superRefine` with your own `normalizeGeoPoint` try/catch.

## Nearest depot (app-level)

Fine for tens–hundreds of candidates:

```ts
import { geoDistanceKm } from "@eristack/geo";
import Decimal from "decimal.js";

function nearestDepot(target: GeoPoint, depots: Array<{ id: string } & GeoPoint>) {
  return depots
    .map((d) => ({ id: d.id, km: geoDistanceKm(target, d) }))
    .sort((a, b) => new Decimal(a.km).cmp(b.km))[0];
}

const within25 = depots.filter((d) => new Decimal(geoDistanceKm(target, d)).lte(25));
```

Compare with `Decimal`, not `parseFloat`, so `"905.354" < "1000.000"` behaves.

## Radius at scale (SQL)

For thousands of rows push the filter down; the haversine in SQL matches the package's formula:

```sql
SELECT id, 6371 * 2 * asin(sqrt(
  power(sin(radians(latitude - :lat) / 2), 2) +
  cos(radians(:lat)) * cos(radians(latitude)) * power(sin(radians(longitude - :lng) / 2), 2)
)) AS km
FROM partner_sites
WHERE … ORDER BY km LIMIT 20;
```

Then re-rank the shortlist in TypeScript with `geoDistanceKm` for the display value. With PostGIS, use `geography` + `ST_DWithin` instead.

## Precision

| Decimals | Resolution | Use |
| --- | --- | --- |
| 4 | ~11 m | city / area |
| 5 | ~1.1 m | building |
| 6–7 | ~11 cm – 1 cm | dock door, asset tracking |

`normalizeGeoPoint` keeps whatever precision the input had (trailing zeros removed). Round in the app if a provider returns 12 decimals you don't need.

## Geocoding boundary

```ts
// app service — provider-specific
const { lat, lng } = await mapbox.geocode(formatAddressOneLine(address));   // @eristack/address
const point = normalizeGeoPoint({ latitude: String(lat), longitude: String(lng) });
```

Convert provider numbers to strings **immediately**; store `point` and the provider name/timestamp for audit.

## Gotchas

- `geoDistanceKm` output is zero-padded to `scale` (`"0.000"`), but `normalizeGeoPoint` output is not — don't compare with `===`.
- `scale` must be an integer ≥ 0; `decimal.js` throws otherwise.
- Haversine on a sphere: ~0.3 % error vs. WGS-84 ellipsoid; fine for logistics, not for surveying.
- Distances across the antimeridian (±180°) are handled by the formula; bounding-box prefilters in SQL are not — special-case them.
- `formatGeoPoint` is `"lat, lng"`; many map SDKs want `[lng, lat]` — don't paste the string.

## Testing

```ts
import { geoDistanceKm, normalizeGeoPoint, GeoParseError } from "@eristack/geo";
import { expect, it } from "vitest";

it("normalises and measures", () => {
  expect(normalizeGeoPoint({ latitude: "1.35210", longitude: " 103.8198 " })).toEqual({ latitude: "1.3521", longitude: "103.8198" });
  expect(geoDistanceKm({ latitude: "-6.2088", longitude: "106.8456" }, { latitude: "1.3521", longitude: "103.8198" })).toBe("905.354");
  expect(() => normalizeGeoPoint({ latitude: "91", longitude: "0" })).toThrow(GeoParseError);
});
```

## Works with

| Package | Role |
| --- | --- |
| `@eristack/address` | Postal address — geo is separate lat/lng facts |
| `@eristack/dimension` | Freight dims vs route distance — compose in app |

Recipe **`geo-distance-logistics`** for depot radius checks.
