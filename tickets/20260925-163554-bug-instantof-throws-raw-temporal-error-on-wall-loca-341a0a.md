# Bug: instantOf throws raw Temporal error on wall local ISO

> Portable Eristack ticket — send this file to the maintainer. An agent can open it and start fixing.

## Meta

- **id:** `20260925-163554-bug-instantof-throws-raw-temporal-error-on-wall-loca-341a0a`
- **kind:** bug
- **package:** `@eristack/timestamp`
- **observed version:** `0.1.2`
- **created:** 2026-09-25T16:35:54.602Z
- **reporter:** household

## Summary

Passing a wall local string (no Z/offset) to instantOf throws Temporal.Instant requires a time zone offset. That message leaked into a journal UI as BUSINESS_POLICY_DENIED. instantOf should throw TimestampParseError and point agents at wallOf + wallToInstantOnce.

## Scenario

Household ledger journal modal sends postedAt as wall JSON for a user-picked value date. Domain called instantOf(postedAt.local, timezone).

## Steps to reproduce

- Call instantOf('2026-09-24T12:00:00', 'Asia/Jakarta')
- Observe throw

## Expected

TimestampParseError naming the input and telling the caller to use wallOf + wallToInstantOnce (or a new asInstant helper)

## Actual

Raw Temporal.Instant requires a time zone offset

## Impact

_None yet._

## Environment

_Not provided._

## Logs

```text
{"error":{"code":"BUSINESS_POLICY_DENIED","message":"Temporal.Instant requires a time zone offset"}}

Journal modal POST /api/transactions body:
{"intent":"spend","description":"Monthly admin fee","amount":{"currency":"USD","amount":"2.50"},"fromMoneyAccountId":"8729dce3-4f1f-4860-80ec-9a26cc0287ac","expenseCategoryId":"292495b4-04ad-4cdf-ac68-dafe20a48ebc","postedAt":{"kind":"wall","local":"2026-09-24T12:00:00","timezone":"Asia/Jakarta"}}
```

## Suspects

_None yet._

## Fix plan

- Add a unit test that instantOf(wall-local, zone) throws TimestampParseError
- Wrap Temporal Instant parse and rethrow with the wall vs instant hint
- Export asInstant(json, timezone) that routes wall JSON through wallToInstantOnce and instant JSON through instantOf
- Put asInstant in timestamp-core SKILL.md first 20 lines with this exact Temporal message as a failure mode

## Agent handoff

1. Load the package Intent skill(s) for `@eristack/timestamp`.
2. Reproduce from **Steps to reproduce** (or confirm cannot).
3. Implement along **Fix plan**; keep scope to this package.
4. Add/adjust tests; run package `test` + `typecheck`.
5. If public API changes, add a Changeset.

## Notes

_None yet._
