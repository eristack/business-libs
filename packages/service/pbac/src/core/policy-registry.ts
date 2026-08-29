import type { Pbac } from "./types.js";

export type PolicyRegistryOpenApi = {
  policyIds: readonly string[];
  /** PATCH `:action` names for document transition routes. */
  transitionActions?: readonly string[];
};

/** Snapshot registered policy ids (+ optional action enum) for OpenAPI extensions. */
export function exportPolicyRegistryForOpenApi(
  pbac: Pbac,
  options?: { transitionActions?: readonly string[] },
): PolicyRegistryOpenApi {
  const policyIds = pbac
    .listPolicies()
    .map((policy) => policy.id)
    .sort();
  const transitionActions = options?.transitionActions
    ? [...options.transitionActions].sort()
    : undefined;
  return { policyIds, transitionActions };
}

/** OpenAPI 3.1 vendor extensions for policy + transition enums. */
export function openApiPolicyRegistryExtensions(
  registry: PolicyRegistryOpenApi,
): Record<string, readonly string[]> {
  const out: Record<string, readonly string[]> = {
    "x-eristack-policy-ids": registry.policyIds,
  };
  if (registry.transitionActions?.length) {
    out["x-eristack-transition-actions"] = registry.transitionActions;
  }
  return out;
}
