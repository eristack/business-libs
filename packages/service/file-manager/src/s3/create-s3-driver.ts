import {
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
  type S3ClientConfig,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import type { StorageDriver } from "../core/types.js";

export type CreateS3StorageDriverOptions = {
  bucket: string;
  region: string;
  /** Optional custom endpoint (MinIO, R2, LocalStack). */
  endpoint?: string;
  forcePathStyle?: boolean;
  credentials?: S3ClientConfig["credentials"];
  /** Default TTL when presign options omit expiresInSeconds. */
  defaultExpiresInSeconds?: number;
};

export function createS3StorageDriver(
  options: CreateS3StorageDriverOptions,
): StorageDriver {
  const client = new S3Client({
    region: options.region,
    endpoint: options.endpoint,
    forcePathStyle: options.forcePathStyle,
    credentials: options.credentials,
  });

  const defaultTtl = options.defaultExpiresInSeconds ?? 900;

  return {
    provider: "s3",
    bucket: options.bucket,
    async putObject({ key, body, mimeType }) {
      await client.send(
        new PutObjectCommand({
          Bucket: options.bucket,
          Key: key,
          Body: body,
          ContentType: mimeType,
        }),
      );
    },
    async deleteObject({ key }) {
      await client.send(
        new DeleteObjectCommand({
          Bucket: options.bucket,
          Key: key,
        }),
      );
    },
    async headObject({ key }) {
      try {
        const result = await client.send(
          new HeadObjectCommand({
            Bucket: options.bucket,
            Key: key,
          }),
        );
        return {
          sizeBytes: Number(result.ContentLength ?? 0),
          mimeType: result.ContentType,
        };
      } catch {
        return null;
      }
    },
    async presignPut({ key, options: presignOptions }) {
      const expiresIn = presignOptions?.expiresInSeconds ?? defaultTtl;
      const command = new PutObjectCommand({
        Bucket: options.bucket,
        Key: key,
        ContentType: presignOptions?.contentType,
        ContentLength: presignOptions?.contentLength,
      });
      const url = await getSignedUrl(client, command, { expiresIn });
      const headers: Record<string, string> = {};
      if (presignOptions?.contentType) {
        headers["content-type"] = presignOptions.contentType;
      }
      return {
        url,
        method: "PUT" as const,
        headers: Object.keys(headers).length > 0 ? headers : undefined,
        expiresAt: new Date(Date.now() + expiresIn * 1000).toISOString(),
      };
    },
    async presignGet({ key, options: presignOptions }) {
      const expiresIn = presignOptions?.expiresInSeconds ?? defaultTtl;
      const command = new GetObjectCommand({
        Bucket: options.bucket,
        Key: key,
        ResponseContentDisposition: presignOptions?.downloadFilename
          ? `attachment; filename="${presignOptions.downloadFilename.replace(/"/g, "")}"`
          : undefined,
      });
      const url = await getSignedUrl(client, command, { expiresIn });
      return {
        url,
        method: "GET" as const,
        expiresAt: new Date(Date.now() + expiresIn * 1000).toISOString(),
      };
    },
  };
}
