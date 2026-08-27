---
title: Format DSL
description: Tokens, padding, validation rules, and parse semantics
sidebar_position: 4
---

# Format DSL

A pattern is a string. Anything inside `{…}` is a token; everything else is a literal copied verbatim.

```
INV-{YYYY}{MM}-{SEQ:5}   →   INV-202608-00042
```

## Tokens

| Token | Renders | Source |
| --- | --- | --- |
| `{YYYY}` | 4-digit year — `2026` | Calendar parts of `at` (UTC default; format `timezone` when set) |
| `{YY}` | 2-digit year — `26` | Same |
| `{MM}` | 2-digit month, zero-padded — `08` | Same |
| `{DD}` | 2-digit day, zero-padded — `11` | Same |
| `{SCOPE}` | Branch/location segment — `SUB` | `next({ scope })`; slashes → `-` |
| `{SEQ}` | Sequence with no padding — `42` | The allocated integer |
| `{SEQ:n}` | Sequence zero-padded to width `n` — `00042` | The allocated integer |

`n` must be an integer from **1 to 32**. Anything else throws `InvalidPatternError`.

Padding is a *minimum*, not a cap. `{SEQ:3}` renders `042` at 42 and `1234` at 1234 — the number is never truncated. Pick a width your series will not outgrow within one period, then let it overflow gracefully rather than wrap.

## Literals

Anything outside braces is copied as-is: `INV-`, `/`, `.`, spaces, unicode.

```ts
formatDocumentNumber({ pattern: "ACME/{YYYY}/PO/{SEQ:4}", sequence: 7, at });
// → "ACME/2026/PO/0007"
```

There is no escape syntax for a literal `{`. If you genuinely need braces in the output, they belong in the record's `prefix` or in code that wraps the value.

## Validation rules

`parsePattern` runs on every `formatDocumentNumber`, `parseDocumentNumber`, `registerFormat`, and on `updateFormat` when a pattern is supplied. It throws `InvalidPatternError` (`code: "INVALID_PATTERN"`) when:

| Rule | Rejected example | Message shape |
| --- | --- | --- |
| Pattern must be a non-empty string | `""` | *Pattern must be a non-empty string* |
| Every `{…}` must be a known token | `INV-{BRANCH}-{SEQ:3}` | *Pattern contains unknown or malformed tokens* |
| Braces must be well-formed | `INV-{SEQ:3` | *…unknown or malformed tokens* |
| At least one SEQ token | `INV-{YYYY}` | *Pattern must include a `{SEQ}` or `{SEQ:n}` token* |
| **Exactly** one SEQ token | `{SEQ}-{SEQ:3}` | *Pattern must include exactly one SEQ token* |
| SEQ width in range | `{SEQ:0}`, `{SEQ:64}` | *Invalid SEQ width …; expected 1–32* |

The one-SEQ rule is what makes numbers reversible: with two counters in a string there is no way to parse a value back, and no single integer to allocate.

`padSequence` additionally rejects negative or non-integer sequences with the same error class, so `formatDocumentNumber({ …, sequence: -1 })` fails loudly rather than emitting `-1`.

> **Validate user input before saving.** In a settings form, call the pattern through preview (`docNumber.preview({ pattern, sequence: 1 })`) and surface `InvalidPatternError.message` next to the field. The REST adapter already maps it to `400` — see [HTTP & UI](./http-and-ui.md).

## Rendering

```ts
import { formatDocumentNumber } from "@eristack/doc-number";

formatDocumentNumber({
  pattern: "INV-{YY}{MM}{DD}-{SEQ:4}",
  sequence: 3,
  at: new Date("2026-08-11T00:00:00.000Z"),
});
// → "INV-260811-0003"
```

`at` is optional and defaults to *now*. Date tokens use **UTC** unless the format (or `next({ timezone })`) sets an IANA zone. Pass `at` explicitly in tests and backfills. See [Sequencing — IANA timezone](./sequencing.md#iana-timezone-optional).

`previewDocumentNumber` is the same function under a name that reads better in settings screens; `docNumber.preview(input)` is the bound version on the API object.

## Parsing

`parseDocumentNumber(pattern, value)` compiles the pattern into an anchored regex and pulls the parts back out:

```ts
parseDocumentNumber("INV-{YYYY}{MM}-{SEQ:5}", "INV-202608-00042");
// → { sequence: 42, parts: { YYYY: "2026", MM: "08", SEQ: "00042" } }
```

How each token matches:

| Token | Regex | Notes |
| --- | --- | --- |
| Literal | Escaped exactly | Regex metacharacters are escaped for you |
| `{YYYY}` | `(\d{4})` | Captured as a string |
| `{YY}` / `{MM}` / `{DD}` | `(\d{2})` | Captured as strings, padding preserved |
| `{SEQ}` (width 1) | `(\d+)` | Greedy |
| `{SEQ:n}` (n > 1) | `(\d{n,})` | At least `n` digits, so overflowed sequences still parse |

`parts` holds the **raw captured text**, keyed by token name; `sequence` is the SEQ capture as a number.

### When parsing fails

`ParseMismatchError` (`code: "PARSE_MISMATCH"`) is thrown when:

- the value does not match the pattern end-to-end (the regex is anchored with `^`/`$`)
- the SEQ segment is shorter than the declared width
- the SEQ capture is not a non-negative integer

```ts
parseDocumentNumber("INV-{YYYY}-{SEQ:5}", "INV-2026-42");   // throws: too short for width 5
parseDocumentNumber("INV-{YYYY}-{SEQ:5}", "ACME/INV-2026-00042"); // throws: prefix not in pattern
```

That second case is the common gotcha: **the prefix is not part of the pattern**. Strip it before parsing.

```ts
const format = await docNumber.getFormatById(formatId);
const raw = format.prefix ? value.slice(format.prefix.length) : value;
const { sequence, parts } = parseDocumentNumber(format.pattern, raw);
```

### Parsing is not validation

A round trip proves the *shape* matches, not that the document exists or that the number was ever allocated. Ambiguous patterns can also parse in surprising ways — `{YYYY}{MM}` with no separator is fine because widths are fixed, but `{SEQ}{YYYY}` (unpadded sequence followed by digits) is a pattern you should avoid on principle. Keep a literal separator between adjacent numeric tokens.

## Choosing a pattern

| Goal | Pattern | Reset |
| --- | --- | --- |
| Classic monthly invoice series | `INV-{YYYY}{MM}-{SEQ:5}` | `monthly` |
| Yearly series, human-friendly | `INV/{YYYY}/{SEQ:4}` | `yearly` |
| Daily operational docs (picking lists) | `PL-{YY}{MM}{DD}-{SEQ:3}` | `daily` |
| One unbroken series forever | `PO-{SEQ:8}` | `never` |

Match the reset to the date tokens. `reset: "monthly"` with a pattern containing only `{YYYY}` produces duplicate-looking values across months (`INV-2026-00001` twice) — legal, but almost never what anyone wanted. [Sequencing](./sequencing.md) covers the pairing in detail.

## Lower-level helpers

```ts
import { parsePattern, padSequence, datePartsUtc } from "@eristack/doc-number";

parsePattern("INV-{YYYY}-{SEQ:4}");
// → [{ kind: "literal", value: "INV-" }, { kind: "YYYY" },
//    { kind: "literal", value: "-" }, { kind: "SEQ", width: 4 }]

padSequence(42, 5);                                  // "00042"
datePartsUtc(new Date("2026-08-11T00:00:00.000Z"));  // { YYYY: "2026", YY: "26", MM: "08", DD: "11" }
```

`TokenNode` is exported for tools that want to render a pattern builder, highlight tokens, or explain a pattern in the UI.
