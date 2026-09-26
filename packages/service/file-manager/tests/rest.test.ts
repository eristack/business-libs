import { describe, expect, it } from "vitest";
import { createFileManager } from "../src/core/create-file-manager.js";
import { createMemoryStorageDriver } from "../src/core/memory-driver.js";
import { createMemoryFileRecordStore } from "../src/core/memory-store.js";
import { createRestFileManagerActions } from "../src/rest/index.js";
import type { RestRequest } from "../src/rest/types.js";

function req(
  partial: Partial<RestRequest> & Pick<RestRequest, "method">,
): RestRequest {
  return {
    headers: { get: () => null },
    ...partial,
  };
}

describe("createRestFileManagerActions", () => {
  const fileManager = createFileManager({
    driver: createMemoryStorageDriver(),
    store: createMemoryFileRecordStore(),
  });
  const actions = createRestFileManagerActions({ fileManager, maxPresignBytes: 100 });

  it("rejects oversize presign", async () => {
    const res = await actions.presignUpload(
      req({
        method: "POST",
        body: {
          originalName: "big.bin",
          mimeType: "application/octet-stream",
          sizeBytes: 101,
        },
      }),
    );
    expect(res.status).toBe(400);
    expect((res.body as { code: string }).code).toBe("INVALID_FILE_INPUT");
  });

  it("rejects presign missing fields", async () => {
    const res = await actions.presignUpload(req({ method: "POST", body: {} }));
    expect(res.status).toBe(400);
  });

  it("returns 404 for unknown file", async () => {
    const res = await actions.getFile(
      req({ method: "GET", params: { id: "missing" } }),
    );
    expect(res.status).toBe(404);
  });
});
