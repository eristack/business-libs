import type { Abac, AbacContext, PolicyDecision } from "./types.js";

export type AbacPolicyFixture = {
  name: string;
  policyId: string;
  ctx: AbacContext;
  expect: boolean | Pick<PolicyDecision, "allowed" | "reason">;
};

export type AbacPolicyHarnessResult = {
  name: string;
  policyId: string;
  expected: boolean;
  actual: PolicyDecision;
  pass: boolean;
};

/** Table-driven ABAC evaluate fixtures for policy unit tests. */
export async function runAbacPolicyFixtures(
  abac: Abac,
  fixtures: readonly AbacPolicyFixture[],
): Promise<AbacPolicyHarnessResult[]> {
  const results: AbacPolicyHarnessResult[] = [];
  for (const fixture of fixtures) {
    const actual = await abac.evaluate(fixture.policyId, fixture.ctx);
    const expected =
      typeof fixture.expect === "boolean"
        ? fixture.expect
        : fixture.expect.allowed;
    const pass =
      typeof fixture.expect === "boolean"
        ? actual.allowed === fixture.expect
        : actual.allowed === fixture.expect.allowed &&
          (fixture.expect.reason == null ||
            actual.reason === fixture.expect.reason);
    results.push({
      name: fixture.name,
      policyId: fixture.policyId,
      expected,
      actual,
      pass,
    });
  }
  return results;
}

export function assertAbacPolicyFixtures(
  results: readonly AbacPolicyHarnessResult[],
): void {
  const failed = results.filter((r) => !r.pass);
  if (failed.length === 0) return;
  const lines = failed.map(
    (r) =>
      `${r.name} (${r.policyId}): expected allowed=${r.expected}, got allowed=${r.actual.allowed}${r.actual.reason ? ` (${r.actual.reason})` : ""}`,
  );
  throw new Error(`ABAC policy fixtures failed:\n${lines.join("\n")}`);
}
