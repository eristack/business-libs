---
title: Getting started
description: Init, index, and first search
sidebar_position: 2
---

# Getting started

```bash
pnpm add -D @eristack/ai-workflow
pnpm eristack-workflow init
pnpm eristack-workflow index
pnpm eristack-workflow search "login refresh"
```

`init` creates `.eristack/workflow/` and appends `.eristack/index/` to `.gitignore` when present.

First `index` may download the local embedding model (`Xenova/all-MiniLM-L6-v2`). Use `--no-embed` for FTS-only smoke tests.

Programmatic API:

```ts
import { createWorkflowClient } from "@eristack/ai-workflow";

const wf = createWorkflowClient();
await wf.reindex();
const hits = await wf.search("allocate money");
```
