# Bug: resolveDownloadUrl forces Content-Disposition: attachment on every URL

> Portable Eristack ticket — send this file to the maintainer. An agent can open it and start fixing.

## Meta

- **id:** `20261001-072239-bug-resolvedownloadurl-forces-content-disposition-at-f2cd7c`
- **kind:** bug
- **package:** `@eristack/file-manager`
- **observed version:** `0.1.1`
- **created:** 2026-10-01T07:22:39.650Z
- **reporter:** brandworkshub (via Devin)

## Summary

resolveDownloadUrl defaults downloadFilename to the stored originalName, so every signed GET URL is served with ResponseContentDisposition=attachment. Browsers refuse to render those URLs inline in <img src>, breaking image previews in consumer apps (BrandWorksHub ContentItemDetail, client portal / PlatformFrame).

## Scenario

BrandWorksHub migrated uploads to @eristack/file-manager. Uploads succeed but images do not display in ContentItemDetail or the client portal; download buttons work. QA verified the signed URL carries attachment disposition. Previously the app used raw presignDownload (no disposition) for view URLs.

## Steps to reproduce

- Upload a file via beginPresignedUpload + completeUpload
- Call fileManager.resolveDownloadUrl(fileId) with no options and use the URL in <img src>
- Browser requests the signed S3 URL

## Expected

URL is inline-viewable (no Content-Disposition) unless the caller passes downloadFilename explicitly

## Actual

S3 driver presignGet always receives downloadFilename=record.ref.originalName, emitting ResponseContentDisposition=attachment; <img> fails to render

## Impact

_None yet._

## Environment

_Not provided._

## Logs

_None attached._

## Suspects

_None yet._

## Fix plan

- In packages/service/file-manager/src/core/create-file-manager.ts resolveDownloadUrl, stop defaulting downloadFilename to record.ref.originalName — pass options?.downloadFilename through as-is
- Add regression test: spy driver asserts presignGet gets downloadFilename=undefined by default and the provided value when set
- Update docs/s3-and-presigned.md, docs/getting-started.md, and skills/file-manager-core/SKILL.md to document inline-by-default behavior
- Ship as patch changeset (@eristack/file-manager 0.1.2)

## Agent handoff

1. Load the package Intent skill(s) for `@eristack/file-manager`.
2. Reproduce from **Steps to reproduce** (or confirm cannot).
3. Implement along **Fix plan**; keep scope to this package.
4. Add/adjust tests; run package `test` + `typecheck`.
5. If public API changes, add a Changeset.

## Notes

_None yet._
