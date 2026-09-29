---
title: Getting started
---

# Getting started

```bash
pnpm add @eristack/email-template
```

```ts
import {
  extractTemplateKeys,
  renderEmailTemplate,
} from "@eristack/email-template";

const template = "Hello {{name}}, your order {{orderId}} shipped.";
extractTemplateKeys(template); // ["name", "orderId"]

const html = renderEmailTemplate(
  "<p>Hi {{name}}</p>",
  { name: "Ada" },
  { escapeHtml: true },
);
```

## Collaboration

Compose at the app boundary — no hard deps on `@eristack/comms` or `@eristack/person`:

1. Load person/contact data in your handler.
2. `renderEmailTemplate` with formatted strings (money amounts already formatted).
3. Pass body to `@eristack/comms` send API.

Recipe **`outbound-message-render`** lists the full pipeline (template → comms → optional PDF attachment via `@eristack/pdf-render`).
