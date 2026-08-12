# Access control packages (RBAC / ABAC / PBAC)

## Split

| Package | Question | Answer shape |
| --- | --- | --- |
| `@eristack/rbac` | Does this **subject** have this **permission**? | boolean (role → permissions) |
| `@eristack/abac` | Given **attributes** (user + resource + env), does policy X allow? | boolean from a policy function |
| `@eristack/pbac` | Does this **business document state** allow the operation? | boolean from a software policy (usually not per-user) |

## Majority RBAC use cases covered

- Named permissions (`orders.create`)
- Roles as permission sets
- Subjects get roles (app owns users; RBAC assigns via `subject`)
- `can` / `canAny` / `canAll` / `authorize` (throws)
- Optional direct subject permission grants
- Drizzle persistence + Express/Nest require-* + React `useCan`

## ABAC example

User attribute `maxBookValueMinor` + resource `bookValueMinor` → allow if book ≤ max.

## PBAC example

PO outstanding minor ≤ 0 → deny further goods receipts (document policy, not a user role).

## Status

Package docs live under each `packages/service/{rbac,abac,pbac}/docs/`. Delete this folder when the user marks access-control work finished.
