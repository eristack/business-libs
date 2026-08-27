# Suggestion: Wall-date calendar arithmetic (addDays) without Date timezone math

> Portable Eristack ticket — send this file to the maintainer. Feasibility is a first-pass gate for agents.

## Meta

- **id:** `20260827-140852-suggestion-wall-date-calendar-arithmetic-adddays-without-da-c88deb`
- **kind:** suggestion
- **package:** `@eristack/timestamp`
- **feasibility:** `possible`
- **created:** 2026-08-27T14:08:52.705Z
- **reporter:** Tiga Sekawan ERP (consumer)

## Summary

Invoice due_at = invoice_date wall + terms-of-payment due_days. IMPLEMENTATION forbids new Date for walls. timestamp has instant/wall types but no addDays/addCalendarDays on wall mode. Consumers will invent broken DST math.

## User story

As a logistics ERP I want due_at and ETD+transit computed on wall calendars in Asia/Jakarta.

## Proposed behavior

addWallDays(wall, n) returns a new WallJSON. Adding 1 day to 2026-03-28 in Europe stays calendar-safe. Does not convert through UTC Date.

## Proposed API

addWallDays(wall: Wall | WallJSON, days: number): Wall; maybe addWall({ days, months })

## Feasibility rationale

In-bounds for Wall-date calendar arithmetic (addDays) without Date timezone math; proceed with a concrete implementation sketch.

## Implementation sketch

- Implement on civil date Y-M-D in the wall timezone, not epoch millis + 86400000
- Tests: Jakarta, a DST spring-forward zone, negative days
- Document next to due_at / timestamp-wall skill

## Risks

- Must not implement addDays as epoch+86400000.
- Month/year overflow (Jan 31 + 1 month) is a separate function; this ticket is calendar days only.

## Alternatives

- Consumer civil-date parser (we will if this misses Horizon A invoices).
- Store due_days only and compute in the UI with Date — forbidden by IMPLEMENTATION.md.

## Agent handoff

1. Load Intent skills for `@eristack/timestamp`.
2. Implement the sketch; prefer additive APIs.
3. Update package docs + skills if the public surface changes.
4. Run `pnpm knowledge:sync` when skills/exports change.
5. Add a Changeset for user-facing changes.

## Notes

Sprint: `2026-08-27-backseat-invoices-settlement-close`. IMPLEMENTATION §19 createInvoiceFromLines due_at; §8 invoice; Q TOP due_days.

### Consumer evidence (Tiga Sekawan)

`due_at` = invoice wall date + max TOP `due_days` among lines. Default zone `Asia/Jakarta`. IMPLEMENTATION forbids `new Date` for walls.

Example: invoiceDate `2026-09-24` + 14 days → `2026-10-08` wall, timezone Asia/Jakarta.

Also useful for “ETD + 3 days = ETA guess” if CS wants a button later — still wall math.

timestamp@0.1.0: no addWallDays found in package grep.

### Sibling tickets (2026-08-27 batch)

See `.eristack/tickets/20260827-index-tiga-sekawan-horizon-a-eristack-gaps.md`.
