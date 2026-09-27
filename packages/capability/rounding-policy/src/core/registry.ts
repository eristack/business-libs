import { Rounding, type MonetaryOperator, type RoundingMode } from "@eristack/money";
import { RoundingPolicyNotFoundError } from "./errors.js";
import type { RoundingPolicyDefinition } from "./types.js";

function resolveOperator(
  def: RoundingPolicyDefinition,
  currency?: string,
): MonetaryOperator {
  const code = currency?.trim().toUpperCase();
  const override = code ? def.currencyOverrides?.[code] : undefined;

  if (override?.scale !== undefined) {
    return Rounding.of(
      override.scale,
      override.mode ?? def.mode ?? "HALF_EVEN",
    );
  }

  if (def.scale !== undefined) {
    return Rounding.of(def.scale, def.mode ?? "HALF_EVEN");
  }

  return Rounding.currencyDefault(
    code ?? currency,
    (def.mode ?? "HALF_EVEN") as RoundingMode,
  );
}

export function createRoundingPolicyRegistry(
  initial: RoundingPolicyDefinition[] = [],
) {
  const policies = new Map<string, RoundingPolicyDefinition>();

  function registerPolicy(def: RoundingPolicyDefinition): void {
    if (!def.id.trim()) {
      throw new Error("Rounding policy id cannot be empty");
    }
    policies.set(def.id, { ...def, id: def.id.trim() });
  }

  for (const def of initial) {
    registerPolicy(def);
  }

  function roundingFor(args: {
    policyId: string;
    currency?: string;
  }): MonetaryOperator {
    const def = policies.get(args.policyId);
    if (!def) {
      throw new RoundingPolicyNotFoundError(args.policyId);
    }
    return resolveOperator(def, args.currency);
  }

  function listPolicies(): RoundingPolicyDefinition[] {
    return [...policies.values()];
  }

  return { registerPolicy, roundingFor, listPolicies };
}
