import { z } from "zod";

export const commsChannelSchema = z.enum(["email", "sms", "whatsapp"]);

export const sendCommsBodySchema = z.object({
  channel: commsChannelSchema,
  vendor: z.string().min(1),
  idempotencyKey: z.string().min(1),
  to: z.string().min(1),
  subject: z.string().optional(),
  text: z.string().optional(),
  html: z.string().optional(),
  from: z.string().optional(),
  metadata: z.record(z.string(), z.string()).optional(),
});
