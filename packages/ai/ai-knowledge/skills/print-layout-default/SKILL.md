---
name: print-layout-default
description: >
  Company AR/AP print defaults vs nullable per-document print field masks — resolve at print time,
  freeze on save, expectedVersion on PATCH. App-owned field names; not a @eristack package.
metadata:
  type: core
  library: "@eristack/ai-knowledge"
sources:
  - eristack/business-libs:packages/ai/ai-knowledge/knowledge/print-layout-default-vs-document.md
---

# Print layout — company default vs document

Read `knowledge/print-layout-default-vs-document.md` only.

- `null` document mask → live company default at print.
- Non-null JSON on the invoice → frozen layout for that document.
- PATCH print-settings uses the same optimistic version pattern as the rest of the document.
