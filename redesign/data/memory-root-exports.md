# Memory factories on root `@eristack/*` entry (verified 2026-10-23)

**Task:** STAB-INV-3 · **Finding:** F-007

These packages export `createMemory*` from **`src/index.ts`** (main public surface):

| Package | Symbols |
| --- | --- |
| `@eristack/backseat` | `createMemoryBackseatStore` |
| `@eristack/comms` | `createMemoryCommsStore`, `createMemoryCommsDriver` |
| `@eristack/doc-number` | `createMemoryFormatStore`, `createMemorySequenceStore` |
| `@eristack/file-manager` | `createMemoryStorageDriver`, `createMemoryFileRecordStore`, … |
| `@eristack/jwt-auth` | `createMemoryRefreshTokenStore`, `createMemoryCredentialStore` |
| `@eristack/payment-manager` | `createMemoryPaymentDriver`, `createMemoryPaymentManagerStore` |
| `@eristack/qups` | `createMemoryPricingProfileStore`, `createMemoryPricingLineStore` |

**Migrated off root (STAB-MEM-2):** `@eristack/rbac`, `@eristack/epoch`, `@eristack/oauth` → `*/testing` only.

**Also on non-root paths (acceptable for backseat/tests):** `*/testing/index.ts`, `*/backseat/index.ts`, `hash-chained-ledger/core`, `idempotency/core`, `outbox/core`, `valuations/core`.

**Target (STAB-MEM-*):** move root exports to `@eristack/<pkg>/testing` only; changesets per package.
