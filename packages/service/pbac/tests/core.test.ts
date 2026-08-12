import { describe, expect, it } from "vitest";
import {
  BusinessPolicyDeniedError,
  createPbac,
  documents,
} from "../src/index.js";

describe("pbac", () => {
  it("blocks goods receipt when PO outstanding is depleted", async () => {
    const pbac = createPbac();
    pbac.registerPolicy({
      id: "purchase-order.can-receive",
      description: "Cannot receive when outstanding quantity/amount is exhausted",
      evaluate: documents.positiveAmount(
        "outstandingMinor",
        "Purchase order outstanding must be greater than 0",
      ),
    });

    expect(
      (
        await pbac.check("purchase-order.can-receive", {
          document: { id: "po_1", outstandingMinor: 1500 },
        })
      ).allowed,
    ).toBe(true);

    expect(
      (
        await pbac.check("purchase-order.can-receive", {
          document: { id: "po_1", outstandingMinor: 0 },
        })
      ).allowed,
    ).toBe(false);

    await expect(
      pbac.authorize("purchase-order.can-receive", {
        document: { outstandingMinor: -1 },
      }),
    ).rejects.toBeInstanceOf(BusinessPolicyDeniedError);
  });

  it("enforces open status", async () => {
    const pbac = createPbac();
    pbac.registerPolicy({
      id: "purchase-order.open",
      evaluate: documents.statusIn("status", ["open", "partial"]),
    });
    expect(
      (
        await pbac.check("purchase-order.open", {
          document: { status: "closed" },
        })
      ).allowed,
    ).toBe(false);
  });
});
