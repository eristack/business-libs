import { z } from "zod";
import { PAYMENT_INTENT_STATUSES } from "../core/types.js";

export const moneyAmountSchema = z.object({
  currency: z.string().min(1),
  amount: z.string().min(1),
});

export const createIntentSchema = z.object({
  gateway: z.string().min(1),
  idempotencyKey: z.string().min(1),
  amount: moneyAmountSchema,
  ownerId: z.string().optional(),
  metadata: z.record(z.string(), z.string()).optional(),
});

export const paymentIntentStatusSchema = z.enum(PAYMENT_INTENT_STATUSES);
