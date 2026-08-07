# business-primitives

Eristack Business Primitives — a TypeScript monorepo for shared business domain packages.

## Structure

```
packages/
  core/   @eristack/business-primitives-core
```

## Setup

```bash
pnpm install
```

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm build` | Build all packages |
| `pnpm dev` | Watch and rebuild all packages |
| `pnpm typecheck` | Type-check all packages |
| `pnpm clean` | Remove build artifacts |

## Adding a package

1. Create a directory under `packages/<name>/`
2. Add a `package.json` with build scripts (`build`, `dev`, `typecheck`, `clean`)
3. Run `pnpm install` from the repo root

Each package uses [tsup](https://tsup.egoist.dev/) to emit ESM + CJS with TypeScript declarations.
