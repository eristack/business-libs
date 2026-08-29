import { describe, expect, it } from "vitest";
import { attrs, createAbac, matchesAssignmentPair, PolicyDeniedError } from "../src/index.js";

describe("abac", () => {
  it("limits goods receipt by subject book-value attribute", async () => {
    const abac = createAbac();
    abac.registerPolicy({
      id: "goods-receipt.book-value-limit",
      description: "User may post GR only up to their max book value (minor)",
      evaluate: attrs.subjectLimitAtLeastResource({
        subjectPath: "subject.attrs.maxBookValueMinor",
        resourcePath: "resource.attrs.bookValueMinor",
      }),
    });

    const allowed = await abac.evaluate("goods-receipt.book-value-limit", {
      subject: { id: "user_1", attrs: { maxBookValueMinor: 5_000_000 } },
      resource: { type: "goods-receipt", attrs: { bookValueMinor: 1_000_000 } },
      action: "create",
    });
    expect(allowed.allowed).toBe(true);

    const denied = await abac.evaluate("goods-receipt.book-value-limit", {
      subject: { id: "user_1", attrs: { maxBookValueMinor: 5_000_000 } },
      resource: {
        type: "goods-receipt",
        attrs: { bookValueMinor: 9_000_000 },
      },
      action: "create",
    });
    expect(denied.allowed).toBe(false);

    await expect(
      abac.authorize("goods-receipt.book-value-limit", {
        subject: { id: "user_1", attrs: { maxBookValueMinor: 1 } },
        resource: { attrs: { bookValueMinor: 2 } },
      }),
    ).rejects.toBeInstanceOf(PolicyDeniedError);
  });

  it("assignmentPairMatch allows when branch and trade match", async () => {
    const abac = createAbac();
    abac.registerPolicy({
      id: "job.in-scope",
      evaluate: attrs.assignmentPairMatch({
        pairsPath: "subject.attrs.assignments",
        resourceBranchPath: "resource.attrs.branchId",
        resourceTradePath: "resource.attrs.trade",
      }),
    });

    const allowed = await abac.evaluate("job.in-scope", {
      subject: {
        id: "u1",
        attrs: {
          assignments: [
            { branchId: "SUB", trade: "export" },
            { branchId: "SUB", trade: "import" },
          ],
        },
      },
      resource: {
        type: "job",
        attrs: { branchId: "SUB", trade: "export" },
      },
    });
    expect(allowed.allowed).toBe(true);

    const denied = await abac.evaluate("job.in-scope", {
      subject: {
        id: "u1",
        attrs: {
          assignments: [{ branchId: "SUB", trade: "export" }],
        },
      },
      resource: {
        attrs: { branchId: "SUB", trade: "domestic" },
      },
    });
    expect(denied.allowed).toBe(false);
  });

  it("matchesAssignmentPair supports custom pair keys", () => {
    const pairs = [{ siteId: "A", lob: "freight" }];
    expect(
      matchesAssignmentPair(pairs, "A", "freight", {
        pairBranchKey: "siteId",
        pairTradeKey: "lob",
      }),
    ).toBe(true);
    expect(matchesAssignmentPair(pairs, "A", "domestic")).toBe(false);
    expect(matchesAssignmentPair(pairs, null, "freight")).toBe(false);
  });

  it("branchIdEquals scopes subject to resource branch", async () => {
    const abac = createAbac();
    abac.registerPolicy({
      id: "branch.scope",
      evaluate: attrs.branchIdEquals({}),
    });
    const allowed = await abac.evaluate("branch.scope", {
      subject: { id: "u1", attrs: { branchId: "SUB" } },
      resource: { attrs: { branchId: "SUB" } },
    });
    expect(allowed.allowed).toBe(true);
    const denied = await abac.evaluate("branch.scope", {
      subject: { id: "u1", attrs: { branchId: "SUB" } },
      resource: { attrs: { branchId: "HQ" } },
    });
    expect(denied.allowed).toBe(false);
  });

  it("maxBookValueAtMost rejects JSON number money attrs", async () => {
    const abac = createAbac();
    abac.registerPolicy({
      id: "book-value.string",
      evaluate: attrs.maxBookValueAtMost({}),
    });
    const denied = await abac.evaluate("book-value.string", {
      subject: { attrs: { maxBookValue: "5000" } },
      resource: { attrs: { bookValue: 1000 } },
    });
    expect(denied.allowed).toBe(false);
    expect(denied.reason).toMatch(/decimal strings/i);

    const allowed = await abac.evaluate("book-value.string", {
      subject: { attrs: { maxBookValue: "5000" } },
      resource: { attrs: { bookValue: "1000" } },
    });
    expect(allowed.allowed).toBe(true);
  });
});
