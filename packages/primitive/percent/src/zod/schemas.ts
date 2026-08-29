import { z } from "zod";

/** Decimal ratio 0–1+ (e.g. "0.11" for 11%). */
export const percentRatioSchema = z.string().min(1);

export const percentSchema = z.object({
  ratio: percentRatioSchema,
});

export type PercentJson = z.infer<typeof percentSchema>;
