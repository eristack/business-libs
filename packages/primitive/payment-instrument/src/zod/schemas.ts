import { z } from "zod";
import { isRawPanString } from "../core/pan-detect.js";
import { normalizePaymentInstrumentDisplay } from "../core/display.js";
import { normalizeGatewayPaymentMethodRef } from "../core/gateway-ref.js";
import { CARD_BRANDS, CARD_FUNDINGS } from "../core/types.js";

const noRawPan = (value: string) => !isRawPanString(value);

export const gatewayPaymentMethodRefSchema = z
  .object({
    gateway: z.string().trim().min(1).refine(noRawPan, "gateway invalid"),
    tokenId: z
      .string()
      .trim()
      .min(1)
      .refine((v) => !isRawPanString(v), "tokenId must not be a raw PAN"),
    fingerprint: z.string().trim().optional(),
  })
  .transform((v) => normalizeGatewayPaymentMethodRef(v));

export const paymentInstrumentDisplaySchema = z
  .object({
    last4: z.string().regex(/^\d{4}$/),
    brand: z.enum(CARD_BRANDS),
    funding: z.enum(CARD_FUNDINGS),
    expMonth: z.number().int().min(1).max(12),
    expYear: z.number().int().min(2000).max(2100),
  })
  .transform((v) => normalizePaymentInstrumentDisplay(v));

export const persistablePaymentInstrumentSchema = z
  .object({
    display: paymentInstrumentDisplaySchema,
    gateway: gatewayPaymentMethodRefSchema,
  })
  .transform((v) => ({ display: v.display, gateway: v.gateway }));
