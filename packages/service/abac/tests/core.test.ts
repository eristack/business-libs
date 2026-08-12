import { describe, expect, it } from "vitest";
import { attrs, createAbac, PolicyDeniedError } from "../src/index.js";

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
});
