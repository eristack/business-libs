import { z } from "zod";
import { normalizeUnlocode } from "../core/unlocode.js";

export const unlocodeSchema = z
  .string()
  .trim()
  .transform((value, ctx) => {
    try {
      return normalizeUnlocode(value);
    } catch (error) {
      ctx.addIssue({
        code: "custom",
        message: error instanceof Error ? error.message : "Invalid UN/LOCODE",
      });
      return z.NEVER;
    }
  });
