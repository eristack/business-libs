---
name: tiga-sekawan-3ss-adoption
description: >
  Consumer checklist for batch 3ss platform seams: map A1–B11 rows to @eristack packages, migration
  order, and Tiga Sekawan file paths. Use in the consumer app after business-libs releases — not for
  new library APIs.
metadata:
  author: eristack
  version: "0.1"
  type: core
  library: "@eristack/ai-knowledge"
sources:
  - packages/ai/ai-knowledge/knowledge/tiga-sekawan-3ss-adoption.md
---

# 3ss consumer adoption

1. Load `#document-lines-erp` first.
2. Follow migration order in the guide (feedback/errors → auth/epoch/save → domain UI → drizzle → B4 mirror).
3. Do not add `@eristack/feature-*` or move partner/job types into Eristack.

Ticket source: `tickets/20261014-203500-suggestion-consumer-platform-seams-tiga-sekawan.md`.
