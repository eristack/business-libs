---
title: Subscription
description: Mandatory ticket.yaml for every @eristack package
sidebar_position: 5
---

# Subscription

Every publishable package under `packages/<category>/<name>/` **must** have:

```text
packages/.../<name>/ticket.yaml
```

## Shape

```yaml
package: "@eristack/money"
title: money
maintainers:
  - support@eristack.dev
scope: >
  Currency-safe Money amounts, arithmetic, totals, discounts, ledger helpers.
outOfScope: >
  Hosted FX feeds, app invoice UX, inventing a second money type in JS numbers.
skills:
  - money-amounts
  - money-ledger
```

`package` must match `package.json` `name`.

## Commands

```bash
# Scaffold missing files (skips existing unless --force)
pnpm eristack-ticket subscribe --all

# One package
pnpm eristack-ticket subscribe --package @eristack/money

# CI
pnpm ticket:check
```

## Why mandatory

Without a subscription, generators cannot know scope, skills, or owners — and
suggestion feasibility becomes guesswork. The check keeps the support loop
honest as new packages land.
