---
title: Concepts
description: Project memory vs Intent vs git — when to search, read, or load skills
sidebar_position: 2
---

# Concepts

## Three layers of agent context

| Layer | Job |
| --- | --- |
| **Intent skills** (`ai-knowledge` + package skills) | How to use `@eristack/*` and the canon stack |
| **ai-workflow** (this package) | What *this repo* decided, searched, and planned recently |
| **git** | What actually shipped |

Do not dump full files into the prompt when a search hit + `read_chunk` will do. Do not use workflow search as a substitute for loading jwt-auth/money skills.

## Compact by default

MCP tools and CLI search are intentionally lossy:

- Hits carry **path**, line range, score, short snippet  
- Sprint/backlog tools return **ids and statuses**  
- Full prose lives on disk — open it when needed  

That keeps long agent sessions under control.

## Search vs read vs skill load

| Need | Tool |
| --- | --- |
| “Where did we document refresh reuse?” | `search` → `read_chunk` |
| “How do I call createJwtAuth?” | Intent `load @eristack/jwt-auth#…` |
| “What’s the active sprint?” | `workflow_status` / `sprint_get` |
| “Record an architecture decision” | `adr_create` |

## Config

`.eristack/workflow/config.json` holds `roots`, `ignore`, `embedModel`, `activeSprintId`. The index DB path is under `.eristack/index/` and should stay gitignored.
