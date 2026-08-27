---
name: document-lines-erp
description: >
  Document-with-lines ERP spine: header + QUPS lines + doc-number + pbac +
  data-grid + backseat — not stock/GL. Partner masters app-owned until
  feature-partner ships.
metadata:
  type: core
  library: '@eristack/ai-knowledge'
  library_version: '0.1.3'
sources:
  - 'eristack/business-libs:packages/ai/ai-knowledge/knowledge/document-lines-erp.md'
---

# Document-with-lines ERP

Load once: `knowledge/document-lines-erp.md`. For mockup → backend also load `#backseat-then-backend`.

## Spine packages

qups, money, doc-number, data-grid, pbac, rbac, abac, backseat, timestamp, epoch.

**Not default:** stock-movement, valuations, financial-ledger, `@eristack/feature-*`.

## App-owned

Partner, product/charge masters, job/cost sheet/invoice tables.
