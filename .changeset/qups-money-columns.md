---
"@eristack/qups": minor
---

Breaking: `qupsLineColumns()` uses one shared `currency` column and numeric `*Amount` fields via `@eristack/money/drizzle`. Updates `QupsColumnValues`, stores, and `withQupsColumns`. Migration notes in docs.
