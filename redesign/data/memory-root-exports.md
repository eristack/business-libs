# Memory factories on root `@eristack/*` entry (verified 2026-10-23)

**Task:** STAB-INV-3 · **Finding:** F-007 — **closed** (STAB-MEM-2 complete)

No packages export `createMemory*` (or `memoryPutViaPresignedUrl`) from **`src/index.ts`** on the main public surface. CI: `node scripts/check-memory-root-exports.mjs --ci` with an **empty allowlist**.

**Migrated off root (STAB-MEM-2):** `@eristack/rbac`, `@eristack/epoch`, `@eristack/oauth`, `@eristack/comms`, `@eristack/jwt-auth`, `@eristack/doc-number`, `@eristack/payment-manager`, `@eristack/qups`, `@eristack/file-manager`, `@eristack/backseat` → `@eristack/<pkg>/testing` (spine `./backseat` adapters import memory store from `@eristack/backseat/testing`).

**Also on non-root paths (acceptable):** `*/testing/index.ts`, `*/backseat/index.ts`, internal `core/` memory modules, `hash-chained-ledger/core`, `idempotency/core`, `outbox/core`, `valuations/core`.

**Policy:** production and shared deploys use Drizzle/DB (or IndexedDB for browser Backseat); memory helpers are tests, workshops, and local scratch only.
