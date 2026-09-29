---
title: Overview
description: "{{var}} substitution for transactional email bodies with optional HTML escaping and key extraction — small enough to be safe for tenant-editable templates, paired with @eristack/comms."
---

# @eristack/email-template

Transactional email in an ERP is "Dear {{customer.name}}, invoice {{invoice.number}} for {{invoice.total}} is due {{invoice.dueDate}}". You want tenants to edit that text without shipping a template engine that can execute code. `@eristack/email-template` does the two things that need: **render** `{{key}}` placeholders from a flat map, and **extract** the keys a template uses so the UI can show which variables are available and which are missing.

## Use it when

- Tenant-editable subject/body templates for `@eristack/comms` sends.
- Rendering both an HTML body (escaped) and a text body (raw) from the same variables.
- Validating a saved template against the variables a message type provides.

## Not for

- Logic in templates (`{{#if}}`, loops, filters) — precompute in the app: build `vars` with the final strings, including formatted money and dates.
- MJML/React Email component layouts — render those to HTML first, then use this for the last-mile variables, or skip this entirely.
- Sending — `@eristack/comms`.
- Localization — pick the template per locale in the app; this renders one string.

## Install

```bash
pnpm add @eristack/email-template
```

No peers.

## 30-second example

```ts
import { renderEmailTemplate, extractTemplateKeys } from "@eristack/email-template";

const html = "<p>Dear {{ customer.name }},</p><p>Invoice {{invoice.number}} for {{invoice.total}} is due {{invoice.dueDate}}.</p>";

extractTemplateKeys(html);
// ["customer.name", "invoice.dueDate", "invoice.number", "invoice.total"]  (sorted, unique)

renderEmailTemplate(html, {
  "customer.name": "Acme <Ops>",
  "invoice.number": "INV-2026-0042",
  "invoice.total": "USD 1,250.00",
  "invoice.dueDate": "5 Oct 2026",
}, { escapeHtml: true });
// "<p>Dear Acme &lt;Ops&gt;,</p><p>Invoice INV-2026-0042 for USD 1,250.00 is due 5 Oct 2026.</p>"
```

## API

| Export | Signature | Notes |
| --- | --- | --- |
| `renderEmailTemplate` | `(template: string, vars: Record<string, string \| undefined>, options?: { escapeHtml?: boolean }) => string` | Replaces every `{{ key }}` (whitespace inside braces allowed). **Missing keys render as empty string** — no throw. `escapeHtml` (default `false`) escapes `& < > " '` in substituted values only, never in the template itself. |
| `extractTemplateKeys` | `(template: string) => string[]` | Unique, sorted. Keys match `[\w.]+` — letters, digits, `_`, `.`. |
| `RenderEmailTemplateOptions` | `{ escapeHtml?: boolean }` | |

Placeholder grammar: `\{\{\s*([\w.]+)\s*\}\}`. Dots are just characters — `invoice.total` is one flat key, not a path into an object. Flatten your data before calling.

## Works with

- `@eristack/comms` — `commsHub.send({ channel: "email", to, subject: renderEmailTemplate(subjectTpl, vars), html, text })`.
- `@eristack/money` — format amounts with `formatMoney` **before** putting them in `vars`; templates never see raw numbers.
- `@eristack/timestamp` — format dates in the recipient's zone first, same reason.
- `@eristack/outbox` — enqueue `{ templateId, vars }` in the domain transaction; the worker renders + sends.

## For agents

- Skill: `pnpm dlx @tanstack/intent@latest load @eristack/email-template#email-template-core`
- Recipes: `email-template-render`, `outbound-message-render`.

## Next

- [Getting started](./getting-started.md) — template table, variable contracts per message type, HTML vs text rendering, and the outbox worker.
