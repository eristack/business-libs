import type { FormatRecord } from "../core/types.js";
import type { FormatBody } from "./types.js";

export function toFormatBody(record: FormatRecord): FormatBody {
  return {
    id: record.id,
    entityKey: record.entityKey,
    pattern: record.pattern,
    reset: record.reset,
    ...(record.prefix !== undefined ? { prefix: record.prefix } : {}),
    active: record.active,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  };
}
