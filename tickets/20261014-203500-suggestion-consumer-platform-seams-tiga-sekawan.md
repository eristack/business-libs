# Suggestion: Consumer platform seams from Tiga Sekawan (2026-10)

> Portable Eristack ticket — send this file to the maintainer. Feasibility is a first-pass gate for agents. This is one working brief. Split a row into its own ticket only when a maintainer starts that package.

## Meta

- **id:** `20261014-203500-suggestion-consumer-platform-seams-tiga-sekawan`
- **kind:** suggestion
- **package:** `@eristack/ai-knowledge` (program brief; child work lands in the packages named below)
- **feasibility:** `needs-decision`
- **created:** 2026-10-14T20:35:00+07:00
- **reporter:** Tiga Sekawan ERP (consumer)
- **source:** invoice print, tax master, AR/AP document chrome, and the workshop mirror already in this repo

## Summary

Tiga Sekawan is a document-with-lines forwarding ERP (jobs, cost sheets, AR/AP). The product rules stay in the app. This ticket is the platform glue we still wrote ourselves, plus the primitive gaps those screens exposed.

We are not asking for `@eristack/feature-job`, `@eristack/feature-invoice`, `@eristack/feature-forwarding`, a shipment-box package, or GL/stock.

Two groups:

1. **Primitives to grow** — tax, money, multitab, spreadsheet-operator, doc-shell, and one new FX-rate lookup.
2. **Seams every app repeats** — busy lock, error catalog, one Drizzle layer (client first, dialect-agnostic schema second), one collection declaration for Backseat and the backend, plus the smaller helpers that sit on those seams.

## User story

As the next document-lines app I want the headless machines Tiga Sekawan copied (busy, errors, dialect schema, Backseat-to-backend, tax catalog, document chrome) to come from Eristack, so the app only owns parties, jobs, charges, and which fields a printed invoice shows.

## Out of scope

- Indonesian PPN legal rules, terbilang wording, B/L field names, vessel/POL/POD.
- Partner, charge, tax, and bank masters as vertical packages. Masters stay app-owned. A picker helper is in scope. A master CRUD package is not.
- Replacing `@eristack/money` conversion. FX lookup is the missing piece. `Conversion.of` stays.

## Related tickets already in this repo

Do not reopen these as if they were new. Extend them when the row below overlaps.

| Existing                                                                                | Overlap                                                                      |
| --------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| `20260925-201506-suggestion-express-map-domain-error-unified-adapter-s9t0u1.md`         | Error catalog / `mapHandlerError`                                            |
| `20260827-141049-suggestion-optimistic-document-version-recipe-expectedversi-2ca365.md` | `expectedVersion` client                                                     |
| `20260925-201504-suggestion-drizzle-app-spine-bootstrap-bundle-m3n4o5.md`               | Dialect schema bundle (`needs-decision`)                                     |
| `20260925-201505-suggestion-document-store-port-aligned-with-backseat-p6q7r8.md`        | Store port                                                                   |
| `20260925-201500-suggestion-drizzle-backseat-store-atomic-sqlite-staging-a1b2c3.md`     | `atomic()` / `tx.set`                                                        |
| `20260925-201502-suggestion-dual-target-api-mirror-contract-testing-cli-g7h8i9.md`      | Mirror test is the proof for “one implementation”                            |
| `20260827-140917-suggestion-named-fx-helper-for-quote-per-base-conversion-us-192afd.md` | Money conversion helper. This brief adds the rate _lookup_, not the multiply |
| `20260827-141023-suggestion-react-patchline-on-commit-helpers-for-spreadshee-b0979b.md` | Spreadsheet commit                                                           |
| `20260827-140852-suggestion-wall-date-calendar-arithmetic-adddays-without-da-c88deb.md` | Wall dates                                                                   |
| `20260925-201503-suggestion-assignment-scope-sql-and-prefilter-parity-j0k1l2.md` | Branch and trade scope on lists and handlers. Do not reopen |
| `20260925-201507-suggestion-workshop-transport-client-dual-target-v2w3x4.md` | Dual-target fetch. Session refresh dedup is B10, not this ticket |

## Work items

### A. Grow existing primitives

#### A1. `@eristack/tax` — caller-supplied percentage catalog

- **feasibility:** `possible`
- **evidence:** `packages/domain/src/tax/percent.ts`, `packages/domain/src/tax/line-tax.ts`, `packages/domain/src/tax/app-tax-registry.ts`. The registry is the fallback when the master list is empty. The product catalog is `code`, `name`, `ratePercent` (strings like `1.1` and `11`), `deactivatedAt`.
- **behavior:** Accept a catalog of `{ code, ratePercent, active }`. Resolve a line’s rate from that catalog. Unknown code throws. Inactive codes stay resolvable for documents that already store them, and disappear from new picks. A document holds `printTaxCodes: string[]`. Empty means no tax. A company default applies only when the document has not chosen.
- **stays in the app:** Which codes exist (PPN 1.1, PPh 23), and that each enabled code is an additive percentage of the IDR print subtotal.

#### A2. `@eristack/money` — empty totals and percentage add-ons

- **feasibility:** `possible`
- **evidence:** AR detail called `Money.sum([])` and threw because the zero result had no currency. Print tax still rounds with `Math.round(Number(raw))` then `Money.of`.
- **behavior:** `Money.sum([])` requires a currency and returns that currency’s zero. A percentage of a subtotal (`1.1` → factor `0.011`) rounds with `Rounding.currencyDefault`. Amount-in-words is a hook the app fills per language. Indonesian terbilang stays in the app. Display formatting is already `formatMoney`. The app only pins `id-ID` in `packages/domain/src/money.ts`. Do not add a second formatter package.

#### A3. `@eristack/multitab` — replace the create tab

- **feasibility:** `possible`
- **evidence:** `apps/web/src/lib/multitab-open-route.ts` `replaceCreateTab`. `updateTab` no-ops when the tab id is missing and returns a new state whenever the tab exists, so an effect that always calls it loops.
- **behavior:** After a successful create, one call replaces the temporary new-tab with the new record’s id, title, and route. A failed create leaves the new-tab open. Capture the create path at mount, not the active tab at success time.
- **already shipped, app not using it:** `closeGuard` is read in `apps/web/src/components/multitab-app-shell.tsx` and never set. Dirty drafts should set it. That is adoption, not a new API.

#### A4. `@eristack/spreadsheet-operator` — pointer commit on select cells

- **feasibility:** `possible`
- **evidence:** Cost-sheet charge and tax selects. Mouse pick did not reach `onCommit` unless the app called `publish()`. Keyboard commit worked.
- **behavior:** Choosing an option with the pointer commits that cell the same way Enter does. The app does not race a blur timeout.

#### A5. `@eristack/doc-shell` — document heading

- **feasibility:** `partial`
- **evidence:** `apps/web/src/features/invoices/invoice-detail-page.tsx`. `@eristack/doc-shell` is already a dependency. AR/AP still built their own heading: number, status, one context line (party, job, outstanding), one primary action (`Record payment`, or `Save` and `Issue` on a draft), `Print`, and a More menu (print configuration, open job in a new tab, trace, void).
- **behavior:** Headless slots for that heading. The app supplies the labels and the commands. A second copy of the document number under the heading is not the default.

#### A6. New `@eristack/fx-rate` — period lookup, not conversion

- **feasibility:** `needs-decision`
- **evidence:** Cost sheet USD→IDR period master, “match order date”, rate stored as a decimal string. `@eristack/money` already converts with an app-supplied rate (see the 2026-08-27 FX helper ticket).
- **behavior:** Pair, inclusive period, rate string, `resolve(asOf)`. No market feed. No float rates.
- **decision:** New package versus a small module on `@eristack/money` that only looks up a rate and still calls `Conversion.of`.

#### A7. Recipe, not a package — print layout default vs document

- **feasibility:** `possible`
- **package:** `@eristack/ai-knowledge`
- **evidence:** `ar_print_settings` singleton and `invoices.print_shipment_fields` (`null` follows the company layout; an object is that invoice’s saved layout). `packages/domain/src/model/invoices/print-settings.ts`, `packages/workshop/src/routes/ar-print-settings.ts`, `PATCH /invoices/:id/print-settings`.
- **behavior:** Document the pattern only. Company default for locale, enabled tax codes, and a boolean field mask. A document with a null mask follows the live default. Saving a mask freezes that document. Field names stay in the app.

### B. Seams every app repeats

#### B1. Busy lock

- **feasibility:** `possible`
- **evidence:** `apps/web/src/lib/feedback/busy.tsx`. `run` is a counter cleared in `finally`. While a task is open the shell is inert and a lock dialog shows the latest label. A separate top bar watches React Query’s first fetch, in-flight mutations, and the router pending state. `useFeedback` is the only caller of `run`.
- **behavior:** Headless `createBusy()` with `run(work, label)`. Optional observer `{ fetching, mutating, navigating }` for a progress signal. The app paints the bar and the lock. Do not ship one visual as the only look.

#### B2. Error catalog and disposition

- **feasibility:** `possible`
- **evidence:** `packages/workshop/src/core/http.ts` `mapHandlerError` classifies `DomainError` by `startsWith("VALIDATION")`, `includes("LOCKED")`, and a hardcoded invoice-code list. `apps/web/src/lib/feedback/toast.ts` `errorMessage` returns `error.message`, so the toast shows the handler string. 404 “do not retry” lives in `apps/web/src/lib/query-client.ts`, separate from the toast.
- **behavior:** One record per code: HTTP status, retry or not, and the sentence a person sees. Log the raw message. Disposition: 404 → not-found page, no retry; version 409 → refetch and say the document changed; policy 409 → toast the rule; 401 → login. Extend `20260925-201506` rather than a second mapper.
- **stays in the app:** The wording of business rules (`Only draft invoices can be edited` can be the catalog entry the app registers).

#### B3. A Drizzle layer, in two steps

- **feasibility:** `needs-decision`
- **package:** a new `@eristack/drizzle` (name open). Not a domain package. Not a place that opens a connection from inside jwt-auth, epoch, or tax.
- **evidence:** `packages/db/src/client.ts` `createAppDatabase`. The file’s own comment says Eristack packages never open connections or run migrations, so every app copies this boot: resolve `sqlite` vs `pgsql` from `APP_DB_DIALECT` / `DATABASE_URL`, a Postgres pool (`max`, idle timeout, connect timeout, idle-client error log), lazy `better-sqlite3` so a Postgres deploy does not load the native module, `foreign_keys`, migrate the matching folder, and cast `NodePgDatabase` to `BetterSQLite3Database` so the rest of the app has one type. Schema pain is the second half: `packages/db/src/schema/erp.ts` `buildErpTables` casts builders because Postgres `jsonb` / `boolean` and SQLite `text` JSON / integer boolean are different types. Two migration trees (`packages/db/drizzle` and `packages/db/drizzle/pgsql`) and two journals. `packages/db/src/documents/store.ts` still branches on `appDbDialect`.
- **step 1 — client:** `openDrizzle({ schema, sqlitePath? })` returns `{ db, dialect, location }`. The app passes its schema and reads env. Defaults for pool size and idle time are arguments, with the same hardcoded defaults this app uses (`5`, `30_000`). Migrations folder follows the dialect. SQLite import stays lazy. Health output is a redacted URL or a file path, never the password. Packages still do not call this. The app does, once.
- **step 2 — schema recipe, same package:** text, flag, timestamp JSON, string list, json map, entity id, compiled to both dialects. `entityIdColumn(dialect)` is the precedent for one column. Partial indexes and `now()` stay an escape hatch. This is what removes the cast in step 1. Do not start step 2 as a second generator beside step 1.
- **spine tables:** `20260925-201504` asked for `createEristackSpineTables(dialect)` (jwt-auth, rbac, epoch, doc-number, optional backseat documents). That factory belongs in this layer once step 2 exists. The app still owns `users` and every business table. This layer composes the spine factories. It does not invent job or invoice tables.
- **decision:** One package with two steps, versus a recipe only (option A of `20260925-201504`). If the maintainer rejects a new package, step 1 is still worth a documented `createAppDatabase` example, and step 2 stays the cast pattern.

#### B4. One collection declaration for Backseat and the backend

- **feasibility:** `partial`
- **evidence:** Handlers are already shared (`registerRoute` in `packages/workshop`, Express via `bootWorkshopServer`). What is still written per collection: row mapping in `packages/db/src/documents/masters.ts` and `billing.ts`, a SQLite migration, a Postgres migration, seed, and truncate. Lists fork between in-memory Backseat execution and `executeDrizzleList`. `BackseatStore` has `atomic` / `tx.set` and no `store.set` (`packages/workshop/src/routes/invoices.ts` print-settings route).
- **behavior:** One declaration produces the document shape, both dialects, the row mapper, and a route that passes the same mirror test on IndexedDB and Drizzle. Idempotent create is a flag on the route. The mirror CLI from `20260925-201502` is the acceptance test.
- **decision:** This is the large item. B3 step 2 is the schema half. Do not start B4 until B3’s package decision is made. B4 may call `openDrizzle` from B3 step 1. It does not open its own pool.

#### B5. Feedback sequence

- **feasibility:** `possible`
- **evidence:** `apps/web/src/lib/feedback/confirm.tsx` `useFeedback`: confirm, then `busy(action)`, then success toast, or `toast.error(errorMessage(error))`.
- **behavior:** Headless order: confirm → run → success or classified error. The app owns the dialog and the toaster. Depends on B1 and B2.

#### B6. Document save client

- **feasibility:** `possible`
- **evidence:** Invoice and cost-sheet patches send `expectedVersion` from the screen and bump it in the domain. A print-settings save on a draft must not wipe unsaved commercial edits, and must not reset the form just because the version changed.
- **behavior:** Read version from the query cache, send it, on `CONFLICT_VERSION` refetch and surface B2’s message. Recipe extension of `20260827-141049`, plus a client helper.

#### B7. Wall-date field

- **feasibility:** `possible`
- **evidence:** Storage already uses `@eristack/timestamp`. `APP_TIMEZONE` is `Asia/Jakarta` in `packages/domain/src/time.ts`. Invoice date, due date (`addWallDays` in `dueAtFromInvoiceDate`), order date, document date, ETD/ETA/ATD/ATA, and payment date are wall clocks via `wallOf(..., APP_TIMEZONE)`. Cost-sheet approval is an instant via `now(APP_TIMEZONE)`. About a dozen screens still copy a `wallDate` helper that only reads `kind === "wall"` and slices `.local`. `formatPostedAt` exists and is not used by the UI, so an instant renders as "—".
- **behavior:** One read/write helper for a wall date in the company zone, and one display helper for an instant. Do not add a second timestamp model. A zone per branch or per user is not required while every business date is the company’s calendar day.

#### B8. Inactive-row picker

- **feasibility:** `possible`
- **evidence:** `apps/web/src/lib/masters/catalog.ts` `pickerMasters`. Taxes, banks, and charges: hide `deactivatedAt` rows from new picks; keep the row already stored on the document.
- **behavior:** `pickerMasters(rows, currentId)` as a ten-line helper next to master-detail docs. Not a master-data package.

#### B9. `@eristack/epoch` — bind a scope to a query key

- **feasibility:** `possible`
- **evidence:** `apps/web/src/data/epoch/use-epoch-invalidation.ts`. Every list and detail calls this. It watches `useEpochCurrent` and then `invalidateQueries({ queryKey })`. TanStack Query treats that key as a prefix, so a bump of `["jobs"]` also refetches the open job and can overwrite edits that were just written into the detail cache.
- **behavior:** `useEpochInvalidation(scope, queryKey, { exact: true })`. Prefix stays available for registers. Exact is the default for a detail key. The counter stays in `@eristack/epoch`. This helper is the missing React Query binding.

#### B10. `@eristack/jwt-auth` — one refresh in flight

- **feasibility:** `possible`
- **evidence:** `apps/web/src/lib/auth-client.ts`. The app wraps `client.refresh` with a single queue, `navigator.locks` so tabs do not rotate the same refresh token twice, three retries on a network blip, logout only when refresh returns 401 or 403, and resume on `visibilitychange`, `online`, and a storage event when another tab clears the access token.
- **behavior:** The client dedupes refresh in the tab and across tabs. A failed network keeps the refresh token. A rejected refresh clears the session. Do not fold this into `20260925-201507`. That ticket is the fetch transport. This one is refresh semantics.

#### B11. `@eristack/form-ui` — typeahead select

- **feasibility:** `partial`
- **evidence:** `apps/web/src/components/ui/searchable-select.tsx`, used for party, job, bank, port, and country. Options are `{ value, label, searchText }`, with a loading state and either client filter or a controlled search string.
- **behavior:** One combobox with that shape. `@eristack/form-ui` is already a dependency and these screens did not use it for this. If the package already has the combobox, this row is adoption and should be closed. If it does not, add the combobox there. Do not add a new package.

## Checked, and left out

- Branch and trade scope, dual-target fetch, and list projections already have tickets in the table above.
- The not-found page is the 404 row of B2. The panel chrome stays in the app.
- `formatAmount` is `formatMoney` plus a locale. Covered under A2.
- `closeGuard` is covered under A3 as adoption.

## Priority

| Order | Item                                                                        | Why first                                                                       |
| ----- | --------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| 1     | B1 busy, B2 errors, B5 feedback                                             | Every screen already depends on them                                            |
| 2     | A1 tax, A2 money                                                            | Invoice and cost-sheet math is wrong or app-owned where the primitive should be |
| 3     | A3 multitab, A4 spreadsheet commit, B6 save client, B7 wall date, B8 picker, B9 epoch query key, B10 refresh dedup, B11 typeahead | Small, and each removed a bug or a copy we hit in this app |
| 4     | A5 doc-shell heading, A7 print-layout recipe                                | UI and docs. No new runtime package for print layout                            |
| 5     | B3 Drizzle layer: client, then schema recipe, then B4 collection declaration | Largest. Client can ship before the schema recipe. B4 waits on that decision |
| 6     | A6 FX lookup                                                                | New package only if it does not collapse into `@eristack/money`                 |

## Feasibility rationale

`needs-decision` on the brief because A6 and B3/B4 change the package map. The other rows are `possible` or `partial` and can ship without that decision. Nothing here requires a vertical feature package.

## Implementation sketch

- B1: extract the counter and the observer from `apps/web/src/lib/feedback/busy.tsx`. Leave the sky bar and the lock dialog in the app, or accept them as an optional React skin.
- B2: replace the prefix sniff in `mapHandlerError` with a registered code table. Point `errorMessage` at that table. Fold 404 retry into the same record.
- A1: `resolveTaxRatePercentForCode(code, asOf, catalog)` is already the shape in `packages/domain/src/tax/line-tax.ts`. Move the catalog type into `@eristack/tax`. Keep `APP_TAX_CODES` as the app fallback.
- A2: `Money.sum(amounts, currency)` when `amounts` is empty. Percentage-of-subtotal via existing percent operators, not `Number`.
- B3: lift `packages/db/src/client.ts` into `openDrizzle` first. Leave `buildErpTables` in the app until step 2. Fold `20260925-201504` into step 2 instead of a second bootstrap package.
- B4: do not start until B3’s package decision is made.

## Risks

- A busy package that ships one overlay will not match every app’s chrome. Keep it headless.
- An error catalog that hardcodes Tiga Sekawan invoice codes becomes a feature package. The package owns status classes. The app registers business codes.
- A dialect recipe that hides partial indexes will be abandoned the first time Postgres needs one. Escape hatch is required.
- B3 step 2 done as its own package, beside the client, splits the dialect story in two. Keep client and schema recipe in one layer.
- A Drizzle layer that opens connections from feature packages breaks the rule that the app owns the pool.
- B4 done before B3 step 2 duplicates the cast mess inside the generator.

## Alternatives

- Leave all of this in Tiga Sekawan. It works. The next consumer copies `busy.tsx`, `mapHandlerError`, and `buildErpTables`.
- Split this file into one suggestion per row before any implementation. Do that when a row is picked up, not before.

## Agent handoff

1. Load `@eristack/ai-knowledge#document-lines-erp` and `@eristack/ai-knowledge#http-errors` before any row.
2. For the row you pick, load that package’s Intent skill. Do not implement a second row in the same change.
3. Consumer evidence stays in this repo. Do not move job, invoice, or partner types into Eristack.
4. Changesets on the package that changes. No `@eristack/feature-*`.

## Notes

Consumer paths worth opening first:

- `apps/web/src/lib/feedback/busy.tsx`
- `apps/web/src/lib/feedback/confirm.tsx`
- `apps/web/src/lib/feedback/toast.ts`
- `packages/workshop/src/core/http.ts`
- `packages/db/src/client.ts`
- `packages/db/src/schema/erp.ts`
- `packages/domain/src/tax/line-tax.ts`
- `apps/web/src/lib/multitab-open-route.ts`
- `apps/web/src/features/invoices/invoice-detail-page.tsx`
- `packages/domain/src/model/invoices/print-settings.ts`
- `apps/web/src/data/epoch/use-epoch-invalidation.ts`
- `apps/web/src/lib/auth-client.ts`
- `apps/web/src/components/ui/searchable-select.tsx`
