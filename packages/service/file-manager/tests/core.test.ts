import { describe, expect, it } from "vitest";
import { createFileManager } from "../src/core/create-file-manager.js";
import {
  createMemoryStorageDriver,
  memoryPutViaPresignedUrl,
} from "../src/core/memory-driver.js";
import { createMemoryFileRecordStore } from "../src/core/memory-store.js";

describe("createFileManager", () => {
  it("presign → PUT → complete → download URL", async () => {
    const driver = createMemoryStorageDriver();
    const store = createMemoryFileRecordStore();
    const files = createFileManager({ driver, store, keyPrefix: "test" });

    const session = await files.beginPresignedUpload({
      originalName: "invoice.pdf",
      mimeType: "application/pdf",
      sizeBytes: 11,
      namespace: "invoices",
    });

    expect(session.fileId).toBeTruthy();
    expect(session.uploadMethod).toBe("PUT");

    const body = new TextEncoder().encode("hello world");
    await memoryPutViaPresignedUrl(
      driver,
      session.uploadUrl,
      body,
      session.uploadHeaders,
    );

    const ready = await files.completeUpload({ fileId: session.fileId });
    expect(ready.status).toBe("ready");
    expect(ready.ref.sizeBytes).toBe(11);

    const download = await files.resolveDownloadUrl(session.fileId);
    expect(download.url).toContain("memory://");
  });

  it("uploadFromServer marks ready immediately", async () => {
    const files = createFileManager({
      driver: createMemoryStorageDriver(),
      store: createMemoryFileRecordStore(),
    });

    const stored = await files.uploadFromServer({
      originalName: "a.txt",
      mimeType: "text/plain",
      body: new TextEncoder().encode("x"),
    });

    expect(stored.status).toBe("ready");
    expect(stored.ref.checksumSha256).toHaveLength(64);
  });
});
