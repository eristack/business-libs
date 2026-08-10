# EriStack Business Primitives Library

Eristack Business Primitives — a TypeScript monorepo for shared business primitives library.

## Story behind EriStack Business Primitives

Node ecosystem lacks the proper enterprise support like Java or C# environment. This pain is especially known to us, as we, at the [Erista](https://github.com/erista), struggles with reusability of so many important and what is supposed to be consistent business primitives.

EriStack aims to fill these gaps by implementing some of the well-known enterprise support on business primitives such as: Date, Money (JSR 354 on Java), Document Number, etc.

## Packages

- [`@eristack/money`](./packages/money) — JSR 354–inspired money primitives (see [`packages/money/docs`](./packages/money/docs))
- [`@eristack/jwt-auth`](./packages/jwt-auth) — JWT access + refresh-token auth with Drizzle / REST / Express / Nest / React adapters

## AI agent skills

Publishable packages ship versioned [TanStack Intent](https://tanstack.com/intent) skills:

```bash
pnpm skills:list
npx @tanstack/intent@latest load @eristack/money#money-amounts
npx @tanstack/intent@latest load @eristack/jwt-auth#jwt-auth-core
```

Domain artifacts live in [`_artifacts/`](./_artifacts/). Keep the `intent-skills` block in [`AGENTS.md`](./AGENTS.md) near the top.
