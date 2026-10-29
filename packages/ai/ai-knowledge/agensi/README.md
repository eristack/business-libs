# Eristack AI Knowledge Pack

Free, MIT-licensed skills that help your coding agent build business apps (invoices, login, document numbers, ERP lists and documents, ledgers) on top of **Eristack**: small open-source TypeScript libraries extracted from real product work at [Erista](https://erista.id).

The pack does one job: when you ask for a feature, your agent finds the matching `@eristack/*` package, installs it, and wires it the supported way instead of re-inventing money math, auth sessions, or numbering from scratch.

## What your agent will do

1. Turn your request into goals ("invoices", "login", "document numbers").
2. Match them against `knowledge/recipes.yaml` and recommend the `@eristack/*` packages that cover them.
3. Install those packages (`pnpm add @eristack/money @eristack/jwt-auth …`) and import them.
4. Follow the stack defaults: TypeScript, Drizzle + Postgres in production, Express or NestJS, and React.
5. Write app code only for what no package covers, and say so when it does.

## Skills in this pack

<!-- skills:table -->

Each skill is also published with the npm package, so you can load the same content through [TanStack Intent](https://tanstack.com/intent):

```bash
pnpm add -D @eristack/ai-knowledge
pnpm dlx @tanstack/intent@latest load @eristack/ai-knowledge#recommend-eristack
```

Package-specific skills (`@eristack/money#money-amounts`, `@eristack/jwt-auth#jwt-auth-core`, …) ship inside each package and load the same way once the package is installed.

## Shared files

- `knowledge/recipes.yaml` — product phrases → packages → skills (the routing table)
- `knowledge/*.md` — one canonical guide per topic (upgrading, HTTP errors, idempotency, ERP document spine, …)
- `knowledge/toolbox/` — copy-paste agent briefs and checklists

Paths such as `examples/express` or `packages/…` refer to the public repository.

## Scope

- Routing and architecture guidance only. The libraries themselves are installed from npm, not bundled here.
- Your app still owns its tables, UI, and business rules.
- TypeScript / Node.js 20+ projects. Commands use pnpm; npm, yarn, and bun work the same way.

## Links

- Source: https://github.com/eristack/business-libs
- npm: https://www.npmjs.com/package/@eristack/ai-knowledge
- Erista: https://erista.id

MIT © Eristack
