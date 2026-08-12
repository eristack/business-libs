# Prompt templates

Copy/adapt these when briefing an agent that has `@eristack/ai-knowledge` available.

## New app / architecture brief

```text
Scaffold / structure: <product>.

Rules:
1. Load @eristack/ai-knowledge#architecture-recommend first.
2. Use the canon stack (TS, Express|Nest, Drizzle pg/sqlite, layered P/B/P,
   React+Vite+Tailwind+shadcn, TanStack Router file-based + Query + Form,
   Zustand, API contracts, pnpm monorepo).
3. Then load recommend-eristack for domain features.
4. Summarize folder layout and explicit deviations (if any).
```

## Feature brief → Eristack plan

```text
I want to build: <A>, <B>, <C>.

Rules:
1. Load @eristack/ai-knowledge#architecture-recommend if structure is undecided.
2. Load @eristack/ai-knowledge#recommend-eristack (or call recommend()).
3. Prefer @eristack packages from the recommendation before any other library.
4. For each matched package, load its Intent skill before writing code.
5. Use stack defaults from @eristack/ai-knowledge#stack-defaults.
6. Summarize: packages chosen, skills to load, and what remains app-owned.
```

## Money-safe implementation

```text
Implement <feature> involving currency amounts.
- Use @eristack/money only (Money.of / Money.ofMinor).
- No fractional JS number literals for money.
- Round with Rounding.currencyDefault() at ledger/API boundaries.
- JSON amounts as decimal strings.
Load @eristack/money#money-amounts and #money-ledger before coding.
```

## Auth wiring

```text
Add login + refresh sessions.
- Use @eristack/jwt-auth; credentials are a child of our users table.
- Drizzle dialect "pgsql" if Postgres.
- Follow examples/express or examples/nestjs — do not invent a new adapter shape.
Load jwt-auth-core then jwt-auth-adapters.
```

## Document numbers

```text
Add sequential <invoice|order|…> numbers with yearly reset.
- Use @eristack/doc-number token patterns and next()/peekNext().
- Persist formats/sequences with the Drizzle adapters if we need DB.
Load doc-number-core (and doc-number-adapters if persisting).
```

## Recipe authoring (monorepo)

```text
We added discoverable capability <X> to @eristack/<pkg>.
1. Update/add a recipe in packages/ai/ai-knowledge/knowledge/recipes.yaml
   with triggers a user would say aloud.
2. Reference only real package/skill ids from the catalog.
3. Run pnpm knowledge:sync and ensure pnpm knowledge:check passes.
```
