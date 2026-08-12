import {
  BusinessPolicyDeniedError,
  BusinessPolicyNotFoundError,
} from "./errors.js";
import type { Pbac, PbacDecision, PbacInput, PbacPolicy } from "./types.js";

function normalize(
  policyId: string,
  result: boolean | PbacDecision,
): PbacDecision {
  if (typeof result === "boolean") {
    return { allowed: result, policyId };
  }
  return { ...result, policyId: result.policyId || policyId };
}

/**
 * Software / business policy engine.
 * Rules are about **document state**, not who the user is (see RBAC/ABAC).
 */
export function createPbac(): Pbac {
  const policies = new Map<string, PbacPolicy>();

  async function check(
    policyId: string,
    input: PbacInput,
  ): Promise<PbacDecision> {
    const policy = policies.get(policyId);
    if (!policy) throw new BusinessPolicyNotFoundError(policyId);
    return normalize(policyId, await policy.evaluate(input));
  }

  return {
    registerPolicy(policy) {
      const id = policy.id.trim();
      if (!id) throw new Error("PBAC policy id is required");
      policies.set(id, { ...policy, id });
    },

    unregisterPolicy(id) {
      policies.delete(id);
    },

    listPolicies() {
      return [...policies.values()];
    },

    check,

    async checkAll(policyIds, input) {
      for (const id of policyIds) {
        const decision = await check(id, input);
        if (!decision.allowed) return decision;
      }
      return {
        allowed: true,
        policyId: policyIds[policyIds.length - 1] ?? "all",
      };
    },

    async authorize(policyId, input) {
      const decision = await check(policyId, input);
      if (!decision.allowed) {
        throw new BusinessPolicyDeniedError(policyId, decision.reason);
      }
    },
  };
}
