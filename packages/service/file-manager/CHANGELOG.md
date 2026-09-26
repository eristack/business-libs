# @eristack/file-manager

## 0.1.0

### Minor Changes

- fdf828b: Initial release: headless file uploads for TypeScript ERP apps.

  - **Core:** `createFileManager`, FileRef v1, presign → complete → download, server-side `uploadFromServer`, memory driver/store (tests only).
  - **S3:** `createS3StorageDriver` (AWS SDK v3 peers).
  - **Drizzle:** `file_manager_files` table + `createDrizzleFileRecordStore`.
  - **HTTP:** REST actions + `createFileManagerRouter` (Express).
  - **Client / React:** `uploadViaPresign`, dropzone, `FileManagerDevPanel`.
  - **Backseat:** `registerFileManagerBackseat`, memory + IndexedDB store factories (`@eristack/file-manager/backseat/store`).
  - **Tests:** core, REST, Express supertest, client, Zod, Drizzle integration, Backseat routes.
