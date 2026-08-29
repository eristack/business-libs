import { z } from "zod";

export const fiscalDateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

export const periodStatusSchema = z.enum(["open", "closed"]);

export const fiscalPeriodSchema = z.object({
  id: z.string().min(1),
  fiscalYear: z.number().int(),
  periodNumber: z.number().int().positive(),
  start: fiscalDateSchema,
  end: fiscalDateSchema,
  status: periodStatusSchema,
});

export const fiscalCalendarSchema = z.object({
  id: z.string().min(1),
  timezone: z.string().min(1),
  years: z.array(
    z.object({
      year: z.number().int(),
      periods: z.array(fiscalPeriodSchema).min(1),
    }),
  ),
});
