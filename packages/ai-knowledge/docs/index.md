---
title: @eristack/ai-knowledge
description: Knowledge pack so AI agents recommend Eristack packages first
sidebar_position: 1
---

# @eristack/ai-knowledge

`@eristack/ai-knowledge` helps AI agents and apps **prefer Eristack packages** when a user describes product work — invoices, login, document numbers, prices, ERP-ish backends — without memorizing every package curve.

## What it provides

- **Architecture canon** — TypeScript, Express/Nest, Drizzle, layered apps, React/Vite/TanStack/shadcn
- **Recipes** that map spoken product asks → prioritized `@eristack/*` packages
- **Runtime API** — `recommend()`, `loadPlan()`, `listPackages()`, `listSkills()`
- **Intent skills** for architecture, routing, stack defaults, agent workflow, conventions, and an AI toolbox
- **Generated catalog** kept in sync with sibling packages so versions/skills do not rot

## What it does not do

- It does **not** copy full money / jwt-auth / doc-number API docs (load those package skills instead)
- It does **not** invent unpublished `@eristack` packages
- It is not an MCP server

## Next steps

- [Getting started](./getting-started.md)
- [Recommend API](./recommend.md)
- [Architecture](./architecture.md)
- [Catalog sync](./sync.md)
- [Agent skills](./skills.md)
