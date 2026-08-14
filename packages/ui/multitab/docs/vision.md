---
title: Vision
description: Tab workspace behavior contract
---

# Vision

## Non-goals

- Replace TanStack Router — complement it with workspace-level tab state
- Ship opinionated pixel-perfect tab UI — headless core; you render shadcn or your design system
- Manage server data — tabs point at routes/forms; Query cache stays in the app

## Goals

1. **Open / focus / close** — predictable tab lifecycle with adjacent insert semantics.
2. **Dirty guards** — `closeGuard` on tabs + optional `beforeClose` on the router provider.
3. **Keyboard** — next/prev/close tab shortcuts (configurable in the app shell).
4. **Deep links** — URL reflects active tab without losing sibling tabs.

## Shipped in 0.1.0

- Core reducer + route sync + localStorage persistence
- React state provider and TanStack Router provider
- `createTabWorkspace` for headless hosts

## Later

- Optional max-tab policy helper
- Shared keyboard shortcut hook (app still owns rendering)
- Per-tab scroll restoration hooks (app serializers)
