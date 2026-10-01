---
"@eristack/file-manager": patch
---

`resolveDownloadUrl` no longer defaults `downloadFilename` to `originalName` — presigned GET URLs are inline-viewable by default. Pass `{ downloadFilename }` (or `GET …/download-url?downloadFilename=`) for attachment downloads. Client `getDownloadUrl` accepts the same options.
