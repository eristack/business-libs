"use client";

import { useMemo } from "react";
import {
  createFileManagerClient,
  type FileManagerClient,
} from "../client/create-client.js";
import { useFileDownloadUrl, useFileList, usePresignedUpload } from "./hooks.js";
import { FileUploadDropzone } from "./file-upload.js";

export type FileManagerDevPanelProps = {
  /** API prefix, e.g. `https://api.example.com/files` */
  baseUrl: string;
  namespace?: string;
  client?: FileManagerClient;
  title?: string;
};

function FileRow(props: {
  client: FileManagerClient;
  fileId: string;
  label: string;
  onDelete: () => void;
}) {
  const download = useFileDownloadUrl({ client: props.client, fileId: props.fileId });

  return (
    <li
      data-eristack-file-row=""
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "6px 0",
        borderBottom: "1px solid var(--border, #eee)",
        fontSize: 13,
      }}
    >
      <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis" }}>
        {props.label}
      </span>
      {download.data?.url ? (
        <a href={download.data.url} target="_blank" rel="noreferrer">
          Open
        </a>
      ) : (
        <span style={{ opacity: 0.5 }}>…</span>
      )}
      <button type="button" onClick={props.onDelete}>
        Delete
      </button>
    </li>
  );
}

/** Dev/admin surface: list, upload, delete, open via presigned GET. Style in app or replace. */
export function FileManagerDevPanel({
  baseUrl,
  namespace,
  client: clientProp,
  title = "Files",
}: FileManagerDevPanelProps) {
  const client = useMemo(
    () => clientProp ?? createFileManagerClient({ baseUrl }),
    [clientProp, baseUrl],
  );
  const list = useFileList({ client, baseUrl, namespace });
  const upload = usePresignedUpload({ client, baseUrl, namespace });

  return (
    <section data-eristack-file-manager-panel="">
      <header style={{ marginBottom: 12 }}>
        <h2 style={{ fontSize: 16, fontWeight: 600 }}>{title}</h2>
        {namespace ? (
          <p style={{ fontSize: 12, opacity: 0.7 }}>namespace: {namespace}</p>
        ) : null}
      </header>

      <FileUploadDropzone
        client={client}
        baseUrl={baseUrl}
        namespace={namespace}
        onUploaded={() => list.refetch()}
      />

      {list.isLoading ? <p style={{ marginTop: 12 }}>Loading…</p> : null}
      {list.isError ? (
        <p role="alert" style={{ color: "crimson" }}>
          Failed to load files
        </p>
      ) : null}

      <ul style={{ listStyle: "none", margin: "16px 0 0", padding: 0 }}>
        {(list.data ?? []).map((file) => (
          <FileRow
            key={file.id}
            client={client}
            fileId={file.id}
            label={file.ref.originalName}
            onDelete={async () => {
              await client.deleteFile(file.id);
              await list.refetch();
            }}
          />
        ))}
      </ul>

      {upload.isPending ? (
        <p style={{ marginTop: 8, fontSize: 12 }}>Upload in progress…</p>
      ) : null}
    </section>
  );
}
