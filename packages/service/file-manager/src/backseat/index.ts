import {
  createMemoryBackseatStore,
  type BackseatStore,
} from "@eristack/backseat";
import { createMemoryStorageDriver } from "../core/memory-driver.js";
import { createFileManager } from "../core/create-file-manager.js";
import type { FileManager, StorageDriver } from "../core/types.js";
import { createBackseatFileRecordStore } from "./file-record-store.js";

export function createBackseatFileManagerStores(options: {
  store?: BackseatStore;
  driver?: StorageDriver;
} = {}): {
  backseatStore: BackseatStore;
  fileManager: FileManager;
  driver: StorageDriver;
} {
  const backseatStore = options.store ?? createMemoryBackseatStore();
  const driver = options.driver ?? createMemoryStorageDriver({ bucket: "backseat" });
  const fileManager = createFileManager({
    driver,
    store: createBackseatFileRecordStore(backseatStore),
  });
  return { backseatStore, fileManager, driver };
}

export {
  registerFileManagerBackseat,
  createBackseatFileRecordStore,
  FILE_MANAGER_COLLECTIONS,
  createFileManagerRestRoutes,
} from "./register.js";
export type { RegisterFileManagerBackseatOptions } from "./register.js";
