---
title: Search & index
description: Local FTS + vector hybrid search
sidebar_position: 4
---

# Search & index

| Layer | Implementation |
| --- | --- |
| Lexical | SQLite FTS5 (BM25) |
| Vector | `@xenova/transformers` `all-MiniLM-L6-v2` |
| Fusion | Reciprocal rank fusion |
| Store | `.eristack/index/workflow.sqlite` |

Defaults: **8** hits, **3-line** snippets, incremental reindex by content hash.

Search loads the embedding model only when the index already has vectors. After `index --no-embed` (or CI FTS smoke tests), search stays FTS-only and does not pull in `@xenova/transformers` / `sharp`.

Ignore globs live in `.eristack/workflow/config.json` (`ignore`, `roots`, `embedModel`).
