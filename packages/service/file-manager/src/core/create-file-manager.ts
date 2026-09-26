import { randomUUID } from "node:crypto";
import {
  FileNotFoundError,
  FileNotReadyError,
  InvalidFileInputError,
  StorageObjectMissingError,
} from "./errors.js";
import { createFileRef } from "./file-ref.js";
import { buildObjectKey, sha256Hex } from "./object-key.js";
import type {
  BeginPresignedUploadInput,
  CompleteUploadInput,
  FileManager,
  FileManagerConfig,
  FileManagerPresignDefaults,
  PresignGetOptions,
  ServerUploadInput,
  StoredFile,
} from "./types.js";

const DEFAULT_PRESIGN: FileManagerPresignDefaults = {
  putExpiresInSeconds: 900,
  getExpiresInSeconds: 900,
};

function assertUploadInput(input: { originalName: string; mimeType: string; sizeBytes: number }) {
  if (!input.originalName.trim()) {
    throw new InvalidFileInputError("originalName is required");
  }
  if (!input.mimeType.trim()) {
    throw new InvalidFileInputError("mimeType is required");
  }
  if (!Number.isFinite(input.sizeBytes) || input.sizeBytes < 0) {
    throw new InvalidFileInputError("sizeBytes must be a non-negative number");
  }
}

export function createFileManager(config: FileManagerConfig): FileManager {
  const presign: FileManagerPresignDefaults = {
    ...DEFAULT_PRESIGN,
    ...config.presign,
  };

  function objectKey(input: {
    namespace: string;
    originalName: string;
    fileId: string;
  }): string {
    return buildObjectKey({
      prefix: config.keyPrefix,
      namespace: input.namespace,
      originalName: input.originalName,
      fileId: input.fileId,
    });
  }

  async function markReady(
    record: StoredFile,
    patch: { sizeBytes: number; mimeType?: string; checksumSha256?: string },
  ): Promise<StoredFile> {
    const ref = createFileRef({
      ...record.ref,
      sizeBytes: patch.sizeBytes,
      mimeType: patch.mimeType ?? record.ref.mimeType,
      checksumSha256: patch.checksumSha256 ?? record.ref.checksumSha256,
    });
    const readyAt = new Date().toISOString();
    return config.store.update(record.id, {
      status: "ready",
      ref,
      readyAt,
    });
  }

  return {
    async beginPresignedUpload(input: BeginPresignedUploadInput) {
      assertUploadInput(input);
      const fileId = randomUUID();
      const namespace = input.namespace?.trim() || "default";
      const key = objectKey({
        namespace,
        originalName: input.originalName,
        fileId,
      });

      const ref = createFileRef({
        provider: config.driver.provider,
        bucket: config.driver.bucket,
        key,
        mimeType: input.mimeType,
        sizeBytes: input.sizeBytes,
        originalName: input.originalName,
      });

      await config.store.insert({
        id: fileId,
        status: "pending",
        ref,
        namespace,
        ownerId: input.ownerId,
      });

      const signed = await config.driver.presignPut({
        key,
        options: {
          expiresInSeconds: presign.putExpiresInSeconds,
          contentType: input.mimeType,
          contentLength: input.sizeBytes,
        },
      });

      return {
        fileId,
        uploadUrl: signed.url,
        uploadMethod: "PUT" as const,
        uploadHeaders: signed.headers,
        expiresAt: signed.expiresAt,
        ref,
      };
    },

    async completeUpload(input: CompleteUploadInput) {
      const record = await config.store.getById(input.fileId);
      if (!record) throw new FileNotFoundError(input.fileId);
      if (record.status === "deleted") throw new FileNotFoundError(input.fileId);

      const head = await config.driver.headObject({ key: record.ref.key });
      if (!head) throw new StorageObjectMissingError(record.ref.key);

      return markReady(record, {
        sizeBytes: head.sizeBytes,
        mimeType: head.mimeType,
        checksumSha256: input.checksumSha256,
      });
    },

    async uploadFromServer(input: ServerUploadInput) {
      if (!input.body || input.body.byteLength === 0) {
        throw new InvalidFileInputError("body is required");
      }
      assertUploadInput({
        originalName: input.originalName,
        mimeType: input.mimeType,
        sizeBytes: input.body.byteLength,
      });

      const fileId = randomUUID();
      const namespace = input.namespace?.trim() || "default";
      const key = objectKey({
        namespace,
        originalName: input.originalName,
        fileId,
      });

      const checksumSha256 = input.checksumSha256 ?? sha256Hex(input.body);

      await config.driver.putObject({
        key,
        body: input.body,
        mimeType: input.mimeType,
      });

      const ref = createFileRef({
        provider: config.driver.provider,
        bucket: config.driver.bucket,
        key,
        mimeType: input.mimeType,
        sizeBytes: input.body.byteLength,
        originalName: input.originalName,
        checksumSha256,
      });

      const now = new Date().toISOString();
      return config.store.insert({
        id: fileId,
        status: "ready",
        ref,
        namespace,
        ownerId: input.ownerId,
        readyAt: now,
      });
    },

    async resolveDownloadUrl(fileId: string, options?: PresignGetOptions) {
      const record = await config.store.getById(fileId);
      if (!record || record.status === "deleted") throw new FileNotFoundError(fileId);
      if (record.status !== "ready") throw new FileNotReadyError(fileId);

      const signed = await config.driver.presignGet({
        key: record.ref.key,
        options: {
          expiresInSeconds: options?.expiresInSeconds ?? presign.getExpiresInSeconds,
          downloadFilename: options?.downloadFilename ?? record.ref.originalName,
        },
      });

      return { url: signed.url, expiresAt: signed.expiresAt };
    },

    async getFile(fileId) {
      const record = await config.store.getById(fileId);
      if (!record || record.status === "deleted") return null;
      return record;
    },

    async deleteFile(fileId) {
      const record = await config.store.getById(fileId);
      if (!record || record.status === "deleted") throw new FileNotFoundError(fileId);

      await config.driver.deleteObject({ key: record.ref.key });
      await config.store.update(fileId, { status: "deleted" });
    },

    async listFiles(input) {
      const items = await config.store.list(input);
      return items.filter((item) => item.status !== "deleted");
    },
  };
}
