# ERP UI stack (example composition)

This example composes `@eristack/design-system`, `@eristack/list-shell`, and `@eristack/doc-shell` without a separate `@eristack/app-chrome` package.

1. Import `@eristack/design-system/tokens.css` in the app root.
2. Wrap routes in `DensityProvider` from `@eristack/design-system/react`.
3. List routes use `ListPageLayout` + `@eristack/data-grid/react` hooks.
4. Document routes use `DocShell` + `@eristack/line-grid` for QUPS lines.

Canonical guide: `@eristack/ai-knowledge#ui-package-stack`.
