import { z } from "zod";
import { FractionParseError } from "../core/errors.js";
import { parseFraction } from "../core/fraction.js";
import type { Fraction } from "../core/types.js";

const fractionShape = z.object({
  num: z.string().regex(/^-?\d+$/),
  den: z.string().regex(/^\d+$/).refine((d) => d !== "0", "denominator cannot be zero"),
});

export const fractionSchema: z.ZodType<Fraction> = fractionShape.transform((value, ctx) => {
  try {
    return parseFraction(`${value.num}/${value.den}`);
  } catch (err) {
    const message = err instanceof FractionParseError ? err.message : "Invalid fraction";
    ctx.addIssue({ code: "custom", message });
    return z.NEVER;
  }
});

export const fractionInputSchema = z.string().transform((value, ctx) => {
  try {
    return parseFraction(value);
  } catch (err) {
    const message = err instanceof FractionParseError ? err.message : "Invalid fraction";
    ctx.addIssue({ code: "custom", message });
    return z.NEVER;
  }
});
