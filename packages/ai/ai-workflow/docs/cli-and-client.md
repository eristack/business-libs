---
title: CLI & client
description: eristack-workflow CLI and createWorkflowClient
sidebar_position: 7
---

# CLI & client

## CLI

```bash
pnpm eristack-workflow init
pnpm eristack-workflow status
pnpm eristack-workflow index [--no-embed]
pnpm eristack-workflow search <query>
pnpm eristack-workflow sprint create --title "…"
pnpm eristack-workflow sprint list
pnpm eristack-workflow sprint get [id]
pnpm eristack-workflow sprint summarize [id]
```

MCP bin: `eristack-workflow-mcp`.

## `createWorkflowClient(cwd?)`

```ts
import { createWorkflowClient } from "@eristack/ai-workflow";

const wf = createWorkflowClient(process.cwd());

wf.init();
wf.status();
await wf.reindex({ embed: true });
await wf.search("data-grid executeDrizzleList", 8);
wf.readChunk("packages/service/data-grid/docs/database.md", {
  startLine: 1,
  maxLines: 40,
});

wf.backlog.list();
wf.backlog.upsert({ title: "Ship docs", status: "open", priority: 1 });

wf.sprint.create("Docs depth", true);
wf.sprint.setActive(id);
wf.sprint.get(id);
wf.sprint.tasks.list(id);
wf.sprint.tasks.upsert(id, { title: "jwt-auth security page", status: "doing" });
wf.sprint.adr.create(id, "Docs are source of truth");
wf.sprint.summarize(id);
```

Same surface the MCP server uses — prefer MCP in interactive agents, client in scripts/tests.

## Exports of note

Also available: `formatSearchHits`, `compactJson` for low-token formatting in custom tools.
