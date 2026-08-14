---
title: Overview
description: Headless multi-tab ERP workspace
---

# @eristack/multitab

**Status: alpha (0.1.0)** — core tab engine ported from production ERP shell patterns.

## Problem

ERP operators live in **multi-document workflows**: compare a PO to a GR, keep an invoice open while checking stock. Browser tabs lose context; single-page apps without tab chrome feel cramped.

## Layers

| Entry | Use when |
| --- | --- |
| `@eristack/multitab` | Pure reducer, route sync, persistence — no React |
| `@eristack/multitab/react` | `MultitabProvider` — tab state + optional `localStorage` |
| `@eristack/multitab/react/tanstack` | `MultitabRouterProvider` — **URL is source of truth** with TanStack Router |

You own tab bar UI, keyboard shortcuts, and form dirty state; multitab owns tab identity, ordering, and navigation plans.

## URL model

- `/` — empty workspace (tabs may still exist; none active)
- `/new/{uuid}` — placeholder tab before the user picks a module
- `/module/...` — route tab; tab id equals normalized pathname

## Next

- [Getting started](./getting-started.md)
- [Architecture](./architecture.md)
- [API reference](./api-reference.md)
- [Vision](./vision.md)
