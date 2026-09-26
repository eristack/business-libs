export { createFileManager } from "./core/create-file-manager.js";
export {
  createFileRef,
  fileRefFromColumn,
  parseFileRef,
  serializeFileRef,
  FILE_REF_VERSION,
  type EntityFilePointer,
  type FileRef,
} from "./core/file-ref.js";
export { buildObjectKey, sha256Hex } from "./core/object-key.js";
export {
  FileManagerError,
  FileNotFoundError,
  FileNotReadyError,
  InvalidFileInputError,
  StorageObjectMissingError,
} from "./core/errors.js";
/** @deprecated Import from `@eristack/file-manager/testing` instead. */
export { createMemoryStorageDriver, memoryPutViaPresignedUrl } from "./core/memory-driver.js";
/** @deprecated Import from `@eristack/file-manager/testing` instead. */
export { createMemoryFileRecordStore } from "./core/memory-store.js";
export type {
  BeginPresignedUploadInput,
  CompleteUploadInput,
  FileManager,
  FileManagerConfig,
  FileManagerPresignDefaults,
  FileProvider,
  FileRecordStore,
  FileStatus,
  PresignGetOptions,
  PresignPutOptions,
  PresignedUploadSession,
  ServerUploadInput,
  StorageDriver,
  StoredFile,
} from "./core/types.js";
