import { describe, expect, it } from "vitest";
import {
  assertAbacPolicyFixtures,
  attrs,
  createAbac,
  runAbacPolicyFixtures,
} from "../src/index.js";

describe("runAbacPolicyFixtures", () => {
  it("runs table-driven evaluate fixtures", async () => {
    const abac = createAbac();
    abac.registerPolicy({
      id: "branch.scope",
      evaluate: attrs.branchIdEquals({}),
    });

    const results = await runAbacPolicyFixtures(abac, [
      {
        name: "same branch",
        policyId: "branch.scope",
        ctx: {
          subject: { id: "u1", attrs: { branchId: "SUB" } },
          resource: { attrs: { branchId: "SUB" } },
        },
        expect: true,
      },
      {
        name: "different branch",
        policyId: "branch.scope",
        ctx: {
          subject: { id: "u1", attrs: { branchId: "SUB" } },
          resource: { attrs: { branchId: "HQ" } },
        },
        expect: false,
      },
    ]);

    expect(results.every((r) => r.pass)).toBe(true);
    expect(() => assertAbacPolicyFixtures(results)).not.toThrow();
  });
});
