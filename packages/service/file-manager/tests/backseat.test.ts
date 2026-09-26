import { describe, expect, it } from "vitest";
import { createBackseat, createMemoryBackseatStore } from "@eristack/backseat";
import { memoryPutViaPresignedUrl } from "../src/core/memory-driver.js";
import {
  createBackseatFileManagerStores,
  registerFileManagerBackseat,
} from "../src/backseat/index.js";

describe("file-manager backseat", () => {
  it("exports register and store factories", async () => {
    const mod = await import("../src/backseat/index.js");
    expect(mod.registerFileManagerBackseat).toBeTypeOf("function");
    expect(mod.createBackseatFileManagerStores).toBeTypeOf("function");
  });

  it("persists file records in backseat store", async () => {
    const { fileManager } = createBackseatFileManagerStores();
    const stored = await fileManager.uploadFromServer({
      originalName: "seed.bin",
      mimeType: "application/octet-stream",
      body: new Uint8Array([1, 2, 3]),
      namespace: "dev",
    });
    const again = await fileManager.getFile(stored.id);
    expect(again?.ref.sizeBytes).toBe(3);
  });

  it("handles REST routes via createBackseat", async () => {
    const backseatStore = createMemoryBackseatStore();
    const api = createBackseat({
      store: backseatStore,
      baseUrl: "/api",
    });
    const { fileManager, driver } = createBackseatFileManagerStores({
      store: backseatStore,
    });
    registerFileManagerBackseat(api, { fileManager });

    const presign = await api.handle({
      method: "POST",
      path: "/api/files/uploads/presign",
      body: {
        originalName: "mock.txt",
        mimeType: "text/plain",
        sizeBytes: 5,
      },
    });
    expect(presign.status).toBe(201);
    const session = presign.body as {
      fileId: string;
      uploadUrl: string;
      uploadHeaders?: Record<string, string>;
    };

    await memoryPutViaPresignedUrl(
      driver,
      session.uploadUrl,
      new TextEncoder().encode("hello"),
      session.uploadHeaders,
    );

    const complete = await api.handle({
      method: "POST",
      path: "/api/files/uploads/complete",
      body: { fileId: session.fileId },
    });
    expect(complete.status).toBe(200);

    const got = await api.handle({
      method: "GET",
      path: `/api/files/${session.fileId}`,
    });
    expect(got.status).toBe(200);
    expect((got.body as { status: string }).status).toBe("ready");
  });
});
