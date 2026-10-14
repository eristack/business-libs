import { z } from "zod";
import { normalizeAdminDivisionCode } from "../core/code.js";
import { ID_ADMIN_UNIT_KINDS } from "../core/types.js";

export const idAdminUnitKindSchema = z.enum(ID_ADMIN_UNIT_KINDS);

export const adminDivisionCodeSchema = z.string().transform((raw, ctx) => {
  try {
    return normalizeAdminDivisionCode(raw);
  } catch (error) {
    ctx.addIssue({
      code: "custom",
      message: error instanceof Error ? error.message : "Invalid admin division code",
    });
    return z.NEVER;
  }
});
