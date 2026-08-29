# Gotchas

## Empty action arrays and PBAC

PBAC `assertValidTransitionTable` rejects rows with zero actions. Terminal statuses like `published: []` are **omitted** by `pbacTransitionTable()` before registration. Keep them in `graph.table` for documentation and `isTerminalStatus` — do not hand-register the raw table on PBAC.

## Unknown status

If `document.status` is not a key in the table, `documents.transitions()` denies all actions. Validate status on insert/update in the app layer.

## Action without status change

Some actions may patch lines without changing status — those belong on a **different** route or a dedicated graph. doc-transitions presets assume **one status field** per graph.

## Multiple concurrent transitions

Use optimistic locking (`version` column) and return `CONFLICT_VERSION` from `@eristack/rest` jsonError — transitions do not replace row versioning.

## Renaming actions after ship

Action names are part of your public API (`PATCH .../post`). Prefer additive new actions over renames; migrate clients if you must rename.

## BPM expectations

No subprocesses, timers, or role swimlanes — use app workflow tables if you need that complexity. Presets cover 80% of ERP document lifecycles.

## Status field vs display label

Store machine values (`unposted`) in SQL; format labels in UI. Do not use display strings as PBAC table keys.
