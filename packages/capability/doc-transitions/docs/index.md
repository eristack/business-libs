---
title: "@eristack/doc-transitions"
description: Canonical ERP document status graphs for PBAC transition policies
sidebar_position: 1
---

# @eristack/doc-transitions

`@eristack/doc-transitions` ships **preset status vocabularies** for ERP documents — publication flows, approvals, journals, locks, and task lifecycles. It is **not** a BPM engine: no timers, swimlanes, or arbitrary workflow DSL.

## When to use it

Use this package when you need:

- A shared status vocabulary across invoices, journals, price lists, and tickets
- Transition tables compatible with `@eristack/pbac` `documents.transitions()`
- Action names that align with **`PATCH /:id/:action`** HTTP (`post`, `submit`, `approve`, …)
- Helpers to describe graphs, list allowed actions from a status, and register policies in one call

## What it is not

- **Not persistence** — your Drizzle tables own `status` columns and history
- **Not authorization alone** — register graphs on PBAC, then `authorize` in handlers
- **Not line-level math** — pair with `@eristack/qups`, `@eristack/money`, `@eristack/uom` for quantities and amounts

## Package shape

```text
@eristack/doc-transitions          core — presets, registerTransitionGraph, helpers
```

Framework-free core only. HTTP wiring lives in `@eristack/opinion`.

## Presets at a glance

| Preset | Typical documents |
| --- | --- |
| `publicationGraph` | Price lists, catalog entries, customer-facing drafts |
| `decisionGraph` | Purchase approvals, credit limits, expense reports |
| `outstandingGraph` | Support tickets, tasks, reminders |
| `journalGraph` | GL entries, inventory postings, stock movements |
| `lockGraph` | Fiscal periods, frozen documents, edit locks |

## Next steps

- [Getting started](./getting-started.md) — install, register on PBAC, first authorize
- [Concepts](./concepts.md) — graphs, tables, terminal statuses, policy ids
- [Presets reference](./presets-reference.md) — full state/action tables per preset
- [Wiring PBAC](./wiring-pbac.md) — register, authorize, custom graphs
- [Wiring HTTP](./wiring-http.md) — pair with `@eristack/opinion` PATCH routes
- [Gotchas](./gotchas.md) — terminal rows, empty action lists, status field names
- [Recipes](./recipes.md) — invoice publish, journal post, period lock
- [API reference](./api-reference.md) — exports cheat-sheet
