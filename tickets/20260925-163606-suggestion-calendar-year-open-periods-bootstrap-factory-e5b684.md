# Suggestion: Calendar-year open-periods bootstrap factory

> Portable Eristack ticket — send this file to the maintainer. Feasibility is a first-pass gate for agents.

## Meta

- **id:** `20260925-163606-suggestion-calendar-year-open-periods-bootstrap-factory-e5b684`
- **kind:** suggestion
- **package:** `@eristack/fiscal-calendar`
- **feasibility:** `possible`
- **created:** 2026-09-25T16:36:06.626Z
- **reporter:** household

## Summary

Consumers hand-roll 12 open months for 2025-2027 to get findPeriodForDate working. Need a default calendar-year factory and a documented error code when no period exists.

## User story

As a household cashbook I want an all-open calendar-year fiscal calendar for bootstrap without inventing period tables.

## Proposed behavior

calendarYearFactory({ timezone, years: [2025,2026,2027] }) returns a FiscalCalendar with 12 open months per year. assertPeriodOpen stays. Missing period has a stable error code for HTTP mapping.

## Proposed API

createCalendarYearCalendar({ id, timezone, years: number[] }): FiscalCalendar; PeriodMissingError.code

## Feasibility rationale

In-bounds for Calendar-year open-periods bootstrap factory; proceed with a concrete implementation sketch.

## Implementation sketch

- Implement monthsForYear without JS Date local TZ (UTC date parts only)
- Tests: 2026-09-24 Asia/Jakarta finds 2026-09 open
- Document error code for mapDomainError

## Risks

_None yet._

## Alternatives

_None yet._

## Agent handoff

1. Load Intent skills for `@eristack/fiscal-calendar`.
2. Implement the sketch; prefer additive APIs.
3. Update package docs + skills if the public surface changes.
4. Run `pnpm knowledge:sync` when skills/exports change.
5. Add a Changeset for user-facing changes.

## Notes

_None yet._
