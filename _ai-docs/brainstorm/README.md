# Brainstorm — package names & improvements

**Sandbox only.** Not shipped, not in `roadmap/`, not npm truth.

## Files

| File | Purpose |
| --- | --- |
| [rules.md](./rules.md) | Post–Features-layer brainstorm rules |
| [catalog.md](./catalog.md) | **193** `@eristack/*` name drafts (original) |
| [catalog-wave2.md](./catalog-wave2.md) | **107** new drafts (#214–#320) |
| [improvements.md](./improvements.md) | **~120** improvement themes × **20 shipped** packages |
| [by-domain.md](./by-domain.md) | Grouped by compose-spine domain |

## vs other docs

| Doc | Role |
| --- | --- |
| **`_ai-docs/brainstorm/`** (here) | Brainstorm superset — quantity OK, duplicates OK |
| `roadmap/horizon.md` | Curated shortlist — human-approved only |
| `roadmap/features.md` | Layer 06 gates — not a package catalog |
| `roadmap/priorities.md` | What we actually build next |
| `packages/*` | Shipped npm packages only |
| `_ai-docs/audit/` | Quality snapshot — not naming |

## Principles

1. **Quantity over commitment** — many rows merge, split, or die.
2. **One sharp job** — same design targets as shipped packages (cheap tokens, Drizzle-default).
3. **Horizontal only** — layer 06 Features is under construction; `feature-*` → `reject` unless distant.
4. **String-first** — money, qty, rates, dates follow primitive rules.

## Layers (placement)

| # | Layer | Draft focus |
| ---: | --- | --- |
| 01 | Primitive | IDs, codes, pure values |
| 02 | Capability | Composable business rules |
| 03 | Service | Auth, lists, jobs, integration |
| 04 | Infrastructure | Loggers, mocks, mounts |
| 05 | UI | Headless React + design-system |
| 06 | Features | **Empty on npm** — see `roadmap/features.md` |
| 07 | AI | Skills, MCP, codegen |

## Wave 2 highlights (2026-08-29)

| Metric | Count |
| --- | ---: |
| Name drafts (catalog + wave2) | **~300** |
| Shipped packages with improvement rows | **20/20** |
| Prior audit sprint backlog | **69** → [../audit/improvement-backlog.md](../audit/improvement-backlog.md) |

### Top 10 package ideas

| Rank | Package | Layer | Unblocks |
| ---: | --- | --- | --- |
| 1 | `@eristack/opinion` | Service | REST canon, OpenAPI |
| 2 | `@eristack/logger` | Infrastructure | Production ops |
| 3 | `@eristack/doc-transitions` | Capability | pbac preset graphs |
| 4 | `@eristack/uom` | Primitive | Qty conversion with qups |
| 5 | `@eristack/rest` | Infrastructure | Mount routes on Express/Nest |
| 6 | `@eristack/seed-pack` | Infrastructure | Backseat demos |
| 7 | `@eristack/design-system` | UI | doc-shell, money-input |
| 8 | `@eristack/idempotency` | Service | Safe POST retries |
| 9 | `@eristack/form-kit` | UI | TanStack Form + opinion |
| 10 | `@eristack/ai-domain-document-lines` | AI | Agent pack for header+lines |

### Top 10 cross-package improvements

| Rank | Theme |
| ---: | --- |
| 1 | Drizzle integration harness everywhere |
| 2 | wiring-production canonical docs |
| 3 | Backseat list executor + atomic writes |
| 4 | 409 / http-errors envelope parity |
| 5 | Zod 4 export parity |
| 6 | `testing` subpath deprecation path |
| 7 | Supertest E2E golden paths |
| 8 | Horizon-a → Nest parity example |
| 9 | ai-dev integration + publish profiles |
| 10 | Recipe trigger coverage |

## Status key (catalog columns)

| Status | Meaning |
| --- | --- |
| `idea` | Name + one-liner |
| `sketch` | API shape in horizon or notes |
| `shipped` | On npm (listed for completeness) |
| `reject` | Parked — do not promote without new evidence |

## Promotion (human)

1. Pick row → debate → add to `roadmap/horizon.md`
2. Horizon → `roadmap/priorities.md` or `backlog.md` when sequenced
3. Priority → scaffold `packages/<layer>/<name>/` + changeset + recipe

**Explicit non-goals:** vertical `@eristack/feature-*` modules, PO→GR priority stacks, npm without horizon → priorities path.
