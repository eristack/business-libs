import { describe, expect, it } from "vitest";
import { createPbac } from "../src/core/create-pbac.js";
import {
  exportPolicyRegistryForOpenApi,
  openApiPolicyRegistryExtensions,
} from "../src/core/policy-registry.js";

describe("policy registry OpenAPI", () => {
  it("exports sorted policy ids", () => {
    const pbac = createPbac();
    pbac.registerPolicy({ id: "b.policy", evaluate: async () => ({ allowed: true }) });
    pbac.registerPolicy({ id: "a.policy", evaluate: async () => ({ allowed: true }) });

    const registry = exportPolicyRegistryForOpenApi(pbac, {
      transitionActions: ["submit", "approve"],
    });

    expect(registry.policyIds).toEqual(["a.policy", "b.policy"]);
    expect(registry.transitionActions).toEqual(["approve", "submit"]);
    expect(openApiPolicyRegistryExtensions(registry)).toMatchObject({
      "x-eristack-policy-ids": ["a.policy", "b.policy"],
      "x-eristack-transition-actions": ["approve", "submit"],
    });
  });
});
