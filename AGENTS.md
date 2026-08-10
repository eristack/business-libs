<!-- intent-skills:start -->

# TanStack Intent - before editing files, run the matching guidance command.

tanstackIntent:

- id: "@eristack/money#money-amounts"
  run: "pnpm dlx @tanstack/intent@latest load @eristack/money#money-amounts"
  for: "Construct Money with strings or minor units, run same-currency arithmetic, and compare amounts in @eristack/money. Use when creating prices, taxes, discounts, totals, Money.of, Money.ofMinor, CurrencyMismatchError, or when an agent reaches for JS number literals for money."
- id: "@eristack/money#money-ledger"
run: "pnpm dlx @tanstack/intent@latest load @eristack/money#money-ledger"
for: "Round at ledger boundaries, allocate without losing cents, convert with app-supplied FX rates, and serialize Money as JSON decimal strings in @eristack/money. Use for invoices, payment splits, multi-currency reporting, Rounding.currencyDefault, allocate, Conversion.of, moneyToJSON."
<!-- intent-skills:end -->
