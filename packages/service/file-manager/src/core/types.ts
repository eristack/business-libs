import type { FileRef } from "./file-ref.js";

export type FileProvider = "s3" | "memory" | "local";

export type FileStatus = "pending" | "ready" | "deleted";

export type StoredFile = {
  id: string;
  status: FileStatus;
  ref: FileRef;
  namespace: string;
  ownerId?: string;
  createdAt: string;
  updatedAt: string;
  readyAt?: string;
};

export type PresignPutOptions = {
  expiresInSeconds?: number;
  contentType?: string;
  contentLength?: number;
};

export type PresignGetOptions = {
  expiresInSeconds?: number;
  downloadFilename?: string;
};

export type StorageDriver = {
  readonly provider: FileProvider;
  readonly bucket: string;
  putObject(input: {
    key: string;
    body: Uint8Array | Buffer;
    mimeType: string;
  }): Promise<void>;
  deleteObject(input: { key: string }): Promise<void>;
  headObject(input: { key: string }): Promise<{
    sizeBytes: number;
    mimeType?: string;
  } | null>;
  presignPut(input: {
    key: string;
    options?: PresignPutOptions;
  }): Promise<{ url: string; method: "PUT"; headers?: Record<string, string>; expiresAt: string }>;
  presignGet(input: {
    key: string;
    options?: PresignGetOptions;
  }): Promise<{ url: string; method: "GET"; expiresAt: string }>;
};

export type FileRecordStore = {
  insert(record: Omit<StoredFile, "createdAt" | "updatedAt"> & Partial<Pick<StoredFile, "createdAt" | "updatedAt">>): Promise<StoredFile>;
  update(id: string, patch: Partial<Pick<StoredFile, "status" | "ref" | "readyAt" | "updatedAt">>): Promise<StoredFile>;
  getById(id: string): Promise<StoredFile | null>;
  list(input?: { namespace?: string; status?: FileStatus; limit?: number; offset?: number }): Promise<StoredFile[]>;
};

export type FileManagerPresignDefaults = {
  putExpiresInSeconds: number;
  getExpiresInSeconds: number;
};

export type FileManagerConfig = {
  driver: StorageDriver;
  store: FileRecordStore;
  /** Prepended to every object key (e.g. `prod/acme`). No leading slash. */
  keyPrefix?: string;
  presign?: Partial<FileManagerPresignDefaults>;
};

export type BeginPresignedUploadInput = {
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  namespace?: string;
  ownerId?: string;
};

export type PresignedUploadSession = {
  fileId: string;
  uploadUrl: string;
  uploadMethod: "PUT";
  uploadHeaders?: Record<string, string>;
  expiresAt: string;
  ref: FileRef;
};

export type CompleteUploadInput = {
  fileId: string;
  checksumSha256?: string;
};

export type ServerUploadInput = {
  originalName: string;
  mimeType: string;
  body: Uint8Array | Buffer;
  namespace?: string;
  ownerId?: string;
  checksumSha256?: string;
};

export type FileManager = {
  beginPresignedUpload(input: BeginPresignedUploadInput): Promise<PresignedUploadSession>;
  completeUpload(input: CompleteUploadInput): Promise<StoredFile>;
  uploadFromServer(input: ServerUploadInput): Promise<StoredFile>;
  resolveDownloadUrl(fileId: string, options?: PresignGetOptions): Promise<{ url: string; expiresAt: string }>;
  getFile(fileId: string): Promise<StoredFile | null>;
  deleteFile(fileId: string): Promise<void>;
  listFiles(input?: Parameters<FileRecordStore["list"]>[0]): Promise<StoredFile[]>;
};
