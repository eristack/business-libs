import { PolicyDeniedError, PolicyNotFoundError } from "./errors.js";
import type {
  Abac,
  AbacContext,
  AbacPolicy,
  PolicyDecision,
} from "./types.js";

function normalizeDecision(
  policyId: string,
  result: boolean | PolicyDecision,
): PolicyDecision {
  if (typeof result === "boolean") {
    return { allowed: result, policyId };
  }
  return { ...result, policyId: result.policyId || policyId };
}

/**
 * Attribute-based access control engine.
 * Policies are code-registered functions — attributes in, boolean (decision) out.
 */
export function createAbac(): Abac {
  const policies = new Map<string, AbacPolicy>();

  async function evaluate(
    policyId: string,
    ctx: AbacContext,
  ): Promise<PolicyDecision> {
    const policy = policies.get(policyId);
    if (!policy) throw new PolicyNotFoundError(policyId);
    const raw = await policy.evaluate(ctx);
    return normalizeDecision(policyId, raw);
  }

  return {
    registerPolicy(policy) {
      const id = policy.id.trim();
      if (!id) throw new Error("ABAC policy id is required");
      policies.set(id, { ...policy, id });
    },

    unregisterPolicy(id) {
      policies.delete(id);
    },

    listPolicies() {
      return [...policies.values()];
    },

    evaluate,

    async evaluateAll(policyIds, ctx) {
      for (const id of policyIds) {
        const decision = await evaluate(id, ctx);
        if (!decision.allowed) return decision;
      }
      return {
        allowed: true,
        policyId: policyIds[policyIds.length - 1] ?? "all",
      };
    },

    async evaluateAny(policyIds, ctx) {
      let last: PolicyDecision = {
        allowed: false,
        policyId: policyIds[0] ?? "any",
        reason: "No policies matched",
      };
      for (const id of policyIds) {
        last = await evaluate(id, ctx);
        if (last.allowed) return last;
      }
      return last;
    },

    async authorize(policyId, ctx) {
      const decision = await evaluate(policyId, ctx);
      if (!decision.allowed) {
        throw new PolicyDeniedError(policyId, decision.reason);
      }
    },
  };
}
