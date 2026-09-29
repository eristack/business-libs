---
"@eristack/ai-dev": patch
---

Give the repo-wide `runSync` knowledge/docs tests an explicit 60s timeout so parallel `turbo run test` load cannot surface as a spurious `@eristack/ai-dev#test` CI failure.
