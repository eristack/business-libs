---
title: Hashing & tamper
description: Canonical payload, SHA-256, verify vs check
sidebar_position: 4
---

# Hashing & tamper

## Canonical payload

`entryHash` is SHA-256 over a **stable JSON** serialization of the entry
**without** `entryHash` itself. Object keys are sorted recursively so key order
cannot hide edits.

Linked fields:

- Genesis: `prevHash = null`, `sequence = 1`
- Next: `prevHash = previous.entryHash`, `sequence = previous.sequence + 1`

## verify vs check

| API | On failure |
| --- | --- |
| `check(chainId)` | `{ ok: false, tampered: true, sequence, warnings }` |
| `verify(chainId)` | throws `ChainTamperedError` (includes `warnings`) |

Warnings call out `prevHash` mismatch, `entryHash` mismatch, sequence gaps, or
`chainId` drift. Each warning includes **entry id, index, sequence, and an
`entryHash` prefix** (e.g. `entry abc @ index 0 seq 1 hash 3fa9c1b2…`) so audits
pinpoint the broken row.

## What counts as tamper

- Editing any hashed field on a stored row
- Deleting / inserting / reordering rows in the middle
- Pointing `prevHash` at the wrong tip

## Operational practice

- Append-only writes in the app (no UPDATE of historical amounts).
- Period-end job: `verify` every active chain (or sample + high-value).
- If `check` fails: freeze postings, restore from backup, investigate who wrote
  outside the API.

## Browser demos

Site hero visualizations may use an in-process store **only inside the demo**
because the browser has no Postgres. Application code still defaults to Drizzle.
