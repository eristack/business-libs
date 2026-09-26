import { normalizeBasePath, registerRestLikeRoutes } from "@eristack/backseat/adapters";
import type { Backseat } from "@eristack/backseat";
import { createMemoryStorageDriver } from "../core/memory-driver.js";
import { createFileManager } from "../core/create-file-manager.js";
import type { FileManager, FileManagerConfig } from "../core/types.js";
import { createRestFileManagerActions } from "../rest/index.js";
import { createBackseatFileRecordStore } from "./file-record-store.js";
import { createFileManagerRestRoutes } from "./file-routes.js";

export type RegisterFileManagerBackseatOptions = {
  basePath?: string;
  fileManager?: FileManager;
  maxPresignBytes?: number;
} & Partial<Pick<FileManagerConfig, "keyPrefix" | "presign">>;

export function registerFileManagerBackseat(
  api: Backseat,
  options: RegisterFileManagerBackseatOptions = {},
): FileManager {
  const fileManager =
    options.fileManager ??
    createFileManager({
      driver: createMemoryStorageDriver({ bucket: "backseat" }),
      store: createBackseatFileRecordStore(api.store),
      keyPrefix: options.keyPrefix,
      presign: options.presign,
    });

  const actions = createRestFileManagerActions({
    fileManager,
    maxPresignBytes: options.maxPresignBytes,
  });
  const base = normalizeBasePath(options.basePath ?? "/files");
  registerRestLikeRoutes(api, createFileManagerRestRoutes(base, actions));

  return fileManager;
}

export { createBackseatFileRecordStore } from "./file-record-store.js";
export { FILE_MANAGER_COLLECTIONS } from "./collections.js";
export { createFileManagerRestRoutes } from "./file-routes.js";
