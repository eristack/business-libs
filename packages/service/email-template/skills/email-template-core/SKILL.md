---
name: email-template-core
description: >
  @eristack/email-template renderEmailTemplate and extractTemplateKeys — Wave 13 C1.
metadata:
  author: eristack
  version: "0.0"
sources:
  - packages/service/email-template/docs/getting-started.md
---

# @eristack/email-template

Use `extractTemplateKeys` to validate required vars before send. HTML bodies: `renderEmailTemplate(..., { escapeHtml: true })`. Pair with `@eristack/comms` in the app — no SMTP in this package.
