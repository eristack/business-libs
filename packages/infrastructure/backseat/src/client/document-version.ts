import { parseJsonErrorEnvelope } from "../express/error-catalog.js";

export type VersionedDocument = {
  version: number;
};

export class DocumentVersionMissingError extends Error {
  readonly code = "DOCUMENT_VERSION_MISSING";
  constructor() {
    super("Document version is required for PATCH");
    this.name = "DocumentVersionMissingError";
  }
}

/** Read optimistic-lock version from a cached detail row. */
export function expectedVersionFromDocument(
  doc: VersionedDocument | null | undefined,
): number {
  if (doc == null || doc.version == null) {
    throw new DocumentVersionMissingError();
  }
  return Number(doc.version);
}

export function withExpectedVersion<T extends Record<string, unknown>>(
  body: T,
  expectedVersion: number,
): T & { expectedVersion: number } {
  return { ...body, expectedVersion };
}

export function isConflictVersionBody(body: unknown): boolean {
  return parseJsonErrorEnvelope(body)?.code === "CONFLICT_VERSION";
}

export function isConflictVersionHttp(status: number, body: unknown): boolean {
  return status === 409 && isConflictVersionBody(body);
}

export type PatchDocumentResult<T> =
  | { ok: true; data: T }
  | { ok: false; kind: "conflict_version"; message: string }
  | { ok: false; kind: "error"; error: unknown };

/**
 * Run a PATCH that includes expectedVersion from cache. On CONFLICT_VERSION, optionally refetch
 * detail (exact query key) without throwing — so partial saves (e.g. print settings) do not wipe edits blindly.
 */
export async function patchDocumentWithExpectedVersion<
  TDoc extends VersionedDocument,
  TBody extends Record<string, unknown>,
>(args: {
  cached: TDoc | undefined;
  body: TBody;
  patch: (payload: TBody & { expectedVersion: number }) => Promise<TDoc>;
  onConflict?: (message: string) => void;
  refetchDetail?: () => Promise<unknown>;
}): Promise<PatchDocumentResult<TDoc>> {
  try {
    const expectedVersion = expectedVersionFromDocument(args.cached);
    const data = await args.patch(withExpectedVersion(args.body, expectedVersion));
    return { ok: true, data };
  } catch (error) {
    const body =
      error &&
      typeof error === "object" &&
      "body" in error
        ? (error as { body: unknown }).body
        : undefined;
    const status =
      error &&
      typeof error === "object" &&
      "status" in error &&
      typeof (error as { status: unknown }).status === "number"
        ? (error as { status: number }).status
        : undefined;

    if (status === 409 && isConflictVersionBody(body)) {
      const message = parseJsonErrorEnvelope(body)?.message ?? "Document was modified";
      args.onConflict?.(message);
      if (args.refetchDetail) {
        await args.refetchDetail();
      }
      return { ok: false, kind: "conflict_version", message };
    }
    return { ok: false, kind: "error", error };
  }
}
