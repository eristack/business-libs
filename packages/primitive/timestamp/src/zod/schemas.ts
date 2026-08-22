import { z } from "zod";
import type { TimestampJSON } from "../core/serialize/json.js";
import { timestampFromJSON } from "../core/serialize/json.js";
import type { ZonedInstant } from "../core/instant/zoned-instant.js";
import type { WallClock } from "../core/wall/wall-clock.js";
import { validateTimestampJSON } from "../core/validate/timestamp-json.js";
import { assertTimeZoneId } from "../core/timezone/registry.js";

const timeZoneIdSchema = z
  .string()
  .min(1)
  .superRefine((value, ctx) => {
    try {
      assertTimeZoneId(value);
    } catch (error) {
      ctx.addIssue({
        code: "custom",
        message: error instanceof Error ? error.message : "Invalid timezone",
      });
    }
  });

const instantJsonSchema = z.object({
  kind: z.literal("instant"),
  instant: z.string(),
  timezone: timeZoneIdSchema,
});

const wallJsonSchema = z.object({
  kind: z.literal("wall"),
  local: z.string(),
  timezone: timeZoneIdSchema,
});

function refineTimestampJson(
  value: TimestampJSON,
  ctx: z.RefinementCtx,
  path: string,
) {
  try {
    validateTimestampJSON(value, path);
  } catch (error) {
    ctx.addIssue({
      code: "custom",
      message:
        error instanceof Error ? error.message : "Invalid timestamp JSON",
    });
  }
}

export const instantJSONSchema = instantJsonSchema.superRefine((value, ctx) => {
  refineTimestampJson(value, ctx, "timestamp");
});

export const wallJSONSchema = wallJsonSchema.superRefine((value, ctx) => {
  refineTimestampJson(value, ctx, "timestamp");
});

export const timestampJSONSchema = z
  .discriminatedUnion("kind", [instantJsonSchema, wallJsonSchema])
  .superRefine((value, ctx) => {
    refineTimestampJson(value, ctx, "timestamp");
  });

export const timestampJSONSchemaOptional = timestampJSONSchema.optional();
export const timestampJSONSchemaNullable = timestampJSONSchema.nullable();

export function timestampSchema(path = "timestamp") {
  return timestampJSONSchema
    .superRefine((json, ctx) => {
      refineTimestampJson(json, ctx, path);
    })
    .transform((json) => timestampFromJSON(json));
}

export const timestampSchemaDefault = timestampSchema();

export function instantSchema(path = "timestamp") {
  return instantJSONSchema
    .superRefine((json, ctx) => {
      refineTimestampJson(json, ctx, path);
    })
    .transform((json) => timestampFromJSON(json) as ZonedInstant);
}

export function wallSchema(path = "timestamp") {
  return wallJSONSchema
    .superRefine((json, ctx) => {
      refineTimestampJson(json, ctx, path);
    })
    .transform((json) => timestampFromJSON(json) as WallClock);
}

export const timeZoneIdSchemaExport = timeZoneIdSchema;

export type TimestampJSONSchema = z.infer<typeof timestampJSONSchema>;
