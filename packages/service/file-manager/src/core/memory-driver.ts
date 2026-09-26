import type { PresignGetOptions, PresignPutOptions, StorageDriver } from "./types.js";

type MemoryBlob = {
  body: Uint8Array;
  mimeType: string;
};

function presignMemoryPut(
  bucket: string,
  key: string,
  options?: PresignPutOptions,
) {
  const ttl = options?.expiresInSeconds ?? 900;
  const expiresAt = new Date(Date.now() + ttl * 1000).toISOString();
  const url = `memory://${bucket}/${encodeURIComponent(key)}?method=PUT&expires=${encodeURIComponent(expiresAt)}`;
  const headers: Record<string, string> | undefined = options?.contentType
    ? { "content-type": options.contentType }
    : undefined;
  return {
    url,
    method: "PUT" as const,
    headers,
    expiresAt,
  };
}

function presignMemoryGet(
  bucket: string,
  key: string,
  options?: PresignGetOptions,
) {
  const ttl = options?.expiresInSeconds ?? 900;
  const expiresAt = new Date(Date.now() + ttl * 1000).toISOString();
  const url = `memory://${bucket}/${encodeURIComponent(key)}?method=GET&expires=${encodeURIComponent(expiresAt)}`;
  return { url, method: "GET" as const, expiresAt };
}

/** Unit tests and local prototypes only — not for production. */
export function createMemoryStorageDriver(options?: {
  bucket?: string;
}): StorageDriver {
  const bucket = options?.bucket ?? "memory";
  const objects = new Map<string, MemoryBlob>();

  return {
    provider: "memory",
    bucket,
    async putObject({ key, body, mimeType }) {
      objects.set(key, { body: Uint8Array.from(body), mimeType });
    },
    async deleteObject({ key }) {
      objects.delete(key);
    },
    async headObject({ key }) {
      const blob = objects.get(key);
      if (!blob) return null;
      return { sizeBytes: blob.body.byteLength, mimeType: blob.mimeType };
    },
    async presignPut({ key, options }) {
      return presignMemoryPut(bucket, key, options);
    },
    async presignGet({ key, options }) {
      return presignMemoryGet(bucket, key, options);
    },
  };
}

/** Test helper: write through memory presigned PUT URLs. */
export async function memoryPutViaPresignedUrl(
  driver: StorageDriver,
  url: string,
  body: Uint8Array | Buffer,
  headers?: Record<string, string>,
): Promise<void> {
  if (driver.provider !== "memory") {
    throw new Error("memoryPutViaPresignedUrl requires a memory driver");
  }
  const parsed = new URL(url);
  const key = decodeURIComponent(parsed.pathname.replace(/^\//, ""));
  await driver.putObject({
    key,
    body,
    mimeType: headers?.["content-type"] ?? "application/octet-stream",
  });
}
