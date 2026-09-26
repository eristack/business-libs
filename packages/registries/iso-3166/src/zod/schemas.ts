import { z } from "zod";
import { isAssignedAlpha2, normalizeAlpha2 } from "../core/alpha2.js";
import { alpha3ToAlpha2 } from "../core/alpha3.js";
import { normalizeSubdivisionCode } from "../core/subdivision.js";

export const countryAlpha2Schema = z
  .string()
  .trim()
  .transform((value, ctx) => {
    try {
      return normalizeAlpha2(value);
    } catch (error) {
      ctx.addIssue({
        code: "custom",
        message: error instanceof Error ? error.message : "Invalid country code",
      });
      return z.NEVER;
    }
  });

export const countryAlpha2LooseSchema = z
  .string()
  .trim()
  .refine((value) => isAssignedAlpha2(value), {
    message: "Expected assigned ISO 3166-1 alpha-2 code",
  });

export const countryAlpha3Schema = z
  .string()
  .trim()
  .transform((value, ctx) => {
    try {
      return alpha3ToAlpha2(value);
    } catch (error) {
      ctx.addIssue({
        code: "custom",
        message: error instanceof Error ? error.message : "Invalid alpha-3 code",
      });
      return z.NEVER;
    }
  });

export const subdivisionCodeSchema = z
  .object({
    countryAlpha2: countryAlpha2Schema,
    subdivision: z.string().trim().min(1),
  })
  .transform(({ countryAlpha2, subdivision }) =>
    normalizeSubdivisionCode(countryAlpha2, subdivision),
  );
