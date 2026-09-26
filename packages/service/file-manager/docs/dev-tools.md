---
title: Dev tools (React)
description: FileUploadDropzone and FileManagerDevPanel for local admin UIs.
---

# Dev tools (React)

Headless-ish React helpers — style with `className` or wrap in your design system.

## Dropzone

```tsx
import { createFileManagerClient } from "@eristack/file-manager/client";
import { FileUploadDropzone } from "@eristack/file-manager/react";

const client = createFileManagerClient({ baseUrl: "/files" });

<FileUploadDropzone
  client={client}
  baseUrl="/files"
  namespace="dev"
  accept="image/*,application/pdf"
  onUploaded={(file) => console.log(file.id, file.ref)}
/>
```

Uses TanStack Query mutation `usePresignedUpload` under the hood.

## Admin panel

`FileManagerDevPanel` lists **ready** files in a namespace, uploads, opens presigned GET links, and deletes.

```tsx
import { FileManagerDevPanel } from "@eristack/file-manager/react";

<FileManagerDevPanel baseUrl="/files" namespace="dev" title="Upload lab" />
```

Mount on an internal route (e.g. `/dev/files`) behind auth in production.

## Query keys

`fileManagerQueryKeys(baseUrl)` — invalidate after mutations in custom UIs.
