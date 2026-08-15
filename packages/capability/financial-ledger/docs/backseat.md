---
title: Backseat adapter
description: Package-unique defaults — full guide is ai-knowledge upgrading §3
---

# Backseat adapter

**Canonical guide:** [Upgrading §3 Backseat](/docs/ai-knowledge/upgrading) · `@eristack/ai-knowledge#upgrading-eristack`.

| This package | Value |
| --- | --- |
| Imports | `@eristack/financial-ledger/backseat`, `@eristack/financial-ledger/backseat/store` |
| Factories | `createBackseatFinancialLedgerStores()` / `createIndexedDbFinancialLedgerStores({ dbName })` |
| Register | `registerFinancialLedgerBackseat(api, { financialLedger?, basePath? })` |
| Default `basePath` | `/financial-ledger` |
