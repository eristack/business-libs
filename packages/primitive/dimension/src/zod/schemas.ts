import { z } from "zod";

import { normalizeDimension } from "../core/dimension.js";

export const dimensionSchema = z
  .object({
    length: z.string(),
    width: z.string(),
    height: z.string(),
    unit: z.string().optional(),
  })
  .transform((value) => normalizeDimension(value));
