# Tonight — one session plan + execution

> **Rule:** Vision → [overview.md](./overview.md) + [backlog.md](./backlog.md). **Only this file is the execution schedule.**

---

## North star (survives beyond tonight)

Agents can run **PO → GR → stock verify** with existing 0.x packages. Feature modules stay backlog until that demo exists.

---

## Tonight definition of done

| # | Deliverable | Status |
| --- | --- | --- |
| T1 | Hash-chain **recipe** + doc note | done |
| T2 | **Integration tests** (hash-chain + stock) | done (+5 tests) |
| T3 | **`idempotencyKey`** on stock append | done |
| T4 | **PBAC cookbook** | done → `knowledge/pbac-transitions.md` |
| T5 | **Recipes** batch | done → hash-chain-audit, ai-workflow-memory, procurement-spine |
| T6 | **`examples/erp-spine`** skeleton | done |
| T7 | Roadmap split (vision vs tonight) | done |

**Not tonight:** `@eristack/rest`, new packages, feature-*, hono/prisma, full ledger hardening.

---

## Next session (pick one from backlog)

1. financial-ledger `trialBalance` + tests  
2. jwt-auth `./zod`  
3. Grow `examples/erp-spine` → Express + Drizzle PO/GR tables  
4. `@eristack/rest` scaffold  

See [backlog.md](./backlog.md) for full priority order — no calendar.

---

## Verify locally

```bash
pnpm --filter @eristack/stock-movement test
pnpm --filter @eristack/hash-chained-ledger test
cd examples/erp-spine && ../../packages/capability/stock-movement/node_modules/.bin/vitest run --config ../../packages/capability/stock-movement/vitest.config.ts
pnpm --filter @eristack/ai-knowledge sync && pnpm knowledge:check
```

After `pnpm install` at repo root, `@eristack/example-erp-spine test` works via workspace vitest.
