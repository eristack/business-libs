---
name: party-and-platform-compose
description: >
  Wave 13 compose-at-the-boundary: party normalizers, measures, finance posting,
  platform API guard order, outbound template/PDF/spreadsheet export. No sibling hard
  deps in primitives. Use before scaffolding person, entity-id, tax, idempotency, etc.
metadata:
  type: core
sources:
  - 'eristack/business-libs:packages/ai/ai-knowledge/knowledge/party-and-platform-compose.md'
---

# Party and platform compose

Load **one file**: `knowledge/party-and-platform-compose.md`.

## When to load

| Ask | Action |
| --- | --- |
| Contact/person/phone/email normalize chain | Party pipeline section + handler snippet |
| entity-id, business-calendar, tax, rounding | Finance/posting section |
| Idempotency + API key + rate limit order | Platform API edge section |
| Export xlsx/csv or PDF invoice | Outbound content section |
| Which package to ship next | Macro order + `roadmap/horizon.md` Wave 13 |

## Rules (short)

- **One npm package per PR** — full docs, skill, recipe, tests, changeset on ship.
- **Compose in app** — optional `@eristack/contact/compose` peers only when documented.
- **Map first:** `#package-relationships` for shipped spine; this skill for **planned** Wave 13 pipelines.

Do not batch-scaffold all Wave 13 packages in one pass.
