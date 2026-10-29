---
"@eristack/ai-dev": patch
---

Faster CI without dropping checks: `eristack ci --full` runs cheap drift gates first, then one parallel `turbo run build typecheck test`; `--skip-build` no longer triggers a hidden second build; the `integration` check in `pr`/`ci` verifies Drizzle suites are covered by turbo `test` instead of running them twice; the `examples` check now actually builds examples (quoted turbo filter, cached).
