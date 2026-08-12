---
title: Subscription
description: Mandatory ticket.yaml for every @eristack package
sidebar_position: 5
---

# Subscription

Every publishable package under `packages/<category>/<name>/` **must** have:

```text
packages/<category>/<name>/ticket.yaml
```

Without it, generators cannot know scope, skills, or owners — and suggestion feasibility becomes guesswork. CI enforces the contract with `pnpm ticket:check`.

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

| Field | Rule |
| --- | --- |
| `package` | Must match `package.json` `name` |
| `title` | Short human label |
| `maintainers` | Who receives / triages files |
| `scope` | What the package owns (feasibility positive signal) |
| `outOfScope` | Explicit non-goals (feasibility negative signal) |
| `skills` | Intent skill ids agents should load when fixing |

## Commands

```bash
# Scaffold missing files (skips existing unless --force)
pnpm eristack-ticket subscribe --all

# One package
pnpm eristack-ticket subscribe --package @eristack/money

# CI / local check
pnpm ticket:check
# same as: pnpm eristack-ticket check
```

`check` walks publishable package dirs, reports `missing` and `invalid`, and exits non-zero when not `ok`.

## Library helpers

```ts
import {
  checkSubscriptions,
  defaultSubscriptionForPackage,
  loadSubscription,
  writeSubscription,
  listEristackPackageDirs,
  TICKET_SUBSCRIPTION_FILENAME,
} from "@eristack/ai-ticket-generator";

const result = checkSubscriptions(repoRoot);
// { ok, checked, missing, invalid }

const draft = defaultSubscriptionForPackage(pkgDir);
writeSubscription(pkgDir, draft);
```

## Authoring tips

1. Keep `scope` concrete (APIs and responsibilities), not marketing.
2. Put common wrong asks in `outOfScope` (UI kits, owning `users`, FX feeds, …).
3. List the Intent skills a fixer should load first.
4. Update the file when the public surface or skills change — same cadence as docs.

## Why mandatory

New packages land often. Without a check, half of them silently drop out of the support loop. Subscription keeps bug/suggestion generation and agent handoff aligned with the real package boundary.

## Next steps

- [Workflow](./workflow.md) — check in CI + fixer flow
- [Suggestion tickets](./suggestion-tickets.md) — how scope feeds feasibility
