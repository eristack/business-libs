import { z } from "zod";

import { parseEntityId } from "../core/entity-id.js";

export const entityIdSchema = z
  .string()
  .transform((value, ctx) => {
    try {
      return parseEntityId(value);
    } catch (err) {
      ctx.addIssue({
        code: "custom",
        message: err instanceof Error ? err.message : "Invalid entity id",
      });
      return z.NEVER;
    }
  });

export type EntityIdSchemaOutput = z.infer<typeof entityIdSchema>;
