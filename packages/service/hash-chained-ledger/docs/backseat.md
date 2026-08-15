---
title: Backseat adapter
description: Package-unique defaults — full guide is ai-knowledge upgrading §3
---

# Backseat adapter

**Canonical guide:** [Upgrading §3 Backseat](/docs/ai-knowledge/upgrading) · `@eristack/ai-knowledge#upgrading-eristack`.

| This package | Value |
| --- | --- |
| Imports | `@eristack/hash-chained-ledger/backseat`, `@eristack/hash-chained-ledger/backseat/store` |
| Factories | `createBackseatHashChainedLedgerStores()` / `createIndexedDbHashChainedLedgerStores({ dbName })` |
| Register | `registerHashChainedLedgerBackseat(api, { ledger?, basePath? })` |
| Default `basePath` | `/ledger` |
| Collections | `hashChainedLedger.entries` |
