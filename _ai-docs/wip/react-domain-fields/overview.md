---
status: draft
topic: react-domain-fields
promotes-to:
  - packages/ai/ai-knowledge/knowledge/react-domain-fields.md
  - packages/primitive/money/docs/react-fields.md
  - packages/primitive/timestamp/docs/react-fields.md
skills: []
recipes:
  - react-domain-fields-tanstack-form
---

# React domain field components (plan)

**Goal:** Ship **React input components** (and headless field primitives) so apps using **TanStack Form + shadcn** do not rebuild money boxes, timezone-aware dates, percent inputs, etc. on every screen.

**Not the same as today:** `@eristack/money/react` and `@eristack/timestamp/react` are **form-value helpers + validators only** — no `<input>` UI. This plan adds **field components** that wire those helpers to controlled inputs.

**Terminology:** “Higher-order” here means **domain-aware field components** (composition of label + control + errors + core parse/format), not legacy React `HOC()` wrappers.

---

## Principles

| Principle | Rule |
| --- | --- |
| Core stays pure | No `react` import in `src/core/` |
| String-first in state | Form state matches JSON/API: `{ currency, amount }`, `TimestampJSON`, ratio strings |
| Same parse on blur/submit | UI calls existing `submitMoneyFormValue`, `parseTimestampFormValue`, etc. |
| Headless before styled | Ship **headless** field API first; shadcn skin lives in app or optional UI package |
| TanStack Form first | Primary integration: `form.Field` + field validators from existing `./react` |
| App owns chrome | Labels, layout grids, i18n strings — library owns **value ↔ display** and **a11y hooks** |
| No ERP screens in libs | QUPS line grids, data-grid tables, multitab chrome stay app/`@eristack/data-grid`/`@eristack/multitab` |

---

## Two-tier architecture

```text
Tier 1 — Headless (per @eristack/* package, ./react/fields or ./react)
  useMoneyField, HeadlessMoneyField
  useTimestampField, HeadlessTimestampField (instant | wall mode)
  …

Tier 2 — Styled (optional, packages/ui/)
  @eristack/form-ui — MoneyInput, TimestampInput, PercentInput
  Peers: shadcn Input/Button/Popover, @eristack/money/react, …
  Apps may copy Tier 2 into `components/ui/` instead of installing form-ui
```

**Recommendation:** Implement **Tier 1 in owning primitive packages**; add **`@eristack/form-ui`** only after **two** headless fields prove the pattern (money + timestamp).

**Styled stack:** Full ERP UI order (design-system → form-ui → list-shell → line-grid → doc-shell) — `packages/ai/ai-knowledge/knowledge/ui-package-stack.md` (`@eristack/ai-knowledge#ui-package-stack`).

---

## Package placement

| Domain | Headless field home | Styled wrapper (later) |
| --- | --- | --- |
| Money | `@eristack/money/react` (extend exports) | `@eristack/form-ui/MoneyInput` |
| Timestamp | `@eristack/timestamp/react` | `TimestampInstantInput`, `TimestampWallInput` |
| Percent | `@eristack/percent/react` (new adapter) | `PercentInput` / `BasisPointsInput` |
| Fraction | `@eristack/fraction/react` (new) | `FractionInput` (n/d or mixed) |
| UOM qty | `@eristack/uom/react` (new) | `UomQuantityInput` (amount + unit select) |
| ISO country | `@eristack/iso-3166/react` (optional) | Combobox over assigned codes |
| Address | `@eristack/address/react` (new) | Multi-line address block (compose iso country field) |
| Party (Wave 13) | person/phone/email `./react` | Contact list editor (app or form-ui) |
| Doc number | `@eristack/doc-number/react` (extend hooks) | Format preview + sequence hint |
| Payment instrument | `@eristack/payment-instrument/react` | Last4 display + tokenized capture shell (no PAN field) |

**Export path convention (proposed):**

```json
"./react": { "...": "form helpers (existing)" },
"./react/fields": { "...": "headless field components + hooks" }
```

Single `./react` barrel re-export is OK if bundle size acceptable — prefer **subpath** when adding components (clearer docs).

---

## API sketch — money

**Headless**

```tsx
import { useMoneyField } from "@eristack/money/react/fields";

function SubtotalField({ field }: { field: MoneyFieldApi }) {
  const { amountInputProps, currency, setCurrency, displayAmount, error } =
    useMoneyField({
      field,
      defaultCurrency: "USD",
      allowCurrencyChange: false,
    });

  return (
    <>
      <input {...amountInputProps} inputMode="decimal" aria-invalid={!!error} />
      {error ? <span role="alert">{error}</span> : null}
    </>
  );
}
```

- **Display:** locale-aware grouping optional (`Intl.NumberFormat`) on blur; **edit** uses plain decimal string in state.
- **Submit:** unchanged — `submitMoneyFormValue(field.state.value)`.
- **Validators:** reuse `createMoneyFieldValidators`.

**Styled (form-ui)**

```tsx
import { MoneyInput } from "@eristack/form-ui/money";

<form.Field name="subtotal">
  {(field) => (
    <MoneyInput field={field} currency="IDR" label="Subtotal" />
  )}
</form.Field>
```

---

## API sketch — timestamp

| Mode | UX | State shape |
| --- | --- | --- |
| **instant** | UTC instant + IANA zone selector (or fixed zone) | `TimestampJSON` instant kind |
| **wall** | Local date (+ optional time) intent | `TimestampJSON` wall kind |

- Headless: `useTimestampField({ mode: 'instant' | 'wall', field, timezone? })`
- Avoid `<input type="datetime-local">` as sole path — document DST/wall rules; use explicit date + time parts or text ISO where skill dictates.
- Popover calendar: **Tier 2 only** (shadcn Calendar peer).

---

## TanStack Form integration (canonical)

One recipe: **`react-domain-fields-tanstack-form`**

```tsx
import { useForm } from "@tanstack/react-form";
import { createMoneyFieldValidators } from "@eristack/money/react";
import { MoneyInput } from "@eristack/form-ui/money"; // or headless + app Input

const form = useForm({
  defaultValues: { price: moneyFormValue({ currency: "USD", amount: "0" }) },
});

<form.Field
  name="price"
  validators={createMoneyFieldValidators({ required: true })}
>
  {(field) => <MoneyInput field={field} label="Unit price" />}
</form.Field>
```

Agents load: **`knowledge/react-domain-fields.md`** (promoted from this plan) + one package skill delta (`money-adapters` § Fields).

---

## Phased delivery

### Phase 0 — Design lock (no code)

- [ ] Confirm Tier 1 vs `@eristack/form-ui` split
- [ ] Export map: `./react/fields` subpath pattern
- [ ] Peer deps: `react`, `@tanstack/react-form`; Tier 2 adds `@radix-ui/*` via shadcn

### Phase 1 — Money (reference implementation)

- [ ] `useMoneyField`, `HeadlessMoneyField` + tests (testing-library, no snapshot soup)
- [ ] `money/docs/react-fields.md` + extend `money-adapters` skill
- [ ] Example snippet in `examples/react` (if exists) or money docs only

### Phase 2 — Timestamp

- [ ] `useTimestampField` instant + wall
- [ ] Docs mirror money

### Phase 3 — Percent + UOM

- [ ] `./react` form helpers where missing + headless fields
- [ ] Percent: `%` suffix display, bps mode toggle optional

### Phase 4 — `@eristack/form-ui` (optional package)

- [ ] `packages/ui/form-ui` — shadcn-aligned MoneyInput, TimestampInput
- [ ] Site + horizon; peers only, no core logic duplication
- [ ] **Do not** fork shadcn into every primitive package

### Phase 5 — Align Wave 13 + registries

- [ ] When person/phone/email ship: headless fields + form-ui skins
- [ ] Country combobox: iso-3166 + address block

### Phase 6 — Capability/service fields (lower priority)

- [ ] doc-number format preview field
- [ ] jwt-auth login fields (app-owned UX; library only validators)
- [ ] file-manager upload dropzone already exists — document vs new fields

---

## Boundaries (do not build here)

| Need | Owner |
| --- | --- |
| QUPS line editor / modifiers grid | App + `@eristack/qups` calculateLine |
| Data grid column filters | `@eristack/data-grid/react` |
| Full invoice document layout | App |
| Rich text email body | App; `email-template` is string render only |
| Spreadsheet grid UI | App / AG Grid; `spreadsheet-render` is export bytes |

---

## Testing & peers

- **Unit:** hook behavior (parse on blur, error messages) with `@testing-library/react`
- **No Storybook requirement** in v0 — docs copy-paste + optional example app
- **Peer matrix** (form-ui): `react ^18||^19`, `@tanstack/react-form`, `@eristack/money`, `@eristack/timestamp`, …

---

## Promotion checklist

- [ ] Canonical `packages/ai/ai-knowledge/knowledge/react-domain-fields.md`
- [ ] Recipe `react-domain-fields-tanstack-form`
- [ ] `architecture.md` / `stack-defaults.md` one paragraph: headless in packages, styled in form-ui or app
- [ ] `package-relationships.md` UI tier row
- [ ] Delete this WIP folder after promote

---

## Open questions

1. Single `@eristack/form-ui` vs styled components co-located in each package `./react/styled` (heavier peer graph)?
2. Currency selector: always separate field vs combined MoneyInput?
3. Publish `@eristack/form-ui` on npm or keep styled examples in `apps/web` only for v0?

**Default answers for planning:** (1) form-ui centralized styled, (2) combined with optional `allowCurrencyChange`, (3) publish form-ui once money+timestamp headless ship.
