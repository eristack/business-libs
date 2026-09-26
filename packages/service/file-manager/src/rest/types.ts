import type { FileManager } from "../core/types.js";

export type RestRequest = {
  method: string;
  headers: { get(name: string): string | null };
  body?: unknown;
  params?: Record<string, string | undefined>;
  query?: Record<string, string | string[] | undefined>;
};

export type RestResponse = {
  status: number;
  body: unknown;
  headers?: Record<string, string>;
};

export type RestFileManagerConfig = {
  fileManager: FileManager;
  /** Max upload bytes for presign requests (default 50 MiB). */
  maxPresignBytes?: number;
};

export type PresignUploadBody = {
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  namespace?: string;
  ownerId?: string;
};

export type CompleteUploadBody = {
  fileId: string;
  checksumSha256?: string;
};

export type StoredFileBody = {
  id: string;
  status: string;
  namespace: string;
  ownerId?: string;
  ref: unknown;
  createdAt: string;
  updatedAt: string;
  readyAt?: string;
};
