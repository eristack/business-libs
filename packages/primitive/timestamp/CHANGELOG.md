# @eristack/timestamp

## 0.1.3

### Patch Changes

- b2edcbc: Add `asInstant()` for TimestampJSON at API boundaries. `instantOf()` now throws `TimestampParseError` with a wall-local hint instead of leaking raw Temporal offset errors.

## 0.1.2

### Patch Changes

- b793eed: Add wall date range helpers, sortWallClocks, and Express/Nest wall query param parsing.

## 0.1.1

### Patch Changes

- 294445c: Add `compareWall`, `isWallInRange`, and `addWallDays` for wall-mode list filters and due-date arithmetic.

## 0.1.0

### Minor Changes

- 641854e: Initial `@eristack/timestamp`: instant mode (UTC facts + IANA zone), wall mode (local intent, DST-safe), Temporal polyfill, `TimestampJSON` wire shape, and full adapter spine (`/drizzle`, `/rest`, `/zod`, `/express`, `/nest`, `/client`, `/react`) mirroring `@eristack/money`.
