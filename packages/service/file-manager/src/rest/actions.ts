import { FileNotFoundError, InvalidFileInputError } from "../core/errors.js";
import { toFileManagerErrorResponse } from "./errors.js";
import type {
  CompleteUploadBody,
  PresignUploadBody,
  RestFileManagerConfig,
  RestRequest,
  RestResponse,
  StoredFileBody,
} from "./types.js";
import type { StoredFile } from "../core/types.js";

const DEFAULT_MAX_PRESIGN_BYTES = 50 * 1024 * 1024;

function readBodyObject(req: RestRequest): Record<string, unknown> {
  if (!req.body || typeof req.body !== "object" || Array.isArray(req.body)) {
    return {};
  }
  return req.body as Record<string, unknown>;
}

function toStoredFileBody(file: StoredFile): StoredFileBody {
  return {
    id: file.id,
    status: file.status,
    namespace: file.namespace,
    ownerId: file.ownerId,
    ref: file.ref,
    createdAt: file.createdAt,
    updatedAt: file.updatedAt,
    readyAt: file.readyAt,
  };
}

function parsePresignBody(body: Record<string, unknown>): PresignUploadBody {
  const originalName = body.originalName;
  const mimeType = body.mimeType;
  const sizeBytes = body.sizeBytes;
  if (typeof originalName !== "string" || !originalName.trim()) {
    throw new InvalidFileInputError("originalName is required");
  }
  if (typeof mimeType !== "string" || !mimeType.trim()) {
    throw new InvalidFileInputError("mimeType is required");
  }
  if (typeof sizeBytes !== "number" || !Number.isFinite(sizeBytes)) {
    throw new InvalidFileInputError("sizeBytes must be a number");
  }
  return {
    originalName,
    mimeType,
    sizeBytes,
    namespace: typeof body.namespace === "string" ? body.namespace : undefined,
    ownerId: typeof body.ownerId === "string" ? body.ownerId : undefined,
  };
}

export function createRestFileManagerActions(config: RestFileManagerConfig) {
  const maxBytes = config.maxPresignBytes ?? DEFAULT_MAX_PRESIGN_BYTES;

  return {
    async presignUpload(req: RestRequest): Promise<RestResponse> {
      try {
        const input = parsePresignBody(readBodyObject(req));
        if (input.sizeBytes > maxBytes) {
          throw new InvalidFileInputError(`sizeBytes exceeds limit (${maxBytes})`);
        }
        const session = await config.fileManager.beginPresignedUpload(input);
        return { status: 201, body: session };
      } catch (err) {
        return toFileManagerErrorResponse(err);
      }
    },

    async completeUpload(req: RestRequest): Promise<RestResponse> {
      try {
        const body = readBodyObject(req);
        const fileId = body.fileId;
        if (typeof fileId !== "string" || !fileId) {
          throw new InvalidFileInputError("fileId is required");
        }
        const payload: CompleteUploadBody = {
          fileId,
          checksumSha256:
            typeof body.checksumSha256 === "string" ? body.checksumSha256 : undefined,
        };
        const file = await config.fileManager.completeUpload(payload);
        return { status: 200, body: toStoredFileBody(file) };
      } catch (err) {
        return toFileManagerErrorResponse(err);
      }
    },

    async getDownloadUrl(req: RestRequest): Promise<RestResponse> {
      try {
        const id = req.params?.id;
        if (!id) throw new InvalidFileInputError("id is required");
        const download = await config.fileManager.resolveDownloadUrl(id);
        return { status: 200, body: download };
      } catch (err) {
        return toFileManagerErrorResponse(err);
      }
    },

    async getFile(req: RestRequest): Promise<RestResponse> {
      try {
        const id = req.params?.id;
        if (!id) throw new InvalidFileInputError("id is required");
        const file = await config.fileManager.getFile(id);
        if (!file) {
          return toFileManagerErrorResponse(new FileNotFoundError(id));
        }
        return { status: 200, body: toStoredFileBody(file) };
      } catch (err) {
        return toFileManagerErrorResponse(err);
      }
    },

    async listFiles(req: RestRequest): Promise<RestResponse> {
      try {
        const namespace =
          typeof req.query?.namespace === "string" ? req.query.namespace : undefined;
        const status =
          typeof req.query?.status === "string"
            ? (req.query.status as StoredFile["status"])
            : undefined;
        const files = await config.fileManager.listFiles({ namespace, status });
        return { status: 200, body: { items: files.map(toStoredFileBody) } };
      } catch (err) {
        return toFileManagerErrorResponse(err);
      }
    },

    async deleteFile(req: RestRequest): Promise<RestResponse> {
      try {
        const id = req.params?.id;
        if (!id) throw new InvalidFileInputError("id is required");
        await config.fileManager.deleteFile(id);
        return { status: 204, body: null };
      } catch (err) {
        return toFileManagerErrorResponse(err);
      }
    },
  };
}
