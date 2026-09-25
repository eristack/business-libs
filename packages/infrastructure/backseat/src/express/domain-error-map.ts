import { PolicyDeniedError } from "@eristack/abac";
import { StaleEpochError } from "@eristack/epoch";
import { BusinessPolicyDeniedError } from "@eristack/pbac";
import { ForbiddenError } from "@eristack/rbac";
import { TimestampParseError } from "@eristack/timestamp";
import { ZodError } from "zod";
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

/**
 * Map thrown domain errors to the standard JSON envelope (Backseat-compatible).
 * Returns null only when `onUnknown` returns null and no built-in rule matched.
 */
export function resolveDomainError(
  err: unknown,
  options?: MapDomainErrorOptions,
): DomainErrorEnvelope | null {
  if (options?.map) {
    const custom = options.map(err);
    if (custom) return envelopeFromMapping(custom);
  }

  if (err instanceof TimestampParseError) {
    return {
      status: 400,
      body: {
        error: { code: "INVALID_TIMESTAMP", message: err.message },
      },
    };
  }
  if (err instanceof ZodError) {
    return {
      status: 400,
      body: {
        error: {
          code: BackseatErrorCodes.VALIDATION_ERROR,
          message: err.message,
          details: err.flatten(),
        },
      },
    };
  }
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
  if (err instanceof StaleEpochError) {
    return {
      status: 409,
      body: { error: { code: err.code, message: err.message } },
      headers: { "X-Epoch-Current": String(err.current) },
    };
  }
  if (err instanceof ForbiddenError) {
    return {
      status: 403,
      body: { error: { code: err.code, message: err.message } },
    };
  }
  if (err instanceof PolicyDeniedError) {
    return {
      status: 409,
      body: { error: { code: "POLICY_DENIED", message: err.message } },
    };
  }
  if (err instanceof BusinessPolicyDeniedError) {
    return {
      status: 409,
      body: {
        error: {
          code: "BUSINESS_POLICY_DENIED",
          message: err.message,
          policyId: err.policyId,
          reason: err.reason,
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
