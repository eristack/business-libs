<!-- intent-skills:start -->
# TanStack Intent - before editing files, run the matching guidance command.
tanstackIntent:
  - id: "@eristack/jwt-auth#jwt-auth-adapters"
    run: "pnpm dlx @tanstack/intent@latest load @eristack/jwt-auth#jwt-auth-adapters"
    for: "@eristack/jwt-auth adapters: drizzle pgsql/mysql/sqlite RefreshTokenStore, headless rest actions createRequireAuth, express createJwtAuthRouter, nest JwtAuthModule JwtAuthGuard, client createJwtAuthClient, react JwtAuthProvider useJwtAuth. Use when wiring persistence or HTTP/frontend shells."
  - id: "@eristack/jwt-auth#jwt-auth-core"
    run: "pnpm dlx @tanstack/intent@latest load @eristack/jwt-auth#jwt-auth-core"
    for: "Pure @eristack/jwt-auth token lifecycle: createJwtAuth, issueTokens, verifyAccessToken, refresh rotation, revoke, RefreshTokenStore, opaque refresh hashes, family reuse detection, RefreshTokenReuseError. Use when implementing JWT access + refresh without passwords/HTTP/DB frameworks."
  - id: "@eristack/money#money-amounts"
    run: "pnpm dlx @tanstack/intent@latest load @eristack/money#money-amounts"
    for: "Construct Money with strings or minor units, run same-currency arithmetic, and compare amounts in @eristack/money. Use when creating prices, taxes, discounts, totals, Money.of, Money.ofMinor, CurrencyMismatchError, or when an agent reaches for JS number literals for money."
  - id: "@eristack/money#money-ledger"
    run: "pnpm dlx @tanstack/intent@latest load @eristack/money#money-ledger"
    for: "Round at ledger boundaries, allocate without losing cents, convert with app-supplied FX rates, and serialize Money as JSON decimal strings in @eristack/money. Use for invoices, payment splits, multi-currency reporting, Rounding.currencyDefault, allocate, Conversion.of, moneyToJSON."
<!-- intent-skills:end -->
