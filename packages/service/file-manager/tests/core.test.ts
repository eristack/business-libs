import { describe, expect, it } from "vitest";
import { createFileManager } from "../src/core/create-file-manager.js";
import {
  createMemoryStorageDriver,
  memoryPutViaPresignedUrl,
} from "../src/core/memory-driver.js";
import { createMemoryFileRecordStore } from "../src/core/memory-store.js";
import type { PresignGetOptions, StorageDriver } from "../src/core/types.js";

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

  it("dedupes beginPresignedUpload by clientUploadId", async () => {
    const files = createFileManager({
      driver: createMemoryStorageDriver(),
      store: createMemoryFileRecordStore(),
    });
    const a = await files.beginPresignedUpload({
      originalName: "a.pdf",
      mimeType: "application/pdf",
      sizeBytes: 1,
      clientUploadId: "upload-intent-1",
    });
    const b = await files.beginPresignedUpload({
      originalName: "a.pdf",
      mimeType: "application/pdf",
      sizeBytes: 1,
      clientUploadId: "upload-intent-1",
    });
    expect(b.fileId).toBe(a.fileId);
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

  it("deleteFile removes storage object and marks deleted", async () => {
    const driver = createMemoryStorageDriver();
    const files = createFileManager({
      driver,
      store: createMemoryFileRecordStore(),
    });

    const stored = await files.uploadFromServer({
      originalName: "rm.txt",
      mimeType: "text/plain",
      body: new TextEncoder().encode("x"),
    });

    await files.deleteFile(stored.id);
    expect(await files.getFile(stored.id)).toBeNull();
    expect(await driver.headObject({ key: stored.ref.key })).toBeNull();
  });

  it("resolveDownloadUrl presignGet is inline by default", async () => {
    const presignCalls: Array<{ options?: PresignGetOptions }> = [];
    const base = createMemoryStorageDriver();
    const driver: StorageDriver = {
      ...base,
      async presignGet(input) {
        presignCalls.push({ options: input.options });
        return base.presignGet(input);
      },
    };
    const files = createFileManager({
      driver,
      store: createMemoryFileRecordStore(),
    });
    const stored = await files.uploadFromServer({
      originalName: "photo.png",
      mimeType: "image/png",
      body: new TextEncoder().encode("png"),
    });

    await files.resolveDownloadUrl(stored.id);
    expect(presignCalls[0]?.options?.downloadFilename).toBeUndefined();

    presignCalls.length = 0;
    await files.resolveDownloadUrl(stored.id, { downloadFilename: "photo.png" });
    expect(presignCalls[0]?.options?.downloadFilename).toBe("photo.png");
  });

  it("resolveDownloadUrl rejects pending files", async () => {
    const files = createFileManager({
      driver: createMemoryStorageDriver(),
      store: createMemoryFileRecordStore(),
    });
    const session = await files.beginPresignedUpload({
      originalName: "p.txt",
      mimeType: "text/plain",
      sizeBytes: 1,
    });
    await expect(files.resolveDownloadUrl(session.fileId)).rejects.toThrow(
      /not completed/i,
    );
  });
});
