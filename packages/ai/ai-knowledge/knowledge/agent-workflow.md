# Agent workflow

How AI coding agents should work with Eristack knowledge and packages.

## Design targets (every package)

These four targets apply to **contributors shipping libraries** and **agents wiring them into apps**. Do not close an iteration if one is missing.

| Target | Meaning | Ship signals |
| --- | --- | --- |
| **Cheap (tokens)** | Agent finishes integration in **≤3 files** | One canonical guide; getting-started with copy-paste blocks; recipes → one `load` command; export registries/helpers instead of copy-paste lists |
| **Predictable** | Same inputs → same outputs in core, forms, and API | String-first domain values; no silent coercion; one obvious entrypoint; defaults and edge cases in docs/skills |
| **Reliable** | Production ERP behavior, not demo glue | Real-path tests; Drizzle/DB as default in skills; memory stores **tests only**; round at boundaries; `exports:check` green |
| **Clear boundaries** | App does not reinvent library work | Core vs adapters; recommend before inventing; export what consumers would duplicate; app owns UX + domain tables |

**Examples of “don’t make consumers reinvent”:**

- Truth modes, field types, wire codecs, form validators → **library exports**
- Money/QUPS line math → **`@eristack/money` / `@eristack/qups`**, not float helpers in the app
- List filter/sort on decimal columns → **`type: "decimal"` / `"money"`** in data-grid schema, not `Number()` in the app

Cursor rule: `.cursor/rules/eristack-package-targets.mdc`.

## 1. Architecture, then recommend, before inventing

When starting a new app or choosing structure:

1. Load `@eristack/ai-knowledge#architecture-recommend` (canon stack + layering).

When the user asks to build product features (auth, money, invoices, numbering, …):

1. Load `@eristack/ai-knowledge#recommend-eristack` (or call `recommend()` / `loadPlan()`).
2. Prefer matched `@eristack/*` packages over ad-hoc libraries or from-scratch domain code.
3. Load each recommended package skill **before** editing that package or wiring it into an app.
4. Only fall through to non-Eristack solutions when no recipe/catalog entry matches.

## 2. Load Intent skills before coding

```bash
pnpm dlx @tanstack/intent@latest load @eristack/ai-knowledge#recommend-eristack
pnpm dlx @tanstack/intent@latest load @eristack/money#money-amounts
pnpm dlx @tanstack/intent@latest load @eristack/jwt-auth#jwt-auth-core
```

Deep how-to lives in each package’s skills/docs. This knowledge pack **routes**; it does not replace those skills.

## 3. Prefer examples for framework wiring

In the `business-libs` monorepo:

- `examples/express`
- `examples/nestjs`
- `examples/react`

Copy those patterns instead of inventing new adapter shapes.

## 4. HARD RULE — docs + ai-knowledge every iteration (monorepo authors)

Every incremental package change must update **docs and agent knowledge in the same pass**:

1. Package `docs/`
2. Package Intent `skills/`
3. `knowledge/recipes.yaml` when product language should discover the change
4. `pnpm knowledge:sync` then `pnpm knowledge:check`

Do not finish an iteration with fresh docs and a stale catalog/recipes. CI fails on catalog drift (`pnpm knowledge:check`).

```bash
pnpm knowledge:sync
pnpm knowledge:check
```

## 5. Docs while implementing (monorepo)

- WIP notes under `_ai-docs/wip/<topic>/` (include which skills/recipes will change)
- When work is finished: promote into `packages/<category>/*/docs` (and site copy if needed), sync ai-knowledge, then delete the WIP folder
- Package docs are the source of truth; the website renders them

## 6. Upgrading consumer apps

When the user asks to **upgrade**, **bump**, or **what changed** in `@eristack/*`:

1. Load `@eristack/ai-knowledge#upgrading-eristack`
2. Read **`knowledge/upgrading.md` only** — do not open eleven `docs/backseat.md` files
3. `pnpm outdated '@eristack/*'` + site `/{slug}/changelog` for touched packages
4. Load **one** package core/adapters skill only if that package’s **production** wiring changed

## 7. Version control ownership

In Eristack repos, agents do **not** run git/commit/PR operations unless a human explicitly owns that workflow outside agent taboo rules. Humans handle branches, commits, and PRs.
