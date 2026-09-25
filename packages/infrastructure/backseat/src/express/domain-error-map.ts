import {
  BackseatError,
  BackseatVersionConflictError,
  toBackseatErrorResponse,
} from "../core/errors.js";
import { BackseatErrorCodes, type JsonErrorBody } from "../core/json-error.js";
import { versionConflict } from "../core/json-error.js";

export type DomainErrorEnvelope = {
  status: number;
  body: JsonErrorBody;
  headers?: Record<string, string>;
};

export type DomainErrorMapping = {
  status: number;
  code: string;
  message: string;
  details?: Record<string, unknown>;
  headers?: Record<string, string>;
};

export type MapDomainErrorOptions = {
  /** Run first — return null to fall through to built-in mappings. */
  map?: (error: unknown) => DomainErrorMapping | null;
  /** Last resort before default 500 — return null to send INTERNAL_ERROR. */
  onUnknown?: (error: unknown) => DomainErrorEnvelope | null;
};

function envelopeFromMapping(mapping: DomainErrorMapping): DomainErrorEnvelope {
  return {
    status: mapping.status,
    headers: mapping.headers,
    body: {
      error: {
        code: mapping.code,
        message: mapping.message,
        ...(mapping.details ? { details: mapping.details } : {}),
      },
    },
  };
}

function isPgUniqueViolation(err: unknown): err is { code: string } {
  return (
    typeof err === "object" &&
    err !== null &&
    "code" in err &&
    (err as { code: string }).code === "23505"
  );
}

function isDocumentVersionConflict(err: unknown): err is Error {
  return err instanceof Error && err.name === "DocumentVersionConflictError";
}

function isNamedError(err: unknown, name: string): err is Error {
  return err instanceof Error && err.name === name;
}

function readStringField(err: unknown, key: string): string | undefined {
  if (typeof err !== "object" || err === null || !(key in err)) return undefined;
  const value = (err as Record<string, unknown>)[key];
  return typeof value === "string" ? value : undefined;
}

function readNumberField(err: unknown, key: string): number | undefined {
  if (typeof err !== "object" || err === null || !(key in err)) return undefined;
  const value = (err as Record<string, unknown>)[key];
  return typeof value === "number" ? value : undefined;
}

function mapZodError(err: unknown): DomainErrorEnvelope | null {
  if (!isNamedError(err, "ZodError")) return null;
  const flatten =
    "flatten" in err && typeof err.flatten === "function"
      ? (err.flatten as () => Record<string, unknown>)()
      : undefined;
  return {
    status: 400,
    body: {
      error: {
        code: BackseatErrorCodes.VALIDATION_ERROR,
        message: err.message,
        ...(flatten ? { details: flatten } : {}),
      },
    },
  };
}

/**
 * Map thrown domain errors to the standard JSON envelope (Backseat-compatible).
 * Uses error `name` / fields so consumers need not link every @eristack/* package at build time.
 */
export function resolveDomainError(
  err: unknown,
  options?: MapDomainErrorOptions,
): DomainErrorEnvelope | null {
  if (options?.map) {
    const custom = options.map(err);
    if (custom) return envelopeFromMapping(custom);
  }

  if (isNamedError(err, "TimestampParseError")) {
    return {
      status: 400,
      body: {
        error: { code: "INVALID_TIMESTAMP", message: err.message },
      },
    };
  }

  const zodMapped = mapZodError(err);
  if (zodMapped) return zodMapped;

  if (isPgUniqueViolation(err)) {
    return {
      status: 409,
      body: {
        error: {
          code: "CONFLICT_UNIQUE",
          message: "Unique constraint violated",
        },
      },
    };
  }

  if (isNamedError(err, "StaleEpochError")) {
    const code = readStringField(err, "code") ?? "STALE_EPOCH";
    const current = readNumberField(err, "current");
    return {
      status: 409,
      body: { error: { code, message: err.message } },
      headers:
        current !== undefined
          ? { "X-Epoch-Current": String(current) }
          : undefined,
    };
  }

  if (isNamedError(err, "ForbiddenError")) {
    const code = readStringField(err, "code") ?? "FORBIDDEN";
    return {
      status: 403,
      body: { error: { code, message: err.message } },
    };
  }

  if (isNamedError(err, "PolicyDeniedError")) {
    return {
      status: 409,
      body: { error: { code: "POLICY_DENIED", message: err.message } },
    };
  }

  if (isNamedError(err, "BusinessPolicyDeniedError")) {
    const policyId = readStringField(err, "policyId");
    const reason = readStringField(err, "reason");
    return {
      status: 409,
      body: {
        error: {
          code: "BUSINESS_POLICY_DENIED",
          message: err.message,
          ...(policyId ? { policyId } : {}),
          ...(reason ? { reason } : {}),
        },
      },
    };
  }

  if (
    err instanceof BackseatVersionConflictError ||
    isDocumentVersionConflict(err)
  ) {
    const body =
      err instanceof BackseatVersionConflictError
        ? toBackseatErrorResponse(err).body
        : versionConflict(err.message).body;
    return { status: 409, body };
  }
  if (err instanceof BackseatError) {
    const mapped = toBackseatErrorResponse(err);
    return { status: mapped.status, body: mapped.body };
  }

  if (options?.onUnknown) {
    return options.onUnknown(err);
  }
  return null;
}

export function defaultInternalErrorEnvelope(err: unknown): DomainErrorEnvelope {
  return {
    status: 500,
    body: {
      error: {
        code: BackseatErrorCodes.INTERNAL_ERROR,
        message: err instanceof Error ? err.message : "Unexpected error",
      },
    },
  };
}
