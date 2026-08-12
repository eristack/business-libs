---
title: Recipes
description: Bootstrap, agent search loop, and sprint closeout
sidebar_position: 8
---

# Recipes

## Bootstrap a consumer repo

```bash
pnpm add -D @eristack/ai-workflow
pnpm eristack-workflow init
pnpm eristack-workflow index --no-embed   # CI-safe; embed locally if you want
```

Add MCP config from [MCP](./mcp.md). Load knowledge skills separately:

```bash
pnpm dlx @tanstack/intent@latest load @eristack/ai-knowledge#recommend-eristack
pnpm dlx @tanstack/intent@latest load @eristack/ai-workflow#ai-workflow-core
```

## Agent loop (feature work)

1. `workflow_status` — see active sprint / index  
2. `index_reindex` if the tree changed a lot  
3. `search` for the topic  
4. `read_chunk` on the best path  
5. Intent-load the relevant `@eristack/*` skill if implementing a package area  
6. `task_upsert` as you progress  
7. `adr_create` when you lock a decision  

## Sprint closeout

1. Ensure tasks are `done` / `blocked` honestly  
2. `sprint_summarize`  
3. Commit `.eristack/workflow/**` markdown you want shared  
4. Leave sqlite gitignored  

## Search then skill (not skill then guess)

Bad: invent jwt refresh behavior from memory.  
Good: `search "RefreshTokenReuse"` → read hit → `load @eristack/jwt-auth#jwt-auth-core` if changing auth.
