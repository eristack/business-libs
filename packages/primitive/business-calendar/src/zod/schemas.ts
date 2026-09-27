import { z } from "zod";

import { normalizeWallDate } from "../core/wall-date.js";

export const wallDateSchema = z.string().transform((value) => normalizeWallDate(value));

export const businessCalendarOptionsSchema = z.object({
  weekendDays: z.array(z.number().int().min(0).max(6)),
  holidays: z.array(z.string()),
});
