import { z } from "zod";

export const uomCodeSchema = z.string().min(1).max(16);

export const uomQuantitySchema = z.object({
  amount: z.string().min(1),
  unit: uomCodeSchema,
});

export type UomQuantityJson = z.infer<typeof uomQuantitySchema>;
