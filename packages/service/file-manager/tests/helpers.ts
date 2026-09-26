import express from "express";
import { createFileManager } from "../src/core/create-file-manager.js";
import {
  createMemoryStorageDriver,
  memoryPutViaPresignedUrl,
} from "../src/core/memory-driver.js";
import { createMemoryFileRecordStore } from "../src/core/memory-store.js";
import { createFileManagerRouter } from "../src/express/index.js";

export function createTestFileManagerApp(options?: { maxPresignBytes?: number }) {
  const driver = createMemoryStorageDriver();
  const fileManager = createFileManager({
    driver,
    store: createMemoryFileRecordStore(),
    keyPrefix: "test",
  });

  const app = express();
  app.use(express.json());
  app.use(
    "/files",
    createFileManagerRouter({
      fileManager,
      maxPresignBytes: options?.maxPresignBytes,
    }),
  );

  return { app, fileManager, driver };
}

export async function uploadTestFileViaPresign(
  driver: ReturnType<typeof createMemoryStorageDriver>,
  presignBody: {
    fileId: string;
    uploadUrl: string;
    uploadHeaders?: Record<string, string>;
  },
  content: string,
) {
  await memoryPutViaPresignedUrl(
    driver,
    presignBody.uploadUrl,
    new TextEncoder().encode(content),
    presignBody.uploadHeaders,
  );
}
