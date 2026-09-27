import { z } from "zod";

import { normalizeCurrencyPair } from "../core/pair.js";

export const currencyPairSchema = z
  .object({
    base: z.string(),
    quote: z.string(),
  })
  .transform((value) => normalizeCurrencyPair(value.base, value.quote));
