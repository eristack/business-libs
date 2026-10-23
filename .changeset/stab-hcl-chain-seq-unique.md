---
"@eristack/hash-chained-ledger": patch
---

Add UNIQUE (chain_id, sequence) on Drizzle entry tables and retry append on sequence contention. Existing apps must add `{prefix}_entries_chain_seq_uq` in a migration.
