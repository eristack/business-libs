import type { DomainErrorMapping } from "./domain-error-map.js";

export type ErrorDisposition =
  | "toast"
  | "not-found"
  | "login"
  | "refetch-document";

export type ErrorCatalogEntry = {
  code: string;
  httpStatus?: number;
  retry?: boolean;
  disposition?: ErrorDisposition;
  /** Person-facing copy when this code is shown in the UI. */
  userMessage?: string;
};

export type ResolvedClientError = {
  code: string;
  userMessage: string;
  retry: boolean;
  disposition: ErrorDisposition;
  httpStatus?: number;
};

const BUILTIN: Record<string, Omit<ErrorCatalogEntry, "code">> = {
  NOT_FOUND: { httpStatus: 404, retry: false, disposition: "not-found" },
  UNAUTHENTICATED: { httpStatus: 401, retry: false, disposition: "login" },
  CONFLICT_VERSION: { httpStatus: 409, retry: false, disposition: "refetch-document" },
  STALE_EPOCH: { httpStatus: 409, retry: true, disposition: "refetch-document" },
  POLICY_DENIED: { httpStatus: 409, retry: false, disposition: "toast" },
  BUSINESS_POLICY_DENIED: { httpStatus: 409, retry: false, disposition: "toast" },
  VALIDATION_ERROR: { httpStatus: 400, retry: false, disposition: "toast" },
};

function readErrorCode(err: unknown): string | undefined {
  if (typeof err !== "object" || err === null) return undefined;
  if ("code" in err && typeof (err as { code: unknown }).code === "string") {
    return (err as { code: string }).code.trim();
  }
  return undefined;
}

function readErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (typeof err === "string") return err;
  return "Unexpected error";
}

export function parseJsonErrorEnvelope(
  body: unknown,
): { code: string; message: string } | null {
  if (typeof body !== "object" || body === null || !("error" in body)) return null;
  const error = (body as { error: unknown }).error;
  if (typeof error !== "object" || error === null) return null;
  const code = "code" in error && typeof error.code === "string" ? error.code : undefined;
  const message =
    "message" in error && typeof error.message === "string" ? error.message : undefined;
  if (!code || !message) return null;
  return { code, message };
}

export function createErrorCatalog(initial?: readonly ErrorCatalogEntry[]) {
  const entries = new Map<string, ErrorCatalogEntry>();
  for (const row of initial ?? []) {
    entries.set(row.code.trim(), { ...row, code: row.code.trim() });
  }

  function register(entry: ErrorCatalogEntry): void {
    const code = entry.code.trim();
    if (!code) throw new Error("Error catalog code cannot be empty");
    entries.set(code, { ...entry, code });
  }

  function resolve(code: string, fallbackMessage?: string): ResolvedClientError {
    const trimmed = code.trim();
    const custom = entries.get(trimmed);
    const builtin = BUILTIN[trimmed];
    const httpStatus = custom?.httpStatus ?? builtin?.httpStatus;
    const retry = custom?.retry ?? builtin?.retry ?? false;
    const disposition =
      custom?.disposition ?? builtin?.disposition ?? ("toast" as const);
    const userMessage =
      custom?.userMessage ?? fallbackMessage ?? trimmed;
    return {
      code: trimmed,
      userMessage,
      retry,
      disposition,
      httpStatus,
    };
  }

  function resolveFromJsonBody(body: unknown): ResolvedClientError | null {
    const parsed = parseJsonErrorEnvelope(body);
    if (!parsed) return null;
    return resolve(parsed.code, parsed.message);
  }

  /** Map app `DomainError`-style throws before generic 500 handling. */
  function mapThrown(err: unknown): DomainErrorMapping | null {
    const code = readErrorCode(err);
    if (!code) return null;

    if (code.startsWith("VALIDATION")) {
      return {
        status: 400,
        code: "VALIDATION_ERROR",
        message: readErrorMessage(err),
      };
    }

    if (code.includes("LOCKED")) {
      const mapped = resolve(code, readErrorMessage(err));
      return {
        status: mapped.httpStatus ?? 409,
        code,
        message: mapped.userMessage,
      };
    }

    const catalogHit = entries.get(code);
    if (catalogHit) {
      return {
        status: catalogHit.httpStatus ?? 409,
        code,
        message: catalogHit.userMessage ?? readErrorMessage(err),
      };
    }

    return null;
  }

  return {
    register,
    resolve,
    resolveFromJsonBody,
    mapThrown,
  };
}

export type ErrorCatalog = ReturnType<typeof createErrorCatalog>;
