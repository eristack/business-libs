---
title: Gotchas
description: Anti-patterns, DST, Date interop, storage mistakes
sidebar_position: 7
---

# Gotchas

Sharp edges that cause production bugs — especially around DST and mixed mode storage.

## 1. Do not store wall intent as UTC

**Symptom:** Due "local midnight" drifts a day in UI after save/load.

**Cause:** Converting `wallOf("2026-09-15T00:00:00", "Europe/Paris")` to UTC once and storing only UTC in `timestamptz`.

**Fix:** Persist `kind: "wall"` + `local` + `timezone`. Call `wallToInstantOnce` only when firing a one-shot job.

## 2. Do not use instant mode for recurring local times

**Symptom:** Weekly standup at 9:00 moves to 8:00 or 10:00 after DST.

**Cause:** Recurrence engine stores UTC anchor from first occurrence.

**Fix:** Store wall rule + timezone; compute each occurrence's local string, then `wallToInstantOnce` per fire.

## 3. Do not use one field name for both modes

**Symptom:** Agents and junior devs pass UTC into fields meant as local.

**Fix:** Enforce `kind` discriminant. Name columns `posted_at` (instant) vs `due_at` (wall) consistently — see [Recipes](./recipes.md).

## 4. Server timezone is not entity timezone

**Symptom:** Transaction date wrong for branches in another country.

**Cause:** `new Date()` + `getDate()` on server in `us-east-1`.

**Fix:** `instantOf(..., entityTimezone)` + `toLocalDateString`. Never trust host `TZ`.

## 5. `Date` getters are forbidden for business rules

| Forbidden | Use |
| --- | --- |
| `d.getHours()` | `toLocalParts(instantOf(d, zone))` |
| `d.toLocaleDateString()` without zone arg | `toLocalDateString` / `formatInstant` |
| `Date.parse` on wall local string | `wallOf` |

## 6. DST gap — local time literally missing

Spring forward example (`America/New_York`):

```ts
wallOf("2025-03-09T02:30:00", "America/New_York");
wallToInstantOnce(...); // TimestampGapError by default
```

UI should prevent picking non-existent times or ask user to adjust.

## 7. DST overlap — local time exists twice

Fall back example:

```ts
wallOf("2026-11-01T01:30:00", "America/New_York");
wallToInstantOnce(...); // TimestampOverlapError by default
wallToInstantOnce(..., { disambiguation: "earlier" }); // ok
```

Show UI choice when ambiguous.

## 8. Offset is not a timezone column

**Symptom:** DST breaks after storing `+07:00` as zone.

**Fix:** `Asia/Jakarta` in `timezone`. Offsets only inside instant **input** strings.

## 9. String sort on instants requires normalization

**Symptom:** `"2026-1-01..."` sorts before `"2026-10-01..."` incorrectly.

**Fix:** Always normalize to UTC `Z` via `instantOf` / `validateTimestampJSON`. Use `compareInstant` in app code.

## 10. Mixing wall local with `Z` suffix

```ts
wallOf("2026-09-15T00:00:00Z", "UTC"); // TimestampParseError
```

That is instant mode input, not wall.

## 11. doc-number UTC is intentional

`@eristack/doc-number` `{YYYY}` tokens use UTC. Do not "fix" doc-number — adjust `at` in app layer if entity-local buckets are required. See [Recipes](./recipes.md#recipe-doc-number-with-entity-local-period-intent).

## 12. Hash-chained ledger strings

Financial/stock ledgers hash ISO strings. Changing hash format requires migration. Prefer keeping UTC ISO in hash; add zone on relational columns.

## Error reference

| Error | Typical cause |
| --- | --- |
| `TimestampParseError` | Bad ISO, wall string with offset |
| `InvalidTimeZoneError` | Bad IANA, offset as zone |
| `TimestampGapError` | Wall time in spring-forward gap |
| `TimestampOverlapError` | Wall time in fall-back overlap without disambiguation |

## Related

- [Wall mode](./wall.md)
- [Timezone](./timezone.md)
- [Serialization](./serialization.md)
