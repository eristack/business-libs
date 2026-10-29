# Agensi listing — Eristack AI Knowledge Pack

Copy for the form at agensi.io/dashboard/submit. Not shipped in the ZIP. Upload `agensi-dist/eristack-ai-knowledge-pack.zip` from `pnpm --filter @eristack/ai-knowledge agensi:pack`.

## Name

Eristack AI Knowledge Pack

## Pricing

Free

## Summary (≤300 chars)

Free skills that point your coding agent at the open-source @eristack/* TypeScript libraries for invoices, login, document numbers, ERP lists and ledgers. It installs the right package and wires it the supported way instead of re-inventing money math or auth.

## Description

Building a business app with an AI agent usually means the agent re-invents the hard parts: floating-point money, hand-rolled refresh tokens, invoice counters that skip or collide. This pack gives your agent a short routing table instead.

**What it does**

- Maps plain requests ("invoices", "login", "document numbers", "ERP list screen", "cashbook") to the `@eristack/*` package that already solves them.
- Tells the agent to install that package (`pnpm add @eristack/…`) and import it, not copy or re-write it.
- Gives stack defaults that have held up in production: TypeScript, Drizzle with Postgres, Express or NestJS, React, and string-first money.
- Includes one canonical guide per cross-cutting topic: upgrades, HTTP 409 errors, idempotency and outbox, optimistic versioning, and the document-with-lines ERP spine.

**How it works**

18 skills plus shared `knowledge/` files. Start with `eristack-recommend`; it reads `knowledge/recipes.yaml` (81 recipes) and names the packages and package skills to use. Deeper per-package skills ship inside each npm package and load through TanStack Intent.

**Where it stops**

- It routes and advises; it is not the libraries themselves. Code comes from npm.
- Your app keeps its own tables, UI, and business rules.
- TypeScript / Node.js only.

Eristack is a set of small MIT libraries extracted from real product work at [Erista](https://erista.id). Source: https://github.com/eristack/business-libs.

## See it in action

**Request**

> I'm starting a small B2B invoicing app in TypeScript. Users log in with username and password, invoices need numbers like INV-202610-00001, and totals must be exact. Set up the backend.

**What the agent does with this pack**

1. Loads `eristack-recommend` and splits the request into goals: "invoices", "login", "document numbers".
2. Matches recipes in `knowledge/recipes.yaml`: `jwt-auth-sessions` → `@eristack/jwt-auth`, `doc-number-sequences` → `@eristack/doc-number`, `money-ledger` → `@eristack/money`. It notes that `oauth-sso-google-oidc` only applies if social login is wanted later.
3. Loads `eristack-architecture-recommend` and `eristack-stack-defaults`: Express API, Drizzle with Postgres in production and SQLite in tests, presentation / business / persistence layers.
4. Installs instead of writing from scratch:
   `pnpm add @eristack/money @eristack/jwt-auth @eristack/doc-number drizzle-orm zod`
5. Loads the package skills before coding: `@eristack/money#money-amounts`, `@eristack/jwt-auth#jwt-auth-core`, `@eristack/doc-number#doc-number-core`.
6. Writes the app code:
   - an app-owned `users` table with jwt-auth credentials as a child table (never a second users model);
   - an `invoice` doc-number format `INV-{YYYY}{MM}-{SEQ:5}`, with numbers allocated by `next()` on save (previews never consume a number);
   - line totals with `Money.of("120.00", "USD")` strings, rounded once at the ledger boundary, with no JS number money.
7. Reports what it did not cover (PDF output, email) and suggests the matching recipes (`@eristack/pdf-render`, `@eristack/comms`) rather than ad-hoc libraries.

The result is a backend wired from tested packages with documented defaults, instead of three home-grown modules to maintain.

## Compatibility note

TypeScript projects on Node.js 20+. Works with any agent that reads SKILL.md. Commands use pnpm; npm, yarn, and bun work too. Optional: TanStack Intent to load per-package skills.

## Categories (pick the closest 3 in the form)

1. Software development / coding
2. Backend & APIs
3. Business / finance operations

## Tags

typescript, erp, invoicing, accounting, money, authentication, jwt, drizzle, postgres, express, nestjs, react, document numbering, ledger, idempotency, open source, eristack

## Use cases

- Scaffold an invoicing or billing backend without floating-point money bugs
- Add username/password login with rotating refresh tokens
- Generate gap-safe document numbers (invoices, POs, job orders)
- Build ERP list and document screens with filters and editable lines
- Prototype a clickable ERP in the browser, then move it to a real Drizzle API
- Upgrade an existing app's @eristack packages safely

## Permissions (confirm what the form detects)

- **Tools:** shell, to run `pnpm add @eristack/…` and optionally `pnpm dlx @tanstack/intent@latest load …`
- **Network:** npm registry only, for those installs
- **Files:** reads and writes the user's project source
- **Services / secrets:** none. The pack ships no scripts, executables, or env access.

## Limitations

- Routing and guidance only; the libraries are installed from npm.
- `@eristack/*` packages are 0.x: pin versions and read changelogs (the `eristack-upgrading` skill covers this).
- No vertical ERP modules: the app owns partner, product, and job tables.
- Some guides reference repo paths (`examples/express`, …) that live on GitHub, not in the pack.

## FAQ

**Is it really free?** Yes. The pack and all `@eristack/*` libraries are MIT.

**Do I need TanStack Intent?** No. The pack works alone; Intent only loads the deeper per-package skills.

**Will it force Eristack on things it doesn't cover?** No. Unmatched goals are stated plainly and handled with app code or other libraries.

**Which databases?** Postgres in production, SQLite for tests, both through Drizzle.

## Docs link

https://github.com/eristack/business-libs/tree/main/packages/ai/ai-knowledge

## Other links (description body only — no outside checkout links)

- https://erista.id
- https://www.npmjs.com/package/@eristack/ai-knowledge

## Pre-upload checklist

- [ ] `pnpm --filter @eristack/ai-knowledge agensi:pack` prints `OK` (rebuild after each release so `version` in SKILL.md matches npm)
- [ ] Open the ZIP once: 18 `skills/eristack-*/SKILL.md`, `knowledge/`, `README.md`, `LICENSE`
- [ ] Logo: square 512 × 512 Erista/Eristack mark
- [ ] Pricing set to Free; no Gumroad/Stripe-style links anywhere
- [ ] Test once in your own agent: ask for "invoices + login + document numbers" and confirm it installs `@eristack/*`
