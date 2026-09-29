---
name: email-template-core
description: >
  @eristack/email-template renderEmailTemplate(template, vars, { escapeHtml? }) and
  extractTemplateKeys(template) — logic-free {{key}} substitution for tenant-editable
  transactional email (subject/html/text) rendered in an @eristack/outbox worker and sent
  via @eristack/comms. Missing keys render empty; validate against a per-message-type
  variable contract on save. Format money/dates in the app before passing vars.
metadata:
  author: eristack
  version: "0.1"
  type: core
  library: "@eristack/email-template"
sources:
  - packages/service/email-template/docs/getting-started.md
---

# @eristack/email-template

Flat `{{key}}` substitution. Safe for tenant-authored templates because there is no logic to execute.

```ts
import { renderEmailTemplate, extractTemplateKeys } from "@eristack/email-template";

extractTemplateKeys("{{invoice.number}} for {{ invoice.total }}");   // ["invoice.number","invoice.total"] sorted, unique
renderEmailTemplate(tpl.html, vars, { escapeHtml: true });            // escape VALUES for HTML bodies
renderEmailTemplate(tpl.text, vars);                                   // raw for text/subject
// keys: [\w.]+ — flat lookups, vars["invoice.total"]; missing → ""
```

## Checklist

1. Table `email_templates(tenant_id, message_type, locale, subject, html, text)` unique per triple.
2. Export a `MESSAGE_VARS[messageType]` contract; on save, reject `extractTemplateKeys(...)` keys not in it (they would render blank).
3. Build `vars` as **display strings**: `formatMoney` from `@eristack/money`, dates in recipient zone/locale, absolute URLs.
4. Render in the `@eristack/outbox` handler at send time; pass `msg.idempotencyKey` to `@eristack/comms` `send`.
5. `escapeHtml: true` only for `html`; never for `text`/`subject`.

## Do not

- Expect conditionals, loops, filters, or nested paths — precompute text in the app.
- Pass raw numbers/Money/Date objects in `vars` — strings only.
- Send from here — `@eristack/comms`.
