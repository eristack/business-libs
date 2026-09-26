import { parseFileRef, serializeFileRef, type FileRef } from "../core/file-ref.js";

/** Map Drizzle text/json column ↔ canonical FileRef JSON string. */
export function fileRefColumnHelpers() {
  return {
    toDriver(value: FileRef | null): string | null {
      if (value === null) return null;
      return serializeFileRef(value);
    },
    fromDriver(value: string | null): FileRef | null {
      if (value === null || value === "") return null;
      return parseFileRef(value);
    },
  };
}

/**
 * App-owned entity columns (invoice attachment, user avatar):
 *
 * ```ts
 * // Option A — FK to file_manager_files.id (recommended when you need list/delete/audit)
 * avatarFileId: text("avatar_file_id").references(() => files.id),
 *
 * // Option B — embed pointer JSON on the row (small apps, read-mostly)
 * attachmentRef: text("attachment_ref").$type<FileRef>(),
 * ```
 *
 * Always persist **FileRef** or **file id**, never bare S3 URLs alone — URLs expire; refs regenerate download links.
 */
