# Brainstorm rules (post–Features-layer reset)

**Date:** 2026-08-29 · Applies to `catalog-wave2.md`, `improvements-all-packages.md`, and future catalog rows.

## Do brainstorm

| OK | Examples |
| --- | --- |
| **Horizontal** primitives, capabilities, services, infra, UI, AI | `@eristack/uom`, `@eristack/opinion`, `@eristack/doc-shell` |
| **Improve shipped packages** | More adapters, tests, exports consumers copy, `/testing` subpaths |
| **Capability “refs”** not vertical modules | `@eristack/partner` (IDs + roles), `@eristack/item-ref` — apps own tables |
| **Infrastructure spine** | logger, rest, seed-pack, contract-test |
| **Agent tooling** | ai-recipe-author, ai-schema-draft |

## Do not brainstorm as near-term npm work

| Avoid | Instead |
| --- | --- |
| `@eristack/feature-procurement`, `feature-sales`, … | App-owned documents + `#document-lines-erp` |
| Procure-to-pay priority stacks | `roadmap/features.md` gates only |
| “Ship PO module Q3” language | “Capability X unblocks apps that model orders themselves” |

Layer **06 Features** on the site = **reserved empty floor**. New names go in layers **01–05** and **07 AI** unless explicitly marked `reject` or `feature-layer-distant`.

## Improvement priority (all shipped packages)

1. **Reliability** — Drizzle integration tests, adversarial cases, verify/snapshot paths  
2. **Predictability** — same core in forms + API; string-first; exported validators/constants  
3. **Cheap tokens** — one canonical doc + one skill source; wiring-production where adapters multiply  
4. **Clear boundaries** — export what apps would copy; `/testing` for memory stores  

## Promotion path (unchanged)

`catalog-wave2` row → debate → `roadmap/horizon.md` → `priorities.md` → scaffold PR.  
Improvement row → package audit backlog or sprint ticket → ship in 0.x.

## Density target (this wave)

- **≥50** new package name rows in [catalog-wave2.md](./catalog-wave2.md)  
- **≥5** improvement themes per shipped `@eristack/*` in [improvements-all-packages.md](./improvements-all-packages.md)
