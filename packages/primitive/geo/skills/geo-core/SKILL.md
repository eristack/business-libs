---
name: geo-core
description: >
  @eristack/geo normalizeGeoPoint, geoDistanceKm — lat/lng decimal strings (Wave 13 B2).
  No geocoding in core.
metadata:
  author: eristack
  version: "0.0"
sources:
  - packages/primitive/geo/docs/getting-started.md
---

# @eristack/geo

```ts
import { normalizeGeoPoint, geoDistanceKm } from "@eristack/geo";

const p = normalizeGeoPoint({ latitude: "-6.2", longitude: "106.8" });
geoDistanceKm(p, p); // "0.000"
```

## Checklist

1. Store lat/lng as **strings** from `normalizeGeoPoint`.
2. Latitude ∈ [-90, 90], longitude ∈ [-180, 180].
3. Distance is haversine km — not driving time; geocode in the app.

## Do not

- Bundle geocoding APIs in core
- Use JS number literals for coordinates at boundaries
