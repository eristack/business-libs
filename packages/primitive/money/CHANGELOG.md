# @eristack/money

## 0.3.3

### Patch Changes

- b793eed: Export decimal compare helpers, Money.format hook, FX asOf metadata, and rejectJsonNumberMoneyBody middleware.

## 0.3.2

### Patch Changes

- 294445c: Add `convertAtQuotePerBase` for quote-per-base FX snapshots (golden USD × IDR rate path).

## 0.3.1

### Patch Changes

- 78d8154: Add `parseRoundedAmount` and amount-only TanStack Form helpers (`createAmountOnlyFieldValidators`, `submitAmountOnlyFormValue`) for shared-currency ERP/QUPS line fields.

## 0.3.0

### Minor Changes

- c6cf43f: Add adapter subpaths (`./drizzle`, `./rest`, `./zod`, `./express`, `./nest`, `./client`, `./react`). Move implementation under `src/core/`; root export unchanged. Zod 4 only (`peer: zod ^4`). Per-subpath docs.

## 0.2.1

### Patch Changes

- 7847ca5: Add MIT license: root `LICENSE`, per-package `LICENSE` in publish tarball, and `"license": "MIT"` in `package.json`.

## 0.2.0

### Minor Changes

- 6f7bfa7: Add advanced money arithmetic: `Money.sum`/`min`/`max`/`average`, percent helpers, dimensionless ratios, and `Percent`/`Discount`/`Markup`/`Tax` operators.

## 0.1.0

### Minor Changes

- 713ceb8: Initial public release of `@eristack/money` and `@eristack/jwt-auth`.
