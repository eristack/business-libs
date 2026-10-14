import { describe, expect, it, vi } from "vitest";
import {
  expectedVersionFromDocument,
  isConflictVersionBody,
  patchDocumentWithExpectedVersion,
  withExpectedVersion,
} from "../src/client/document-version.js";

describe("document-version client helpers", () => {
  it("builds PATCH body with expectedVersion", () => {
    expect(withExpectedVersion({ title: "A" }, 3)).toEqual({
      title: "A",
      expectedVersion: 3,
    });
  });

  it("detects CONFLICT_VERSION bodies", () => {
    expect(
      isConflictVersionBody({ error: { code: "CONFLICT_VERSION", message: "stale" } }),
    ).toBe(true);
  });

  it("refetches on conflict without throwing", async () => {
    const refetch = vi.fn(async () => undefined);
    const onConflict = vi.fn();
    const result = await patchDocumentWithExpectedVersion({
      cached: { version: 2, id: "1" },
      body: { title: "x" },
      patch: async () => {
        throw { status: 409, body: { error: { code: "CONFLICT_VERSION", message: "changed" } } };
      },
      refetchDetail: refetch,
      onConflict,
    });
    expect(result).toEqual({ ok: false, kind: "conflict_version", message: "changed" });
    expect(refetch).toHaveBeenCalledOnce();
    expect(onConflict).toHaveBeenCalledWith("changed");
  });

  it("throws when cache has no version", () => {
    expect(() => expectedVersionFromDocument(undefined)).toThrow("Document version");
  });
});
