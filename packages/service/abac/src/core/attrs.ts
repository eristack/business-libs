import type { AbacContext, AbacPolicy, AttrValue } from "./types.js";
import { assignmentPairMatch as buildAssignmentPairMatch } from "./assignment-pairs.js";

function readPath(root: unknown, path: string): AttrValue {
  const parts = path.split(".").filter(Boolean);
  let cur: unknown = root;
  for (const part of parts) {
    if (cur == null || typeof cur !== "object") return undefined;
    cur = (cur as Record<string, unknown>)[part];
  }
  return cur as AttrValue;
}

/**
 * Helpers for common attribute comparisons (majority ABAC cases).
 * Prefer minor units / strings for money — do not invent JS currency floats.
 */
export const attrs = {
  get(ctx: AbacContext, path: string): AttrValue {
    return readPath(ctx, path);
  },

  number(ctx: AbacContext, path: string): number | null {
    const v = readPath(ctx, path);
    if (typeof v === "number" && Number.isFinite(v)) return v;
    if (typeof v === "string" && v.trim() !== "" && !Number.isNaN(Number(v))) {
      return Number(v);
    }
    return null;
  },

  /** subject.attrs.max ≥ resource.attrs.value (inclusive). */
  subjectLimitAtLeastResource(options: {
    subjectPath: string;
    resourcePath: string;
    reason?: string;
  }): AbacPolicy["evaluate"] {
    return (ctx) => {
      const max = attrs.number(ctx, options.subjectPath);
      const value = attrs.number(ctx, options.resourcePath);
      if (max == null || value == null) {
        return {
          allowed: false,
          policyId: "",
          reason: options.reason ?? "Missing numeric attributes for limit check",
        };
      }
      return {
        allowed: value <= max,
        policyId: "",
        reason:
          value <= max
            ? undefined
            : options.reason ??
              `Value ${value} exceeds subject limit ${max}`,
      };
    };
  },

  /** subject.attrs.field === expected */
  subjectAttrEquals(path: string, expected: AttrValue): AbacPolicy["evaluate"] {
    return (ctx) => readPath(ctx, path) === expected;
  },

  /** resource.attrs.field is in allowed list from subject */
  resourceInSubjectList(options: {
    resourcePath: string;
    subjectListPath: string;
  }): AbacPolicy["evaluate"] {
    return (ctx) => {
      const value = readPath(ctx, options.resourcePath);
      const list = readPath(ctx, options.subjectListPath);
      if (!Array.isArray(list)) return false;
      return list.includes(value as never);
    };
  },

  /**
   * Allow when subject assignment pairs include resource branch + trade.
   * Admin bypass is app-owned — not included here.
   */
  assignmentPairMatch: buildAssignmentPairMatch,
};
