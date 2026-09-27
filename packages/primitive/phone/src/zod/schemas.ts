import { z } from "zod";
import { normalizeE164 } from "../core/phone.js";

export const e164PhoneSchema = z.string().transform((v, ctx) => {
  try {
    return normalizeE164(v);
  } catch (err) {
    ctx.addIssue({
      code: "custom",
      message: err instanceof Error ? err.message : "Invalid phone",
    });
    return z.NEVER;
  }
});
