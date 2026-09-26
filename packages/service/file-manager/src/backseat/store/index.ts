import { createIndexedDbBackseatStore } from "@eristack/backseat/store";
import { createMemoryStorageDriver } from "../../core/memory-driver.js";
import { createFileManager } from "../../core/create-file-manager.js";
import type { FileManager, StorageDriver } from "../../core/types.js";
import { createBackseatFileRecordStore } from "../file-record-store.js";

export type CreateIndexedDbFileManagerStoresOptions = {
  dbName?: string;
  driver?: StorageDriver;
};

/** Browser default — IndexedDB metadata + in-memory blob bytes (Horizon A). */
export function createIndexedDbFileManagerStores(
  options: CreateIndexedDbFileManagerStoresOptions = {},
): {
  backseatStore: ReturnType<typeof createIndexedDbBackseatStore>;
  fileManager: FileManager;
  driver: StorageDriver;
} {
  const backseatStore = createIndexedDbBackseatStore({
    dbName: options.dbName,
  });
  const driver = options.driver ?? createMemoryStorageDriver({ bucket: "backseat" });
  const fileManager = createFileManager({
    driver,
    store: createBackseatFileRecordStore(backseatStore),
  });
  return { backseatStore, fileManager, driver };
}

export { createBackseatFileRecordStore } from "../file-record-store.js";
export { FILE_MANAGER_COLLECTIONS } from "../collections.js";
