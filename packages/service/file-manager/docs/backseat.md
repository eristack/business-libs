---
title: Backseat (Horizon A)
description: In-browser mock /files routes and fileManager.files collection.
---

# Backseat

| | |
| --- | --- |
| Imports | `@eristack/file-manager/backseat` |
| Register | `registerFileManagerBackseat(api, { basePath?: "/files", fileManager? })` |
| Memory factory | `createBackseatFileManagerStores()` → `{ backseatStore, fileManager, driver }` |
| IndexedDB | `createIndexedDbFileManagerStores({ dbName })` from `@eristack/file-manager/backseat/store` |
| Collection | `fileManager.files` |

Production uploads use **S3 + Drizzle**. Backseat uses the **memory storage driver** for blob bytes and Backseat IndexedDB/memory for metadata — prototypes only.

```ts
import { createBackseat } from "@eristack/backseat";
import {
  createBackseatFileManagerStores,
  registerFileManagerBackseat,
} from "@eristack/file-manager/backseat";

const { backseatStore, fileManager } = createBackseatFileManagerStores();
const api = createBackseat({ store: backseatStore, baseUrl: "/api" });

registerFileManagerBackseat(api, { fileManager, basePath: "/files" });
```

Same REST shapes as `@eristack/file-manager/express` — wire Vite proxy `/api/files` → Backseat.

Pair with `@eristack/jwt-auth/backseat` when uploads require login (guard in app, not in this package).

See `@eristack/ai-knowledge#upgrading-eristack` §3.2 spine matrix for register order alongside epoch and doc-number.
