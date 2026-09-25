---
name: ledger-first
description: >
  Ledger-first cashbook spine: financial-ledger + money + timestamp + fiscal-calendar +
  epoch per aggregate. Not qups/document-lines. Masters are CRUD not pbac documents.
metadata:
  type: core
  library: '@eristack/ai-knowledge'
  library_version: '0.1.3'
sources:
  - 'eristack/business-libs:packages/ai/ai-knowledge/knowledge/ledger-first.md'
---

# Ledger-first

Read `knowledge/ledger-first.md` only.

- Start from GL + journals — not `@eristack/qups` or `#document-lines-erp`.
- Masters (accounts, categories) = CRUD + epoch — not opinion PATCH actions or pbac on every PATCH.
- Bootstrap fiscal periods: `createCalendarYearCalendar`.
- Express 5: `mountExpressRest` from `@eristack/rest/express`.
