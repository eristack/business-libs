---
title: Getting started
description: Store tenant templates, declare the variable contract per message type, validate on save with extractTemplateKeys, and render HTML + text in an outbox worker that hands off to @eristack/comms.
---

# Getting started

## Install

```bash
pnpm add @eristack/email-template @eristack/comms @eristack/money
```

## Template table (app-owned)

```ts
import { pgTable, text, uniqueIndex } from "drizzle-orm/pg-core";

export const emailTemplates = pgTable(
  "email_templates",
  {
    id: entityIdColumn("pgsql", "id").primaryKey(),
    tenantId: text("tenant_id").notNull(),
    messageType: text("message_type").notNull(),    // "invoice.issued" | "po.approved" | …
    locale: text("locale").notNull().default("en"),
    subject: text("subject").notNull(),             // "{{invoice.number}} from {{company.name}}"
    html: text("html").notNull(),
    text: text("text").notNull(),
  },
  (t) => [uniqueIndex("email_templates_uq").on(t.tenantId, t.messageType, t.locale)],
);
```

## Declare what each message type provides

The variable contract is code, not data — it is what your domain can actually supply. Export it so the editor UI and the validator use the same list:

```ts
// message-types.ts
export const MESSAGE_VARS = {
  "invoice.issued": [
    "company.name", "customer.name", "invoice.number", "invoice.total", "invoice.dueDate", "invoice.url",
  ],
  "po.approved": ["company.name", "supplier.name", "po.number", "po.total", "po.url"],
} as const satisfies Record<string, readonly string[]>;
```

## Validate on save

```ts
import { extractTemplateKeys } from "@eristack/email-template";

app.put("/settings/email-templates/:messageType", async (req, res) => {
  const allowed = new Set(MESSAGE_VARS[req.params.messageType] ?? []);
  const used = new Set([
    ...extractTemplateKeys(req.body.subject),
    ...extractTemplateKeys(req.body.html),
    ...extractTemplateKeys(req.body.text),
  ]);
  const unknown = [...used].filter((k) => !allowed.has(k));
  if (unknown.length) {
    return res.status(400).json({ error: "UNKNOWN_TEMPLATE_VARS", unknown, allowed: [...allowed] });
  }
  await upsertTemplate(req.tenantId, req.params.messageType, req.body);
  res.status(204).end();
});
```

Unknown keys would silently render as empty strings in production — catching them at save time is the whole reason `extractTemplateKeys` exists.

## Build `vars` with final strings

Templates receive **display strings**. Money, dates, and URLs are formatted in the app, once:

```ts
import { formatMoney, Money } from "@eristack/money";

function invoiceIssuedVars(invoice: Invoice, customer: Customer, company: Company): Record<string, string> {
  return {
    "company.name": company.name,
    "customer.name": customer.displayName,
    "invoice.number": invoice.number,
    "invoice.total": formatMoney(Money.fromJSON(invoice.total), customer.locale),
    "invoice.dueDate": formatWallDate(invoice.dueDate, customer.locale),
    "invoice.url": `${company.portalUrl}/invoices/${invoice.id}`,
  };
}
```

## Render and send (outbox worker)

Enqueue the *intent* in the same transaction as the domain change; render at send time so template edits apply to queued messages:

```ts
import { renderEmailTemplate } from "@eristack/email-template";

const handlers = {
  "email.invoice.issued": async (msg) => {
    const { invoiceId, to } = JSON.parse(msg.payloadJson);
    const { invoice, customer, company } = await loadInvoiceContext(invoiceId);
    const tpl = await loadTemplate(company.tenantId, "invoice.issued", customer.locale);
    const vars = invoiceIssuedVars(invoice, customer, company);

    await comms.send({
      channel: "email",
      to,
      subject: renderEmailTemplate(tpl.subject, vars),                       // plain text, no escaping
      html: renderEmailTemplate(tpl.html, vars, { escapeHtml: true }),       // escape user data in HTML
      text: renderEmailTemplate(tpl.text, vars),
      idempotencyKey: msg.idempotencyKey,                                     // outbox key flows through
    });
  },
};

await outbox.processBatch(50, handlers);
```

## Gotchas

- **Missing keys render as `""`**, silently. Validate templates against the contract on save; in the worker, assert `extractTemplateKeys(tpl).every(k => k in vars)` if you want a hard failure.
- `escapeHtml` escapes **values**, not the template. Template authors can still write raw HTML (that is the point); values from customers cannot inject markup. Never enable it for the `text` body — you would ship `&amp;` to plain-text readers.
- Keys are flat. `{{invoice.total}}` looks up `vars["invoice.total"]`, not `vars.invoice.total`. Flatten nested objects yourself.
- Only `[\w.]` in keys — `{{invoice-total}}` or `{{items[0]}}` are not placeholders and are left untouched in the output.
- `{{ key }}` with inner spaces is fine; `{ {key} }` is not.
- No conditionals: if a section is optional, prepare two templates or compute the section's text in the app and pass it as a variable.

## Testing

```ts
import { renderEmailTemplate, extractTemplateKeys } from "@eristack/email-template";
import { expect, it } from "vitest";

it("escapes values only in html mode", () => {
  const tpl = "<b>{{ name }}</b>";
  expect(renderEmailTemplate(tpl, { name: "<x>" }, { escapeHtml: true })).toBe("<b>&lt;x&gt;</b>");
  expect(renderEmailTemplate(tpl, { name: "<x>" })).toBe("<b><x></b>");
});

it("lists keys once, sorted, and blanks missing ones", () => {
  expect(extractTemplateKeys("{{b}} {{a}} {{b}}")).toEqual(["a", "b"]);
  expect(renderEmailTemplate("Hi {{who}}!", {})).toBe("Hi !");
});
```
