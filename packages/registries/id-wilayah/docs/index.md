---
title: Indonesia administrative divisions
description: Official numeric admin codes, bundled national registry, and unit kinds through neighborhood level.
---

# @eristack/id-wilayah

Registry package for **Indonesia Ministry of Home Affairs–style numeric codes** (province → regency/city → district → village) and an English **government unit kind** taxonomy that also covers **hamlet**, **community block**, and **neighborhood** levels that are not in the mandatory national registry.

| Export | Use |
| --- | --- |
| `@eristack/id-wilayah` | Normalize codes, parse hierarchy, in-memory registry, sub-village local ids |
| `@eristack/id-wilayah/bundled` | Node loader for the Apr 2024 gzip snapshot (~84k villages) |
| `@eristack/id-wilayah/zod` | Optional Zod 4 — `adminDivisionCodeSchema`, `idAdminUnitKindSchema` |

Pair with `@eristack/iso-3166` (`ID` country) and `@eristack/address` for postal shape — store **codes** in SQL, labels in app i18n.

Start with [Getting started](./getting-started.md).
