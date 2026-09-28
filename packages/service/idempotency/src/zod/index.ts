import { z } from "zod";

export const idempotencyScopeSchema = z.object({
  tenantId: z.string().min(1).optional(),
  scope: z.string().min(1),
});

export const idempotencyKeySchema = z.string().min(1).max(255);
