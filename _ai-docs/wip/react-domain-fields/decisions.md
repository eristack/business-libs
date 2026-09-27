# React domain fields — decisions log

| Date | Decision |
| --- | --- |
| 2026-09-27 | Plan **headless field components** in owning packages; existing `./react` = form helpers only until fields ship. |
| 2026-09-27 | Optional **`@eristack/form-ui`** (packages/ui) for shadcn-skinned inputs — not in primitive cores. |
| 2026-09-27 | Primary form integration: **TanStack Form** + string-first state matching REST/Zod adapters. |
| 2026-09-27 | Proposed export subpath: **`./react/fields`** for components/hooks; keep `./react` for validators. |
| 2026-09-27 | Wave 13 party primitives get fields in Phase 5 — after money/timestamp reference pattern. |
