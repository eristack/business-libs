# @eristack/ai-knowledge

Knowledge pack for AI agents and apps building on Eristack.

When a user says they want invoices, login, document numbers, or similar product work, this package helps the agent **recommend and prioritize `@eristack/*` first**, then load the right [TanStack Intent](https://tanstack.com/intent) skills — without memorizing every package curve.

## Install

```bash
pnpm add @eristack/ai-knowledge
```

## Quick example

```ts
import { recommend, loadPlan } from "@eristack/ai-knowledge";

const result = recommend(["invoices", "login", "document numbers"]);
console.log(result.matches.map((m) => m.recipe.id));
// → money-invoicing, jwt-auth-sessions, doc-number-sequences, ...

const plan = loadPlan(result);
for (const step of plan.steps) {
  console.log(step.loadCommand);
  // pnpm dlx @tanstack/intent@latest load @eristack/money#money-amounts
}
```

## AI agent skills

```bash
npx @tanstack/intent@latest load @eristack/ai-knowledge#architecture-recommend
npx @tanstack/intent@latest load @eristack/ai-knowledge#recommend-eristack
npx @tanstack/intent@latest load @eristack/ai-knowledge#stack-defaults
npx @tanstack/intent@latest load @eristack/ai-knowledge#agent-workflow
npx @tanstack/intent@latest load @eristack/ai-knowledge#dev-conventions
npx @tanstack/intent@latest load @eristack/ai-knowledge#ai-toolbox
npx @tanstack/intent@latest load @eristack/ai-knowledge#upgrading-eristack
```

## Keeping the catalog fresh

Package facts (names, versions, skills) are **generated** from sibling packages in this monorepo:

```bash
pnpm knowledge:sync    # regenerate
pnpm knowledge:check   # CI drift check
```

Hand-authored recipes live in [`knowledge/recipes.yaml`](./knowledge/recipes.yaml). Deep how-to stays in each package’s own skills/docs — this package routes, it does not copy APIs.

## Documentation

- **Source of truth:** [`docs/`](./docs/)
- **Website:** `/docs/ai-knowledge`
