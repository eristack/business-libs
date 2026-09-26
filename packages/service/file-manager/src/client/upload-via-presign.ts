import type { FileManagerClient } from "./create-client.js";
import type { StoredFile } from "../core/types.js";

export type UploadViaPresignOptions = {
  client: FileManagerClient;
  file: File | Blob;
  originalName?: string;
  namespace?: string;
  ownerId?: string;
  fetch?: typeof fetch;
};

/** Browser/server helper: presign → PUT bytes → complete. */
export async function uploadViaPresign(
  options: UploadViaPresignOptions,
): Promise<StoredFile> {
  const fetchFn = options.fetch ?? fetch;
  const blob = options.file;
  const originalName =
    options.originalName ??
    (blob instanceof File ? blob.name : "upload.bin");
  const mimeType = blob.type || "application/octet-stream";

  const presign = await options.client.presignUpload({
    originalName,
    mimeType,
    sizeBytes: blob.size,
    namespace: options.namespace,
    ownerId: options.ownerId,
  });
  if (!presign.ok) {
    throw new Error(`Presign failed (${presign.status})`);
  }

  const session = presign.data;
  const putRes = await fetchFn(session.uploadUrl, {
    method: session.uploadMethod,
    headers: session.uploadHeaders,
    body: blob,
  });
  if (!putRes.ok) {
    throw new Error(`Upload PUT failed (${putRes.status})`);
  }

  const complete = await options.client.completeUpload({ fileId: session.fileId });
  if (!complete.ok) {
    throw new Error(`Complete failed (${complete.status})`);
  }
  return complete.data;
}
