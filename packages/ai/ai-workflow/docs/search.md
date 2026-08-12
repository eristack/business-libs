---
title: Search & index
description: FTS5, on-device embeddings, RRF fusion, and CI without embeds
sidebar_position: 5
---

# Search & index

## Hybrid ranking

The index combines:

1. **FTS5** lexical search over chunked project files  
2. Optional **on-device embeddings** (MiniLM-style; configured via `embedModel`)  
3. **RRF** (reciprocal rank fusion) to merge rankings  

If the DB has **no vectors**, search skips embedding load (important for Linux CI / `--no-embed` indexes).

## Reindex

```bash
pnpm eristack-workflow index
pnpm eristack-workflow index --no-embed
```

MCP: `index_reindex({ embed?: boolean })`.

Indexing is incremental (content hash). Crawl uses `roots` / `ignore` from config.

## Limits

| Knob | Default / max |
| --- | --- |
| Hit limit | max **8** |
| Snippet | ≤ **3** lines |
| `read_chunk` maxLines | max **120** (default ~80) |

## CI guidance

- Prefer `--no-embed` in CI to avoid model download and native sharp issues  
- Commit workflow markdown you care about; keep `workflow.sqlite` gitignored  
- Reindex locally after large refactors before expecting search hits  

## Troubleshooting

| Symptom | Likely cause |
| --- | --- |
| Empty search | Never indexed / wrong cwd |
| Slow first index | Embedding model download |
| Embed errors in CI | Use `--no-embed` |
| Stale hits | Run `index` again |

See also [Concepts](./concepts.md) for when to search vs load Intent skills.
