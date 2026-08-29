---
"@eristack/ai-dev": patch
---

Wire Drizzle integration tests into CI: new `integration` check profile, included in `pr` and PR `eristack ci` drift path. Fix `checksForProfile({ only })` so explicit drift checks (e.g. integration) run outside catalog profile. Print full captured stderr on `eristack ci` failures.
