---
"@eristack/timestamp": patch
---

Add `asInstant()` for TimestampJSON at API boundaries. `instantOf()` now throws `TimestampParseError` with a wall-local hint instead of leaking raw Temporal offset errors.
