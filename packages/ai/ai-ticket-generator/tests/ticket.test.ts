import { describe, expect, it } from "vitest";
import {
  assessFeasibility,
  checkSubscriptions,
  createBugTicket,
  createSuggestionTicket,
  findRepoRoot,
  renderTicketMarkdown,
  validateTicket,
} from "../src/index.js";

describe("bug tickets", () => {
  it("renders a portable maintainer file with fix plan and handoff", () => {
    const ticket = createBugTicket({
      package: "@eristack/money",
      title: "Money.sum drops currency check",
      summary: "summing mixed currencies did not throw",
      version: "0.1.0",
      stepsToReproduce: [
        'Money.of("1", "USD")',
        'Money.sum([Money.of("1", "USD"), Money.of("1", "EUR")])',
      ],
      expected: "throw on mixed currency",
      actual: "returns a Money silently",
      logs: "Error: …",
      scenario: "Invoice total across FX lines",
      fixPlan: ["Add currency guard in Money.sum", "Add regression test"],
      reporter: "ada",
    });

    const md = renderTicketMarkdown(ticket);
    expect(md).toContain("# Bug: Money.sum drops currency check");
    expect(md).toContain("@eristack/money");
    expect(md).toContain("## Fix plan");
    expect(md).toContain("## Agent handoff");
    expect(validateTicket(ticket).ok).toBe(true);
  });
});

describe("suggestion tickets", () => {
  it("marks out-of-scope asks as unlikely", () => {
    const assessment = assessFeasibility({
      title: "Hosted cloud multi-tenant saas platform",
      summary: "Please host a multi-tenant saas platform for us",
    });
    expect(assessment.feasibility).toBe("unlikely");
  });

  it("marks additive asks as possible and fills rationale", () => {
    const input = {
      package: "@eristack/data-grid",
      title: "Export filter DSL helpers",
      summary: "Public helper to stringify filter rows for tests",
      proposedApi: "export function formatFilterRow(row)",
    };
    const assessment = assessFeasibility(input, {
      package: "@eristack/data-grid",
      scope: "List query parse/serialize and adapters",
      skills: ["data-grid-core"],
    });
    expect(["possible", "partial"]).toContain(assessment.feasibility);

    const ticket = createSuggestionTicket({
      ...input,
      feasibility: assessment.feasibility,
      feasibilityRationale: assessment.rationale,
      implementationSketch: assessment.nextSteps,
    });
    ticket.feasibility = assessment.feasibility;
    const md = renderTicketMarkdown(ticket);
    expect(md).toContain("# Suggestion:");
    expect(md).toContain(`feasibility:** \`${assessment.feasibility}\``);
    expect(validateTicket(ticket).ok).toBe(true);
  });
});

describe("subscriptions", () => {
  it("every @eristack package in this monorepo is subscribed", () => {
    const root = findRepoRoot(process.cwd());
    const result = checkSubscriptions(root);
    expect(result.missing).toEqual([]);
    expect(result.invalid).toEqual([]);
    expect(result.ok).toBe(true);
    expect(result.checked).toBeGreaterThanOrEqual(6);
  });
});
