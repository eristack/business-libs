import { z } from "zod";

import { normalizeGeoPoint } from "../core/geo.js";

export const geoPointSchema = z
  .object({
    latitude: z.string(),
    longitude: z.string(),
  })
  .transform((value) => normalizeGeoPoint(value));
