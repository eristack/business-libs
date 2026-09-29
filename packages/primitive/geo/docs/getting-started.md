---
title: Getting started
description: Recipe geo-distance-logistics for depot radius checks.
---

# Getting started

```bash
pnpm add @eristack/geo
```

```ts
import { normalizeGeoPoint, geoDistanceKm } from "@eristack/geo";

const warehouse = normalizeGeoPoint({
  latitude: "-6.2088",
  longitude: "106.8456",
});

geoDistanceKm(warehouse, {
  latitude: "1.3521",
  longitude: "103.8198",
}); // ~893 km
```

## Zod

```ts
import { geoPointSchema } from "@eristack/geo/zod";

geoPointSchema.parse(body);
```

## Works with

| Package | Role |
| --- | --- |
| `@eristack/address` | Postal address — geo is separate lat/lng facts |
| `@eristack/dimension` | Freight dims vs route distance — compose in app |

Recipe **`geo-distance-logistics`** for depot radius checks.
