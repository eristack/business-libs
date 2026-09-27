import { describe, expect, it } from "vitest";
import { normalizeContactList, primaryContact, ContactParseError } from "../src/index.js";

describe("normalizeContactList", () => {
  it("requires a channel field", () => {
    expect(() =>
      normalizeContactList({ channels: [{ role: "general" }] }),
    ).toThrow(ContactParseError);
  });

  it("picks primary", () => {
    const list = normalizeContactList({
      channels: [
        { role: "billing", email: "a@b.com" },
        { role: "general", phone: "+14155550100", isPrimary: true },
      ],
    });
    expect(primaryContact(list)?.phone).toBe("+14155550100");
  });
});
