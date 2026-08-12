---
title: Format DSL
description: Token patterns, padding, and reset periods
sidebar_position: 3
---

# Format DSL

Patterns are strings with literals and tokens:

| Token | Meaning |
| --- | --- |
| `{YYYY}` | 4-digit UTC year |
| `{YY}` | 2-digit UTC year |
| `{MM}` | 2-digit UTC month |
| `{DD}` | 2-digit UTC day |
| `{SEQ}` | sequence, width 1 (no padding) |
| `{SEQ:n}` | sequence zero-padded to width `n` (1–32) |

Example: `INV-{YYYY}{MM}-{SEQ:5}` → `INV-202608-00042`.

Rules:

- Exactly one `SEQ` token is required.
- Unknown `{…}` tokens are rejected.
- Literals outside braces are copied as-is (e.g. `INV-`, `/`).

## Reset periods

Sequence rows are keyed by `(formatId, periodKey)`:

| `reset` | `periodKey` example |
| --- | --- |
| `never` | `*` |
| `yearly` | `2026` |
| `monthly` | `2026-08` |
| `daily` | `2026-08-11` |

Buckets use **UTC** calendar parts from the supplied `at` / clock.

## Optional prefix

`FormatRecord.prefix` is prepended to the rendered value (not part of the token pattern).
