import { z } from "zod";
import { FILTER_OPS } from "../core/types.js";

export const queryModeSchema = z.enum(["advanced", "search"]);
export const pageModeSchema = z.enum(["offset", "cursor"]);
export const sortDirSchema = z.enum(["asc", "desc"]);

export const sortClauseSchema = z.object({
  field: z.string().min(1),
  dir: sortDirSchema,
});

export const filterOpSchema = z.enum(FILTER_OPS);

export const dataGridSearchParamsSchema = z.object({
  mode: queryModeSchema.optional(),
  q: z.string().optional(),
  page: z.coerce.number().int().positive().optional(),
  pageSize: z.coerce.number().int().positive().optional(),
  pageMode: pageModeSchema.optional(),
  cursor: z.string().optional(),
  limit: z.coerce.number().int().positive().optional(),
  sorts: z.union([z.string(), z.array(sortClauseSchema)]).optional(),
  filters: z.union([z.string(), z.record(z.string(), z.unknown())]).optional(),
});

export type DataGridSearchParams = z.infer<typeof dataGridSearchParamsSchema>;

export const savedViewJsonSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  query: z.record(z.string(), z.unknown()),
});

export type SavedViewJsonInput = z.infer<typeof savedViewJsonSchema>;
