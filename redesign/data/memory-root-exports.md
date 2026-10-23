# Memory factories on root `@eristack/*` entry (verified 2026-10-23)

**Task:** STAB-INV-3 · **Finding:** F-007

These packages export `createMemory*` from **`src/index.ts`** (main public surface):

| Package | Symbols |
| --- | --- |
| `@eristack/backseat` | `createMemoryBackseatStore` |
| `@eristack/file-manager` | `createMemoryStorageDriver`, `createMemoryFileRecordStore`, … |

**Migrated off root (STAB-MEM-2):** `@eristack/rbac`, `@eristack/epoch`, `@eristack/oauth`, `@eristack/comms`, `@eristack/jwt-auth`, `@eristack/doc-number`, `@eristack/payment-manager`, `@eristack/qups` → `*/testing` only.

**Also on non-root paths (acceptable for backseat/tests):** `*/testing/index.ts`, `*/backseat/index.ts`, `hash-chained-ledger/core`, `idempotency/core`, `outbox/core`, `valuations/core`.

**Target (STAB-MEM-*):** move root exports to `@eristack/<pkg>/testing` only; changesets per package.
