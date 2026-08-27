import type { PbacInput, PbacPolicy } from "./types.js";

function asNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "" && !Number.isNaN(Number(value))) {
    return Number(value);
  }
  return null;
}

/**
 * Common business-document policy builders (majority ERP-ish cases).
 */
export const documents = {
  /** Allow when document[field] > 0 (e.g. PO outstanding). */
  positiveAmount(field: string, reason?: string): PbacPolicy["evaluate"] {
    return (input: PbacInput) => {
      const n = asNumber(input.document[field]);
      if (n == null) {
        return {
          allowed: false,
          policyId: "",
          reason: reason ?? `Missing numeric field "${field}"`,
        };
      }
      return {
        allowed: n > 0,
        policyId: "",
        reason: n > 0 ? undefined : reason ?? `${field} must be greater than 0`,
      };
    };
  },

  /** Allow when document[field] is one of statuses. */
  statusIn(
    field: string,
    allowed: string[],
    reason?: string,
  ): PbacPolicy["evaluate"] {
    return (input: PbacInput) => {
      const status = input.document[field];
      const ok = typeof status === "string" && allowed.includes(status);
      return {
        allowed: ok,
        policyId: "",
        reason: ok
          ? undefined
          : reason ?? `${field} must be one of: ${allowed.join(", ")}`,
      };
    };
  },

  /** Deny when a boolean flag is set (e.g. locked, cancelled). */
  flagNotSet(field: string, reason?: string): PbacPolicy["evaluate"] {
    return (input: PbacInput) => {
      const locked = Boolean(input.document[field]);
      return {
        allowed: !locked,
        policyId: "",
        reason: locked
          ? reason ?? `Document is blocked by "${field}"`
          : undefined,
      };
    };
  },

  /**
   * Allow when `input.action` is a legal transition from `document[statusField]`.
   * Table keys are current status; values are allowed command/action names.
   */
  transitions(
    statusField: string,
    table: Readonly<Record<string, readonly string[]>>,
    reason?: string,
  ): PbacPolicy["evaluate"] {
    return (input: PbacInput) => {
      const action = input.action;
      if (!action) {
        return {
          allowed: false,
          policyId: "",
          reason: reason ?? "Missing action",
        };
      }
      const status = input.document[statusField];
      if (typeof status !== "string") {
        return {
          allowed: false,
          policyId: "",
          reason: reason ?? `Missing string field "${statusField}"`,
        };
      }
      const allowed = table[status];
      const ok = allowed?.includes(action) ?? false;
      return {
        allowed: ok,
        policyId: "",
        reason: ok
          ? undefined
          : reason ?? `Cannot "${action}" from status "${status}"`,
      };
    };
  },
};
