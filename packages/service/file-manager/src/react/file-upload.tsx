"use client";

import type { StoredFile } from "../core/types.js";
import { usePresignedUpload } from "./hooks.js";
import type { FileManagerClient } from "../client/create-client.js";

export type FileUploadDropzoneProps = {
  client: FileManagerClient;
  baseUrl: string;
  namespace?: string;
  accept?: string;
  disabled?: boolean;
  onUploaded?: (file: StoredFile) => void;
  className?: string;
};

/** Headless-friendly dropzone — style with `className` or wrap in your design system. */
export function FileUploadDropzone({
  client,
  baseUrl,
  namespace,
  accept,
  disabled,
  onUploaded,
  className,
}: FileUploadDropzoneProps) {
  const upload = usePresignedUpload({ client, baseUrl, namespace });

  return (
    <label
      data-eristack-file-upload=""
      className={className}
      style={{
        display: "block",
        border: "1px dashed var(--border, #ccc)",
        borderRadius: 8,
        padding: "1rem",
        cursor: disabled || upload.isPending ? "not-allowed" : "pointer",
        opacity: disabled ? 0.6 : 1,
      }}
    >
      <input
        type="file"
        accept={accept}
        disabled={disabled || upload.isPending}
        style={{ display: "none" }}
        onChange={async (event) => {
          const file = event.target.files?.[0];
          event.target.value = "";
          if (!file) return;
          const stored = await upload.mutateAsync(file);
          onUploaded?.(stored);
        }}
      />
      <span>{upload.isPending ? "Uploading…" : "Choose a file or drop here"}</span>
      {upload.isError ? (
        <p role="alert" style={{ color: "crimson", marginTop: 8, fontSize: 13 }}>
          {upload.error instanceof Error ? upload.error.message : "Upload failed"}
        </p>
      ) : null}
    </label>
  );
}
