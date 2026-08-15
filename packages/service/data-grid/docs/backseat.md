---
title: Backseat adapter
description: Package-unique defaults — full guide is ai-knowledge upgrading §3
---

# Backseat adapter

**Canonical guide:** [Upgrading §3 Backseat](/docs/ai-knowledge/upgrading) · `@eristack/ai-knowledge#upgrading-eristack`.

| This package | Value |
| --- | --- |
| Imports | `@eristack/data-grid/backseat`, `@eristack/data-grid/backseat/store` |
| Factories | `createBackseatDataGridContext()` / `createIndexedDbDataGridContext({ dbName })` — **no grid store** |
| Register | `registerDataGridBackseatRoute` / `registerDataGridBackseat({ routes })` — you supply list loaders |
