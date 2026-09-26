import { InvalidFileInputError } from "./errors.js";
export const FILE_REF_VERSION = 1 as const;

export type FileRef = {
  v: typeof FILE_REF_VERSION;
  provider: "s3" | "memory" | "local";
  bucket: string;
  key: string;
  mimeType: string;
  sizeBytes: number;
  originalName: string;
  checksumSha256?: string;
};

const PROVIDERS = ["s3", "memory", "local"] as const;

export function createFileRef(input: Omit<FileRef, "v">): FileRef {
  if (!input.key.trim()) {
    throw new InvalidFileInputError("FileRef.key is required");
  }
  if (!Number.isFinite(input.sizeBytes) || input.sizeBytes < 0) {
    throw new InvalidFileInputError("FileRef.sizeBytes must be a non-negative number");
  }
  return { v: FILE_REF_VERSION, ...input };
}

export function parseFileRef(raw: unknown): FileRef {
  if (raw === null || raw === undefined) {
    throw new InvalidFileInputError("FileRef value is empty");
  }

  let value: unknown = raw;
  if (typeof raw === "string") {
    try {
      value = JSON.parse(raw) as unknown;
    } catch {
      throw new InvalidFileInputError("FileRef string is not valid JSON");
    }
  }

  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new InvalidFileInputError("FileRef must be an object");
  }

  const record = value as Record<string, unknown>;
  if (record.v !== FILE_REF_VERSION) {
    throw new InvalidFileInputError(`Unsupported FileRef version: ${String(record.v)}`);
  }

  const provider = record.provider;
  if (typeof provider !== "string" || !(PROVIDERS as readonly string[]).includes(provider)) {
    throw new InvalidFileInputError(`Invalid FileRef provider: ${String(provider)}`);
  }

  for (const field of ["bucket", "key", "mimeType", "originalName"] as const) {
    if (typeof record[field] !== "string" || !record[field]) {
      throw new InvalidFileInputError(`FileRef.${field} must be a non-empty string`);
    }
  }

  const sizeBytes = record.sizeBytes;
  if (typeof sizeBytes !== "number" || !Number.isFinite(sizeBytes) || sizeBytes < 0) {
    throw new InvalidFileInputError("FileRef.sizeBytes must be a non-negative number");
  }

  const checksumSha256 =
    record.checksumSha256 === undefined
      ? undefined
      : typeof record.checksumSha256 === "string"
        ? record.checksumSha256
        : undefined;

  return createFileRef({
    provider: provider as FileRef["provider"],
    bucket: record.bucket as string,
    key: record.key as string,
    mimeType: record.mimeType as string,
    sizeBytes,
    originalName: record.originalName as string,
    checksumSha256,
  });
}

/** Canonical JSON for Drizzle `text` / `jsonb` columns and API bodies. */
export function serializeFileRef(ref: FileRef): string {
  return JSON.stringify(ref);
}

/** Read nullable DB column values safely. */
export function fileRefFromColumn(raw: string | null | undefined): FileRef | null {
  if (raw === null || raw === undefined || raw === "") return null;
  return parseFileRef(raw);
}

/**
 * Store on parent entities (invoice PDF, avatar, attachment list item).
 * Prefer a dedicated `file_id` FK to `stored_files` when you need metadata;
 * embed `FileRef` JSON when the app only needs pointer + display fields.
 */
export type EntityFilePointer =
  | { kind: "id"; fileId: string }
  | { kind: "ref"; ref: FileRef };

export function entityPointerToFileRef(
  pointer: EntityFilePointer,
  resolve: (fileId: string) => Promise<FileRef | null>,
): Promise<FileRef | null> {
  if (pointer.kind === "ref") return Promise.resolve(pointer.ref);
  return resolve(pointer.fileId);
}
