import { z } from "zod";

export const fileRefSchema = z.object({
  v: z.literal(1),
  provider: z.enum(["s3", "memory", "local"]),
  bucket: z.string().min(1),
  key: z.string().min(1),
  mimeType: z.string().min(1),
  sizeBytes: z.number().nonnegative(),
  originalName: z.string().min(1),
  checksumSha256: z.string().optional(),
});

export const presignUploadBodySchema = z.object({
  originalName: z.string().min(1),
  mimeType: z.string().min(1),
  sizeBytes: z.number().nonnegative(),
  namespace: z.string().optional(),
  ownerId: z.string().optional(),
});

export const completeUploadBodySchema = z.object({
  fileId: z.string().min(1),
  checksumSha256: z.string().optional(),
});
