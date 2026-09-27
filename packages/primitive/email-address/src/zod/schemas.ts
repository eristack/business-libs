import { z } from "zod";
import { normalizeEmail } from "../core/email.js";

export const emailAddressSchema = z.string().transform((v, ctx) => {
  try {
    return normalizeEmail(v);
  } catch (err) {
    ctx.addIssue({
      code: "custom",
      message: err instanceof Error ? err.message : "Invalid email",
    });
    return z.NEVER;
  }
});
