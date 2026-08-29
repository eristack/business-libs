import { z } from "zod";

export const resetPeriodSchema = z.enum(["never", "yearly", "monthly", "daily"]);

export const registerFormatBodySchema = z.object({
  entityKey: z.string().min(1),
  pattern: z.string().min(1),
  reset: resetPeriodSchema.optional(),
  timezone: z.string().min(1).optional(),
  prefix: z.string().optional(),
  id: z.string().min(1).optional(),
  active: z.boolean().optional(),
});

export const updateFormatBodySchema = z.object({
  id: z.string().min(1),
  entityKey: z.string().min(1).optional(),
  pattern: z.string().min(1).optional(),
  reset: resetPeriodSchema.optional(),
  timezone: z.string().min(1).nullable().optional(),
  prefix: z.string().nullable().optional(),
  active: z.boolean().optional(),
});

export const nextDocumentNumberBodySchema = z.object({
  entityKey: z.string().min(1),
  at: z.coerce.date().optional(),
  scope: z.string().optional(),
});

export type RegisterFormatBody = z.infer<typeof registerFormatBodySchema>;
export type UpdateFormatBody = z.infer<typeof updateFormatBodySchema>;
export type NextDocumentNumberBody = z.infer<typeof nextDocumentNumberBodySchema>;
