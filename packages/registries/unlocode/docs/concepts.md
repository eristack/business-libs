# Concepts

## Shape

| Form | Example |
| --- | --- |
| Compact | `IDJKT` |
| Display | `ID JKT` (space optional on input) |
| Country | First two chars → `@eristack/iso-3166` |
| Location | Last three chars `[A-Z0-9]{3}` |

## Format vs UN membership

| API | Checks |
| --- | --- |
| `normalizeUnlocode` | Length, charset, **assigned country** |
| `isSampleUnlocode` | In-package **sample** list only |
| Future reference-data | Full UN/LOCODE release files |

Location triple `XXX` is **not** validated against the UN register in v0.1 — only country assignment is authoritative via iso-3166.
