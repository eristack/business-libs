# ERP UI package stack

Canonical map for **styled React** in `packages/ui/` — list pages, document shells, line grids, and domain inputs. Headless domain math stays in `@eristack/qups`, `@eristack/data-grid`, `@eristack/multitab`, etc.

Load: `@eristack/ai-knowledge#ui-package-stack` · Recipes: `erp-ui-design-system`, `erp-ui-shell`, `erp-list-and-doc-screens`

---

## Ship order (v0 → npm `0.1.x`)

| # | Package | Role | Site slug |
| --- | --- | --- | --- |
| 1 | `@eristack/design-system` | Erista CSS tokens, Tailwind preset, `DensityProvider` | `design-system` |
| 2 | Headless fields | `@eristack/money/react/fields`, `@eristack/percent/react`, `@eristack/timestamp/react/fields` | (subpaths on primitives) |
| 3 | `@eristack/form-ui` | `MoneyInput`, `PercentInput`, `TimestampWallInput`, `FormField` | `form-ui` |
| 4 | `@eristack/list-shell` | List layout, toolbar, query state banner | `list-shell` |
| 5 | `@eristack/filter-builder` | Filter chips + advanced sheet (data-grid JSON) | `filter-builder` |
| 6 | `@eristack/line-grid` | QUPS line editor → `calculateLine` / `patchLine` | `line-grid` |
| 7 | `@eristack/doc-shell` | Doc header, status slot, action bar | `doc-shell` |
| 8 | `@eristack/policy-ui` | `Can`, `BusinessPolicyGate` (presentation; logic in rbac/pbac) | `policy-ui` |
| 9 | `@eristack/master-detail` | List + detail split | `master-detail` |
| 10 | `@eristack/command-palette` | Cmd+K navigation shell | `command-palette` |
| — | `@eristack/multitab` | Tab workspace (already published) | `multitab` |
| — | App chrome | Compose in **`examples/react`** until a second consumer needs `@eristack/app-chrome` | — |

**Not merged:** `@eristack/form-kit` (headless TanStack Form recipes) stays separate from `form-ui`.

---

## Release train (consumers — no surprises)

| Fact | Action |
| --- | --- |
| First publish is **minor** from `0.0.0` → **`0.1.0`** per package (pending `.changeset/ui-*-initial.md`) | After Version Packages PR merges, install `@eristack/design-system@^0.1.0` (same for each UI package you use) |
| UI packages **peer** spine libs — never runtime `dependencies` on `@eristack/*` | Run `pnpm publish:check` in the monorepo; consumers use matching semver floors from each package’s `peerDependencies` |
| Inter-UI peers use **`^0.1.0`** (not `^0.0.0`) so npm resolves after first release | e.g. `form-ui` → `design-system@^0.1.0`; `line-grid` → `form-ui@^0.1.0` |
| Headless field subpaths ship as **patch** on money / percent / timestamp | Load `@eristack/money#money-amounts` + `docs/react-fields.md` for `useMoneyField` |
| Changelogs | `https://eristack.dev/{slug}/changelog` after publish |

Monorepo contributors: see `scripts/changeset-sync-after-main.md` when rebasing onto a Version Packages merge — drop consumed changesets, keep **new** ones only.

---

## Integration (≤3 files)

1. This guide + `#ui-package-stack` skill.
2. One package `docs/getting-started.md` (e.g. `@eristack/list-shell`).
3. `examples/react/docs/erp-ui-stack.md` — design-system + list or doc route.

---

## End-to-end wiring (production path)

### 1. Tokens and density

```tsx
// app/root.css or layout — copy tokens.css or inject ERISTACK_CSS_VARS
import "@eristack/design-system/src/tokens.css";

import { DensityProvider } from "@eristack/design-system/react";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return <DensityProvider density="comfortable">{children}</DensityProvider>;
}
```

Tailwind: `presets: [tailwindPreset]` from `@eristack/design-system`. Apps run **`shadcn add`** locally; design-system does **not** ship a full component fork.

### 2. List screen

```tsx
import { useDataGridList } from "@eristack/data-grid/react";
import { ListPageLayout, ListToolbar, QueryStateBanner } from "@eristack/list-shell";
import { FilterChipBar } from "@eristack/filter-builder";

const query = useDataGridList({ basePath: "/api/partners", columns });

<ListPageLayout
  toolbar={<ListToolbar leading={<h1>Partners</h1>} trailing={<NewButton />} />}
  banner={<QueryStateBanner isLoading={query.isLoading} isError={query.isError} />}
>
  <FilterChipBar>{/* chips from parseSearch / serialize */}</FilterChipBar>
  {/* Table: your shadcn/data table bound to query.data */}
</ListPageLayout>
```

Export CSV/XLSX at the **app** boundary via `@eristack/spreadsheet-render` — not inside list-shell.

### 3. Document with QUPS lines

```tsx
import { DocShell, DocHeader, DocActionBar } from "@eristack/doc-shell";
import { LineGrid, useLineGridRecalc } from "@eristack/line-grid";
import { BusinessPolicyGate } from "@eristack/policy-ui";

<DocShell
  header={<DocHeader title={docNumber} badges={statusBadge} />}
  actions={
    <DocActionBar
      trailing={
        <BusinessPolicyGate policyId="invoice:post" allowed={canPost}>
          <button type="button">Post</button>
        </BusinessPolicyGate>
      }
    />
  }
>
  <LineGrid line={line} columns={cols} renderCell={renderLineCell} />
</DocShell>
```

Wire `allowed` from `@eristack/rbac/react` `useCan` and `@eristack/pbac/react` `useBusinessPolicy` when adapters are mounted.

### 4. Optional multitab + command palette

Wrap document routes with `@eristack/multitab/react/tanstack`. Register `useCommandPalette()` at app root; style dialog with Erista token classes.

---

## Peers and boundaries

| Package | Required peers (floors) | Optional |
| --- | --- | --- |
| design-system | `react`, `tailwindcss` | — |
| form-ui | `design-system@^0.1.0`, `money@^0.3.0`, `percent@^0.1.0`, `timestamp@^0.1.0` | — |
| list-shell | `design-system@^0.1.0`, `data-grid@^0.2.0`, `@tanstack/react-query@^5` | — |
| filter-builder | `data-grid@^0.2.0`, `form-ui@^0.1.0` | — |
| line-grid | `form-ui@^0.1.0`, `qups@^0.3.0`, `money@^0.3.0` | — |
| doc-shell | `design-system@^0.1.0` | `multitab@^0.2.0` |
| policy-ui | — | `rbac@^0.2.0`, `pbac@^0.2.0` |
| master-detail | `list-shell@^0.1.0` | — |
| command-palette | `react` | design-system tokens in CSS |

- String-first: form state matches API (`MoneyJSON`, wall `YYYY-MM-DD`, QUPS line strings).
- QUPS math lives in `@eristack/qups` only — UI calls `patchLine` via `line-grid` hooks.

---

## Compose with existing spine

```text
design-system → form-ui → line-grid ─┐
data-grid/react → list-shell → filter-builder
doc-number/react, multitab → doc-shell
rbac/pbac react → policy-ui
```

| User ask | Load first |
| --- | --- |
| ERP list + filters | `#ui-package-stack` → `list-shell` getting-started + `#data-grid-core` |
| Invoice / job lines UI | `#document-lines-erp` + `line-grid` + `form-ui` |
| Permissions on buttons | `#rbac-core` / `#pbac-core` + `policy-ui` |

---

## CI gates (monorepo)

Before merge: `pnpm build` · `pnpm exports:check` · `pnpm publish:check` · `pnpm changesets:check` · `pnpm knowledge:check` · `pnpm docs:check` (after `pnpm docs:sync`).

---

## Per-package docs

Each UI library has `packages/ui/<name>/docs/getting-started.md` — install line, peers, minimal example, production notes. Do not duplicate full API here; extend **this file** only for cross-package composition.
