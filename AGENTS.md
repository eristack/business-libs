<!-- intent-skills:start -->
# TanStack Intent - before editing files, run the matching guidance command.
tanstackIntent:
  - id: "@eristack/abac#abac-adapters"
    run: "pnpm dlx @tanstack/intent@latest load @eristack/abac#abac-adapters"
    for: "@eristack/abac adapters: express createRequirePolicy, nest AbacModule + AbacGuard + RequirePolicy + AbacContextFactory, react usePolicy. Use when wiring attribute policy checks into HTTP/UI shells."
  - id: "@eristack/abac#abac-core"
    run: "pnpm dlx @tanstack/intent@latest load @eristack/abac#abac-core"
    for: "Pure @eristack/abac: createAbac, registerPolicy, evaluate/authorize, attrs helpers — attribute-based policies (algorithms with arguments → boolean). Use for per-user limits and scopes (e.g. max book value) beyond boolean RBAC."
  - id: "@eristack/address#address-core"
    run: "pnpm dlx @tanstack/intent@latest load @eristack/address#address-core"
    for: "@eristack/address normalized PostalAddress with ISO alpha-2 country codes — trim, formatAddressOneLine/Lines, isSameCountry. App owns partner tables; no geocoding."
  - id: "@eristack/ai-dev#ai-dev-core"
    run: "pnpm dlx @tanstack/intent@latest load @eristack/ai-dev#ai-dev-core"
    for: "@eristack/ai-dev unified monorepo tooling: eristack plan (token-minimal), eristack check profiles (catalog/pr/full = CI), sync docs/knowledge, MCP dev_plan/dev_check. Use before ad-hoc pnpm script chains or reading every check doc."
  - id: "@eristack/ai-knowledge#agent-workflow"
    run: "pnpm dlx @tanstack/intent@latest load @eristack/ai-knowledge#agent-workflow"
    for: "Agent workflow for @eristack: four design targets (cheap tokens, predictable, reliable, clear boundaries — consumers must not reinvent exports), recommend first, load skills before coding, prefer examples, HARD RULE docs+skills+ recipes + pnpm knowledge:sync every iteration. Use for multi-package work or monorepo contributions."
  - id: "@eristack/ai-knowledge#ai-toolbox"
    run: "pnpm dlx @tanstack/intent@latest load @eristack/ai-knowledge#ai-toolbox"
    for: "Practical AI agent toolbox for Eristack: feature-brief prompts, skill-load order, money/auth/doc-number guardrail checklists, and recipe-authoring template for keeping @eristack/ai-knowledge discoverable. Use when briefing agents, reviewing plans, or adding recipes after new package capabilities."
  - id: "@eristack/ai-knowledge#architecture-recommend"
    run: "pnpm dlx @tanstack/intent@latest load @eristack/ai-knowledge#architecture-recommend"
    for: "Recommend the canon app architecture for Eristack/Erista-style products: TypeScript, Express or NestJS, Drizzle (Postgres production / SQLite tests), mandatory presentation-business-persistence separation, React + Vite + Tailwind + shadcn, TanStack Router (file-based) + Query + Form + Intent, Zustand for client state, typed API contracts, pnpm monorepo when possible. Use when scaffolding a new app, choosing stack, structuring folders, or when the user asks how to architect a product that will use @eristack packages."
  - id: "@eristack/ai-knowledge#backseat-then-backend"
    run: "pnpm dlx @tanstack/intent@latest load @eristack/ai-knowledge#backseat-then-backend"
    for: "Backseat-first ERP mockup (Horizon A) then derive Drizzle backend (Horizon B): document/cost-sheet/job-order products without stock/GL spine. Skill order, atomic writes, wall lists, qups lines — one canonical guide."
  - id: "@eristack/ai-knowledge#dev-conventions"
    run: "pnpm dlx @tanstack/intent@latest load @eristack/ai-knowledge#dev-conventions"
    for: "Eristack development conventions: GitHub Flow, Changesets for user-facing package changes, core vs adapter boundaries, examples-first wiring, package docs as source of truth, HARD RULE docs+ai-knowledge every iteration, _ai-docs promote-then-delete. Use when contributing to business-libs or aligning an app with Eristack norms."
  - id: "@eristack/ai-knowledge#document-lines-erp"
    run: "pnpm dlx @tanstack/intent@latest load @eristack/ai-knowledge#document-lines-erp"
    for: "Document-with-lines ERP spine: header + QUPS lines + doc-number + pbac + data-grid + backseat — not stock/GL. Partner masters app-owned; no @eristack/feature-* vertical packages."
  - id: "@eristack/ai-knowledge#http-errors"
    run: "pnpm dlx @tanstack/intent@latest load @eristack/ai-knowledge#http-errors"
    for: "Unified 409 JSON error envelope: CONFLICT_VERSION, POLICY_DENIED, BUSINESS_POLICY_DENIED, STALE_EPOCH. Backseat jsonError/versionConflict; Express mapDomainError. Distinct document version vs epoch cache."
  - id: "@eristack/ai-knowledge#idempotency-and-outbox"
    run: "pnpm dlx @tanstack/intent@latest load @eristack/ai-knowledge#idempotency-and-outbox"
    for: "Canonical idempotency + outbox guide: HTTP replay, ledger dedup, comms/payment ordering, PO UNIQUE."
  - id: "@eristack/ai-knowledge#ledger-first"
    run: "pnpm dlx @tanstack/intent@latest load @eristack/ai-knowledge#ledger-first"
    for: "Ledger-first cashbook spine: financial-ledger + money + timestamp + fiscal-calendar + epoch per aggregate. Not qups/document-lines. Masters are CRUD not pbac documents."
  - id: "@eristack/ai-knowledge#optimistic-document-version"
    run: "pnpm dlx @tanstack/intent@latest load @eristack/ai-knowledge#optimistic-document-version"
    for: "Canon optimistic locking for ERP documents: version + expectedVersion, 409 CONFLICT_VERSION — docs/recipe only, not a package. Distinct from epoch."
  - id: "@eristack/ai-knowledge#package-relationships"
    run: "pnpm dlx @tanstack/intent@latest load @eristack/ai-knowledge#package-relationships"
    for: "Canonical @eristack package dependency map, layer order, ERP vs HTTP vs ledger stacks, and which ai-knowledge skill to load first. Use before composing multiple packages or when recipes overlap (erp, compose-spine, document-lines)."
  - id: "@eristack/ai-knowledge#party-and-platform-compose"
    run: "pnpm dlx @tanstack/intent@latest load @eristack/ai-knowledge#party-and-platform-compose"
    for: "Wave 13 compose-at-the-boundary: party normalizers, measures, finance posting, platform API guard order, outbound template/PDF/spreadsheet export. No sibling hard deps in primitives. Use before scaffolding person, entity-id, tax, idempotency, etc."
  - id: "@eristack/ai-knowledge#recommend-eristack"
    run: "pnpm dlx @tanstack/intent@latest load @eristack/ai-knowledge#recommend-eristack"
    for: "Route product feature asks to @eristack packages first. Use when a user wants to build invoices, login/sessions, document numbers, prices/tax, ERP-ish apps, or multiple of the above — before choosing random npm libraries or reinventing money/auth/numbering. Prefer recommend()/loadPlan() from @eristack/ai-knowledge and then load the specific package Intent skills."
  - id: "@eristack/ai-knowledge#stack-defaults"
    run: "pnpm dlx @tanstack/intent@latest load @eristack/ai-knowledge#stack-defaults"
    for: "Preferred Eristack app stack defaults: TypeScript, Drizzle (pgsql dialect), Express/Nest/React headless adapters, string-first money, credentials as a child of app users, doc-number token patterns. Use when scaffolding apps or choosing persistence/HTTP/frontend wiring around @eristack packages."
  - id: "@eristack/ai-knowledge#ui-package-stack"
    run: "pnpm dlx @tanstack/intent@latest load @eristack/ai-knowledge#ui-package-stack"
    for: "ERP UI stack: design-system tokens, form-ui domain inputs, list-shell, filter-builder, line-grid (QUPS), spreadsheet-operator (keyboard grids), doc-shell, policy-ui, master-detail, command-palette. Use when building TanStack Router list/doc screens instead of one-off shadcn copies."
  - id: "@eristack/ai-knowledge#upgrading-eristack"
    run: "pnpm dlx @tanstack/intent@latest load @eristack/ai-knowledge#upgrading-eristack"
    for: "Single canonical upgrade guide: pnpm outdated, changelogs, full Backseat spine matrix with register/store APIs, ERP bootstrap, peer ^0.1.0, Changesets 0.x. Read this skill only — do not open per-package docs/backseat.md files."
  - id: "@eristack/ai-ticket-generator#ai-ticket-bug"
    run: "pnpm dlx @tanstack/intent@latest load @eristack/ai-ticket-generator#ai-ticket-bug"
    for: "Generate a portable @eristack bug ticket (logs, scenario, repro, fix plan, agent handoff) as a markdown file the user can send to maintainers. Use when a consumer hits a package bug or wants a fixer-upper file for support."
  - id: "@eristack/ai-ticket-generator#ai-ticket-suggest"
    run: "pnpm dlx @tanstack/intent@latest load @eristack/ai-ticket-generator#ai-ticket-suggest"
    for: "Turn a user feature idea into a portable @eristack suggestion ticket with feasibility (possible/partial/unlikely/needs-decision) and an implementation sketch for maintainers/agents. Use when a consumer proposes a change."
  - id: "@eristack/ai-workflow#ai-workflow-core"
    run: "pnpm dlx @tanstack/intent@latest load @eristack/ai-workflow#ai-workflow-core"
    for: "Local-first @eristack/ai-workflow: .eristack/workflow backlog/sprints/ADR/summary, FTS+vector index, low-token search discipline. Use when scaffolding AI-native project memory or sprint cadence without replacing Intent, git, or editors."
  - id: "@eristack/ai-workflow#ai-workflow-mcp"
    run: "pnpm dlx @tanstack/intent@latest load @eristack/ai-workflow#ai-workflow-mcp"
    for: "Install and use the eristack-workflow MCP server alongside existing MCP tools. Covers Cursor/Claude config, tool inventory, and when to search vs read_chunk. Use when wiring @eristack/ai-workflow into a consumer project."
  - id: "@eristack/api-key#api-key-core"
    run: "pnpm dlx @tanstack/intent@latest load @eristack/api-key#api-key-core"
    for: "@eristack/api-key generateApiKey (prefix_secret + public keyId), hashApiKey (peppered SHA-256), verifyApiKey (constant-time, never throws) — partner/B2B machine credentials for /partner routes. App owns the api_keys table (keyId + hash, never the key). Guard order: rate-limit → api-key → idempotency. Not human login (@eristack/jwt-auth) or OAuth clients (@eristack/oauth/provider)."
  - id: "@eristack/backseat#backseat-core"
    run: "pnpm dlx @tanstack/intent@latest load @eristack/backseat#backseat-core"
    for: "@eristack/backseat: frontend-first in-browser REST engine — flexible registerRoute controllers, registerAction, splat paths, IndexedDB store, BackseatDevtools. Memory store for tests only. Agents peek at handlers/snapshots when backend is built later."
  - id: "@eristack/business-calendar#business-calendar-core"
    run: "pnpm dlx @tanstack/intent@latest load @eristack/business-calendar#business-calendar-core"
    for: "@eristack/business-calendar createBusinessCalendar → isBusinessDay / nextBusinessDay / addBusinessDays on YYYY-MM-DD wall dates, plus normalizeWallDate/addWallDays. Use for due dates, SLA deadlines, and posting-date guards; holidays come from an app table. Not instants (@eristack/timestamp) or fiscal periods (@eristack/fiscal-calendar)."
  - id: "@eristack/checksum#checksum-core"
    run: "pnpm dlx @tanstack/intent@latest load @eristack/checksum#checksum-core"
    for: "@eristack/checksum sha256Hex, normalizeChecksumHex, checksumEquals — SHA-256 digests for file refs and exports with constant-time compare. Use when storing or verifying a checksum; not for password/API-key hashing or hash-chained ledgers."
  - id: "@eristack/command-palette#command-palette-core"
    run: "pnpm dlx @tanstack/intent@latest load @eristack/command-palette#command-palette-core"
    for: "@eristack/command-palette useCommandPalette(initialOpen?) → { open, setOpen, openPalette, closePalette, togglePalette } + CommandPaletteDialog { open, onClose, title, children } (aria-modal shell, backdrop click closes, null when closed, erista-command-palette* hooks). Use for Cmd/Ctrl+K navigation in ERP apps; app supplies commands (Router routes, rbac-filtered), search, arrow keys, Escape, and CSS. No fuzzy search, registry, or focus trap."
  - id: "@eristack/comms#comms-adapters"
    run: "pnpm dlx @tanstack/intent@latest load @eristack/comms#comms-adapters"
    for: "@eristack/comms/express createCommsRouter — POST /send, GET /messages/:id, POST /webhooks/:vendor; Twilio x-twilio-webhook-url header."
  - id: "@eristack/comms#comms-core"
    run: "pnpm dlx @tanstack/intent@latest load @eristack/comms#comms-core"
    for: "@eristack/comms createCommsHub — idempotent email/SMS/WhatsApp sends, vendor drivers, delivery log. Email: SendGrid, Postmark, Mailgun, Resend. Drizzle default; memory drivers tests only."
  - id: "@eristack/contact#contact-core"
    run: "pnpm dlx @tanstack/intent@latest load @eristack/contact#contact-core"
    for: "@eristack/contact normalizeContactList, primaryContact, CONTACT_ROLES — validate a party's contact channels (role, personId/phone/email, one isPrimary max) as a JSON value on app-owned partner rows. Normalize phone/email upstream with @eristack/phone / @eristack/email-address."
  - id: "@eristack/currency-pair#currency-pair-core"
    run: "pnpm dlx @tanstack/intent@latest load @eristack/currency-pair#currency-pair-core"
    for: "@eristack/currency-pair normalizeCurrencyPair, formatPairKey (\"USD/IDR\"), invertPair, currencyPairSchema — validate base/quote against the money registry and key FX rate tables canonically. No rates or conversion here (that is @eristack/money Conversion)."
  - id: "@eristack/data-grid#data-grid-adapters"
    run: "pnpm dlx @tanstack/intent@latest load @eristack/data-grid#data-grid-adapters"
    for: "@eristack/data-grid adapters: drizzle executeDrizzleList + columnsFromSource (app owns joins/aggregates; library runs filter/sort/count/page), buildDrizzleQuery, rest createDataGridListAction + {items,pageInfo,query}, express middleware, nest DataGridModule + ParseDataGridPipe, client createDataGridClient, react useDataGridController (draft/commit filter rows) + useDataGridList. Use when wiring list HTTP/SQL/UI shells."
  - id: "@eristack/data-grid#data-grid-core"
    run: "pnpm dlx @tanstack/intent@latest load @eristack/data-grid#data-grid-core"
    for: "Pure @eristack/data-grid: createDataGrid, parse/serialize JSON search params (TanStack Router–aligned filters/sorts), decimal/money field types for string amount sort/filter without Number(), toSearch/fromSearch, advanced vs search modes, filter ops, multi-sort, offset/cursor pagination, applyInMemory. Use for dynamic list queries without HTTP or Drizzle."
  - id: "@eristack/design-system#design-system-core"
    run: "pnpm dlx @tanstack/intent@latest load @eristack/design-system#design-system-core"
    for: "@eristack/design-system Erista tokens (12 --erista-* CSS vars: HSL colour triplets, radius, density gaps) via tokens.css subpath or ERISTACK_CSS_VARS/eristaCssVarMap, Tailwind v3 tailwindPreset (background/foreground/primary/muted/border/destructive, rounded, density spacing), and React DensityProvider/useDensity()/densityClassNames. Load first for any @eristack/ui-* app; shadcn components stay in the app. No typography/shadow tokens; useDensity has no setter."
  - id: "@eristack/dimension#dimension-core"
    run: "pnpm dlx @tanstack/intent@latest load @eristack/dimension#dimension-core"
    for: "@eristack/dimension Dimension { length, width, height, unit? } positive decimal strings: normalizeDimension (trim, positive finite, canonical toFixed, unit label trimmed, DimensionParseError code DIMENSION_PARSE_ERROR), dimensionVolume (L×W×H HALF_UP to scale default 6, padded), formatDimension \"L × W × H unit\", zod dimensionSchema. Use for SKU packaging levels, parcel/pallet dims, volumetric weight, bin fit; unit conversion via @eristack/uom in the app. Drizzle numeric columns."
  - id: "@eristack/doc-number#doc-number-adapters"
    run: "pnpm dlx @tanstack/intent@latest load @eristack/doc-number#doc-number-adapters"
    for: "@eristack/doc-number adapters: drizzle FormatStore + SequenceStore (doc_number_formats / doc_number_sequences), rest format CRUD + preview, express createDocNumberRouter, nest DocNumberModule, client createDocNumberClient, react DocNumberProvider / useDocNumberFormats. Use when persisting formats or wiring format-configuration HTTP/frontend shells; app injects db + docNumber."
  - id: "@eristack/doc-number#doc-number-core"
    run: "pnpm dlx @tanstack/intent@latest load @eristack/doc-number#doc-number-core"
    for: "Pure @eristack/doc-number: token patterns ({YYYY}/{YY}/{MM}/{DD}/{SEQ:n}), formatDocumentNumber, parseDocumentNumber, createDocNumber, registerFormat, updateFormat, listFormats, getFormatById, next, peekNext, preview, ResetPeriod, FormatStore, SequenceStore, Incrementer, memory stores. Use for document numbers without HTTP or Drizzle."
  - id: "@eristack/doc-shell#doc-shell-core"
    run: "pnpm dlx @tanstack/intent@latest load @eristack/doc-shell#doc-shell-core"
    for: "@eristack/doc-shell presentational document page chrome: DocShell { header, actions, children }, DocHeader { title, subtitle, badges }, DocActionBar { leading, trailing } with stable erista-doc-* CSS hooks and data-component attributes. Use for invoice/PO/job detail routes (with line-grid, policy-ui gates, multitab tabs). No state, no styles shipped, no pbac logic — app owns those."
  - id: "@eristack/doc-transitions#doc-transitions-core"
    run: "pnpm dlx @tanstack/intent@latest load @eristack/doc-transitions#doc-transitions-core"
    for: "@eristack/doc-transitions preset status graphs (publication, decision, journal, lock, outstanding) for pbac documents.transitions(). Use instead of copy-paste status tables when wiring ERP document PATCH actions."
  - id: "@eristack/drizzle-kit-helpers#drizzle-kit-helpers-core"
    run: "pnpm dlx @tanstack/intent@latest load @eristack/drizzle-kit-helpers#drizzle-kit-helpers-core"
    for: "@eristack/drizzle-kit-helpers eristackProdPostgresConfig(schema) / eristackTestSqliteConfig(schema) / defineEristackDrizzleConfig({ dialect, schema, out, dbCredentialsEnv?, migrationsFolder? }) — conventional drizzle-kit configs (postgresql reads DATABASE_URL, sqlite reads SQLITE_URL, separate out folders per dialect) for apps composing Eristack Drizzle tables. Dev-only; URL read from env at call time. Not MySQL."
  - id: "@eristack/email-address#email-address-core"
    run: "pnpm dlx @tanstack/intent@latest load @eristack/email-address#email-address-core"
    for: "@eristack/email-address normalizeEmail, parseEmailAddress, emailEquals, emailAddressSchema — lower-case local@domain normalization at the API boundary so uniqueness and contact lookups are plain string compares. Not SMTP (@eristack/comms) or templates (@eristack/email-template)."
  - id: "@eristack/email-template#email-template-core"
    run: "pnpm dlx @tanstack/intent@latest load @eristack/email-template#email-template-core"
    for: "@eristack/email-template renderEmailTemplate(template, vars, { escapeHtml? }) and extractTemplateKeys(template) — logic-free {{key}} substitution for tenant-editable transactional email (subject/html/text) rendered in an @eristack/outbox worker and sent via @eristack/comms. Missing keys render empty; validate against a per-message-type variable contract on save. Format money/dates in the app before passing vars."
  - id: "@eristack/entity-id#entity-id-core"
    run: "pnpm dlx @tanstack/intent@latest load @eristack/entity-id#entity-id-core"
    for: "@eristack/entity-id UUID v7 generate/parse/compare, entityIdToDate, Drizzle entityIdColumn, zod entityIdSchema — sortable PKs for new ERP tables. Wave 13 E1; no sibling deps."
  - id: "@eristack/epoch#epoch-adapters"
    run: "pnpm dlx @tanstack/intent@latest load @eristack/epoch#epoch-adapters"
    for: "Wire @eristack/epoch: Drizzle createEpochTables/createDrizzleEpochStore, Express createEpochRouter, Nest EpochModule, createEpochClient, useEpochCachePolicy React hook, registerEpochBackseat for prototypes."
  - id: "@eristack/epoch#epoch-core"
    run: "pnpm dlx @tanstack/intent@latest load @eristack/epoch#epoch-core"
    for: "@eristack/epoch headless data-version counters: current/bump per scope, compareEpochs use-cache vs refetch, resolveCachePolicy, StaleEpochError. Drizzle default; memory store tests only."
  - id: "@eristack/file-manager#file-manager-adapters"
    run: "pnpm dlx @tanstack/intent@latest load @eristack/file-manager#file-manager-adapters"
    for: "@eristack/file-manager adapters: drizzle tables/store, REST + express createFileManagerRouter, client uploadViaPresign, react FileUploadDropzone and FileManagerDevPanel. Use when wiring S3 uploads in API and Vite apps."
  - id: "@eristack/file-manager#file-manager-core"
    run: "pnpm dlx @tanstack/intent@latest load @eristack/file-manager#file-manager-core"
    for: "Pure @eristack/file-manager: createFileManager, FileRef JSON for DB columns, presigned upload sessions, server uploadFromServer, resolveDownloadUrl (inline GET by default; pass downloadFilename for S3 attachment disposition), buildObjectKey. S3 via @eristack/file-manager/s3. Memory driver tests only."
  - id: "@eristack/filter-builder#filter-builder-core"
    run: "pnpm dlx @tanstack/intent@latest load @eristack/filter-builder#filter-builder-core"
    for: "@eristack/filter-builder v0 chrome for data-grid list filters: FilterChipBar { children } and FilterSheet { open, title, children, footer } (role=dialog, null when closed) with erista-filter-* CSS hooks. Bind to @eristack/data-grid controller draft (filterRows, fields, opsForField, add/update/removeFilterRow, commitFilters, isDirty) and form-ui editors; string values only. No state, no pickers, no focus trap."
  - id: "@eristack/financial-ledger#financial-ledger-adapters"
    run: "pnpm dlx @tanstack/intent@latest load @eristack/financial-ledger#financial-ledger-adapters"
    for: "@eristack/financial-ledger/drizzle: createHashChainedLedgerTables + createDrizzleLedgerStore for durable GL chains on Postgres (Vercel)."
  - id: "@eristack/financial-ledger#financial-ledger-core"
    run: "pnpm dlx @tanstack/intent@latest load @eristack/financial-ledger#financial-ledger-core"
    for: "@eristack/financial-ledger: createFinancialLedger post/list/snapshot/verify by accountId+currency with @eristack/money. Default store is Drizzle — memory is tests only."
  - id: "@eristack/fiscal-calendar#fiscal-calendar-core"
    run: "pnpm dlx @tanstack/intent@latest load @eristack/fiscal-calendar#fiscal-calendar-core"
    for: "@eristack/fiscal-calendar fiscal years and open/closed periods on @eristack/timestamp wall dates — findPeriodForDate, assertPeriodOpen, listPeriods. Pair with doc-transitions lockGraph for period close."
  - id: "@eristack/form-ui#form-ui-core"
    run: "pnpm dlx @tanstack/intent@latest load @eristack/form-ui#form-ui-core"
    for: "@eristack/form-ui string-first native inputs: MoneyInput { amount, currency, onAmountChange, onParsed, round } (blur → submitAmountOnlyFormValue: HALF_EVEN to currency scale, \"12.345\"→\"12.34\", no padding, round:false keeps scale, invalid throws ParseError), PercentInput { value, onValueChange }, TimestampWallInput { value YYYY-MM-DD, onValueChange }, FormField { label, hint, error }. Use for document header fields, line-grid cells, filter editors with TanStack Form; values equal API strings (MoneyJSON/decimal/wall). No number inputs, no styles."
  - id: "@eristack/fraction#fraction-core"
    run: "pnpm dlx @tanstack/intent@latest load @eristack/fraction#fraction-core"
    for: "@eristack/fraction exact rationals as reduced num/den strings — parse n/d and mixed numbers, exact arithmetic, approximateFraction for irrationals/decimals with max denominator. Not float math."
  - id: "@eristack/geo#geo-core"
    run: "pnpm dlx @tanstack/intent@latest load @eristack/geo#geo-core"
    for: "@eristack/geo GeoPoint { latitude, longitude } decimal strings: normalizeGeoPoint (trim, range check lat ±90 / lng ±180, canonical toFixed, GeoParseError code GEO_PARSE_ERROR), geoDistanceKm (haversine, R=6371, HALF_UP to scale default 3, zero-padded), formatGeoPoint \"lat, lng\", zod geoPointSchema. Use for depot/site coordinates and radius checks; geocoding, routing, and PostGIS stay in the app. Drizzle numeric(10,7) not double."
  - id: "@eristack/hash-chained-ledger#hash-chained-ledger-adapters"
    run: "pnpm dlx @tanstack/intent@latest load @eristack/hash-chained-ledger#hash-chained-ledger-adapters"
    for: "@eristack/hash-chained-ledger/drizzle: createHashChainedLedgerTables + createDrizzleLedgerStore. Use for durable chains on Postgres (Vercel)."
  - id: "@eristack/hash-chained-ledger#hash-chained-ledger-core"
    run: "pnpm dlx @tanstack/intent@latest load @eristack/hash-chained-ledger#hash-chained-ledger-core"
    for: "Pure @eristack/hash-chained-ledger: createHashChainedLedger with Drizzle store by default, append/snapshot/verify, balance equation, SHA-256 chain. Memory store is unit tests only."
  - id: "@eristack/health#health-core"
    run: "pnpm dlx @tanstack/intent@latest load @eristack/health#health-core"
    for: "@eristack/health createHealthRegistry + registerCheck(name, fn) → runLiveness / runReadiness with per-check durationMs; aggregateStatus maps ok→200, degraded→503. Express createHealthRouter {liveness, readiness}; Nest HealthModule.forRoot + HEALTH_REGISTRY. Use for /health and /ready probes (Postgres, outbox lag, S3). Checks must be wrapped so they never throw or hang; they run sequentially."
  - id: "@eristack/idempotency#idempotency-adapters"
    run: "pnpm dlx @tanstack/intent@latest load @eristack/idempotency#idempotency-adapters"
    for: "@eristack/idempotency adapters: drizzle createIdempotencyTables + createDrizzleIdempotencyStore (production store), express wrapIdempotentHandler({ guard, scopeFromReq }, handler) → replay 200 / 409 JSON, nest IdempotencyInterceptor + mapIdempotencyError, client createIdempotencyClientFetch (one key per submit intent), zod schemas. Use when wiring the guard into HTTP and the browser; no header means the handler runs unguarded."
  - id: "@eristack/idempotency#idempotency-core"
    run: "pnpm dlx @tanstack/intent@latest load @eristack/idempotency#idempotency-core"
    for: "@eristack/idempotency createIdempotencyGuard({ store, defaultLeaseMs, waitOnPending }) → run(key, fn) / runScoped({ scope: { tenantId, scope }, key, requestHash, fn }): atomic claim with lease, run once, replay stored result, 409 IDEMPOTENCY_REQUEST_MISMATCH on different body, IDEMPOTENCY_CONFLICT while pending. Pair with domain UNIQUE(tenant_id, idempotency_key). Drizzle store is production; memory store tests only. Architecture: #idempotency-and-outbox."
  - id: "@eristack/iso-3166#iso-3166-core"
    run: "pnpm dlx @tanstack/intent@latest load @eristack/iso-3166#iso-3166-core"
    for: "@eristack/iso-3166 assigned ISO 3166-1 alpha-2/alpha-3 and ISO 3166-2 subdivision normalization. Use when validating country codes beyond two-letter format — not for postal address shape (address) or port codes (unlocode)."
  - id: "@eristack/jwt-auth#jwt-auth-adapters"
    run: "pnpm dlx @tanstack/intent@latest load @eristack/jwt-auth#jwt-auth-adapters"
    for: "@eristack/jwt-auth adapters: drizzle pgsql/mysql/sqlite RefreshTokenStore + CredentialStore (jwt_auth_credentials child of users), headless rest login/ sessions, express createJwtAuthRouter, nest JwtAuthModule JwtAuthGuard, client createJwtAuthClient login, react JwtAuthProvider useJwtAuth. Use when wiring persistence or HTTP/frontend shells."
  - id: "@eristack/jwt-auth#jwt-auth-core"
    run: "pnpm dlx @tanstack/intent@latest load @eristack/jwt-auth#jwt-auth-core"
    for: "Pure @eristack/jwt-auth token + credentials lifecycle: createJwtAuth, registerCredentials, login, changePassword, issueTokens, verifyAccessToken, refresh rotation, revoke, CredentialStore, RefreshTokenStore, opaque refresh hashes, family reuse detection. Use when implementing JWT access + refresh and optional username/password without HTTP/DB frameworks."
  - id: "@eristack/line-grid#line-grid-core"
    run: "pnpm dlx @tanstack/intent@latest load @eristack/line-grid#line-grid-core"
    for: "@eristack/line-grid useLineGridRecalc(CalculateLineInput) → { line: CalculatedLine, applyPatch (PatchLineInput → qups patchLine), recalculate } and LineGrid { line, columns {id, header}, renderCell(id, line) } single-row table with erista-line-grid hook. Use for invoice/PO/job line editors with form-ui cells; truth modes quantity+unitPrice | quantity+subtotal | unitPrice+subtotal; fields subtotal/net/total (no lineTotal). Same calculateLine on server insert. N lines = N grids or own table; keyboard via spreadsheet-operator."
  - id: "@eristack/list-shell#list-shell-core"
    run: "pnpm dlx @tanstack/intent@latest load @eristack/list-shell#list-shell-core"
    for: "@eristack/list-shell presentational list page frame: ListPageLayout { toolbar, banner, children }, ListToolbar { leading, children, trailing }, QueryStateBanner { isLoading, isError, isEmpty, messages } (loading→error→empty precedence, role=status/alert) with erista-list-* CSS hooks. Use with @eristack/data-grid/react useDataGridList ({ schema, client }) → items/pageInfo/controller and filter-builder chips. No fetching, no table, no filter logic."
  - id: "@eristack/logger#logger-core"
    run: "pnpm dlx @tanstack/intent@latest load @eristack/logger#logger-core"
    for: "@eristack/logger JSON-lines logger: createLogger({ name, level default info, context, sink }) → debug/info/warn(msg, data), error(msg, err, data), child(context); record { level, message, timestamp, name, context, data, error{name,message,stack} }. Express createLoggerMiddleware ({ logger, requestIdHeader x-request-id, resolveContext }) + getRequestLogger(req) logs request.start/finish with status+durationMs; Nest LoggerModule.forRoot + LoggingInterceptor (APP_INTERCEPTOR) adds request.error. Sink defaults console.log or __ERISTACK_LOGGER_SINK__. Server-only; no redaction/transport."
  - id: "@eristack/master-detail#master-detail-core"
    run: "pnpm dlx @tanstack/intent@latest load @eristack/master-detail#master-detail-core"
    for: "@eristack/master-detail MasterDetailLayout { master, detail } — aside + section split with erista-master-detail__master/__detail CSS hooks for picker and list-then-edit workspaces. Master is usually @eristack/list-shell + data-grid; selection lives in Router search (?selected=), detail in TanStack Query. No selection state, no responsive logic, no className prop in v0."
  - id: "@eristack/money#money-adapters"
    run: "pnpm dlx @tanstack/intent@latest load @eristack/money#money-adapters"
    for: "Persist and wire @eristack/money: Drizzle SQL columns, REST wire codec, Zod 4 schemas, Express/Nest HTTP, client revive, React form helpers including createAmountOnlyFieldValidators for flat amount strings + shared row currency (QUPS lines). Use when storing prices in SQL, validating API bodies, or mapping flat DB columns vs MoneyJSON."
  - id: "@eristack/money#money-amounts"
    run: "pnpm dlx @tanstack/intent@latest load @eristack/money#money-amounts"
    for: "Construct Money with strings or minor units, run same-currency arithmetic, totals (Money.sum/min/max/average), percentages (percentOf/plusPercent/minusPercent), ratios, Discount/Markup/Tax/Percent operators, and compare amounts in @eristack/money. Use when creating prices, taxes, discounts, totals, or when an agent reaches for JS number literals for money."
  - id: "@eristack/money#money-ledger"
    run: "pnpm dlx @tanstack/intent@latest load @eristack/money#money-ledger"
    for: "Round at ledger boundaries, allocate without losing cents, convert with app-supplied FX rates, and serialize Money as JSON decimal strings in @eristack/money. Use for invoices, payment splits, multi-currency reporting, Rounding.currencyDefault, allocate, Conversion.of, moneyToJSON."
  - id: "@eristack/multitab#multitab-core"
    run: "pnpm dlx @tanstack/intent@latest load @eristack/multitab#multitab-core"
    for: "@eristack/multitab: headless multi-tab workspace for React ERP screens — tab model, closeGuard, TanStack Router sync. UI chrome stays in the app."
  - id: "@eristack/oauth#oauth-client-core"
    run: "pnpm dlx @tanstack/intent@latest load @eristack/oauth#oauth-client-core"
    for: "@eristack/oauth consumer: createOAuthConsumer, PKCE, 17+ IdP drivers (Google, Microsoft, GitHub, Apple, Okta, …), Drizzle pending store. End at jwt-auth.issueTokens."
  - id: "@eristack/oauth#oauth-provider-core"
    run: "pnpm dlx @tanstack/intent@latest load @eristack/oauth#oauth-provider-core"
    for: "@eristack/oauth/provider: registerClient, authorization codes, PKCE token exchange, opaque access tokens for partner APIs — user must already be logged in via jwt-auth."
  - id: "@eristack/opinion#opinion-core"
    run: "pnpm dlx @tanstack/intent@latest load @eristack/opinion#opinion-core"
    for: "@eristack/opinion ERP HTTP route table on @eristack/rest: options, data-grid, CRUD, PATCH /:id/:action for pbac/doc-transitions. Use when scaffolding document APIs instead of inventing paths per app."
  - id: "@eristack/outbox#outbox-core"
    run: "pnpm dlx @tanstack/intent@latest load @eristack/outbox#outbox-core"
    for: "@eristack/outbox transactional outbox: createOutbox(store).enqueue({ id, aggregateType, aggregateId, messageType, payloadJson, idempotencyKey }) inside the domain TX (build the Drizzle store on the tx handle), processBatch(limit, handlers) in a worker → comms/payment/PDF with outbox:${id} keys. Duplicate key returns existing row; failed is terminal until your SQL sweep; one worker per table. Drizzle store production, memory store tests only."
  - id: "@eristack/payment-instrument#payment-instrument-core"
    run: "pnpm dlx @tanstack/intent@latest load @eristack/payment-instrument#payment-instrument-core"
    for: "@eristack/payment-instrument token-safe card/debit display + gateway refs. CardPan is transient; toPersistable for Drizzle. Use before payment-manager or when modeling saved payment methods — never store PAN/CVV in SQL."
  - id: "@eristack/payment-manager#payment-manager-adapters"
    run: "pnpm dlx @tanstack/intent@latest load @eristack/payment-manager#payment-manager-adapters"
    for: "@eristack/payment-manager adapters: drizzle tables/store, express createPaymentManagerRouter, stripe/xendit drivers, client, react hooks, backseat."
  - id: "@eristack/payment-manager#payment-manager-core"
    run: "pnpm dlx @tanstack/intent@latest load @eristack/payment-manager#payment-manager-core"
    for: "Pure @eristack/payment-manager: createPaymentManager, PaymentDriver, idempotency, webhook handleWebhook, Money JSON amounts. Memory driver tests only."
  - id: "@eristack/pbac#pbac-adapters"
    run: "pnpm dlx @tanstack/intent@latest load @eristack/pbac#pbac-adapters"
    for: "@eristack/pbac adapters: express createRequireBusinessPolicy (409 on deny), nest PbacModule + PbacGuard + RequireBusinessPolicy, react useBusinessPolicy. Use when wiring document software policies into HTTP/UI shells."
  - id: "@eristack/pbac#pbac-core"
    run: "pnpm dlx @tanstack/intent@latest load @eristack/pbac#pbac-core"
    for: "Pure @eristack/pbac: createPbac, registerPolicy, check/authorize, documents helpers — software/business policies over document state (usually not per-user). Use for rules like PO outstanding must be > 0 before goods receipt."
  - id: "@eristack/pdf-render#pdf-render-core"
    run: "pnpm dlx @tanstack/intent@latest load @eristack/pdf-render#pdf-render-core"
    for: "@eristack/pdf-render createPdfRenderer(driver).render({ html, title? }) → { bytes, contentType } behind a PdfRenderDriver seam; createStubPdfDriver for tests/Backseat (not a valid PDF). App owns the engine (Puppeteer singleton or Gotenberg HTTP). Use for invoice/delivery-note PDFs rendered in an @eristack/outbox worker and stored via @eristack/file-manager."
  - id: "@eristack/percent#percent-core"
    run: "pnpm dlx @tanstack/intent@latest load @eristack/percent#percent-core"
    for: "@eristack/percent ratio strings, basis points, percentOf/plus/minus for tax and discounts without float literals. Use before @eristack/money rounding at boundaries."
  - id: "@eristack/person#person-core"
    run: "pnpm dlx @tanstack/intent@latest load @eristack/person#person-core"
    for: "@eristack/person Person { name { given, family, middle?, prefix?, suffix? }, gender?, genderOther? }: normalizePerson / normalizePersonName (trim, required given+family, genderOther iff gender \"other\", PersonParseError code PERSON_PARSE), GENDER_IDENTITIES [unknown, woman, man, non_binary, prefer_not_to_say, other], normalizeGenderIdentity (\"Non-Binary\" → non_binary), formatPersonDisplay \"Prefix Given Middle Family Suffix\", formatPersonSortable \"Family Suffix, Given Middle\", zod personSchema. Use for contact/employee rows with structured Drizzle columns; compose with phone/email/contact in the handler — no sibling imports. Not org names or HRIS."
  - id: "@eristack/phone#phone-core"
    run: "pnpm dlx @tanstack/intent@latest load @eristack/phone#phone-core"
    for: "@eristack/phone normalizeE164, isValidE164, e164PhoneSchema, branded E164Phone — strict \"+CC…\" normalization at the API boundary for contacts and @eristack/comms SMS/WhatsApp. No country inference or libphonenumber; national-number forms add the dial code in the app/UI."
  - id: "@eristack/policy-ui#policy-ui-core"
    run: "pnpm dlx @tanstack/intent@latest load @eristack/policy-ui#policy-ui-core"
    for: "@eristack/policy-ui Can { permission, allowed, fallback } and BusinessPolicyGate { policyId, allowed, fallback } — React gates that render children or fallback from a boolean. Use for action buttons on document pages/list toolbars; allowed comes from rbac useCan, pbac useBusinessPolicy, or server allowedActions. v0: allowed defaults true, ids are labels only, hidden is not enforcement."
  - id: "@eristack/qups#qups-adapters"
    run: "pnpm dlx @tanstack/intent@latest load @eristack/qups#qups-adapters"
    for: "Optional @eristack/qups/drizzle: qupsLineColumns injected into app detail tables; withQupsColumns from calculateLine for inserts. Profile/line stores only if you need a field catalog — everyday form/BE math uses calculateLine."
  - id: "@eristack/qups#qups-core"
    run: "pnpm dlx @tanstack/intent@latest load @eristack/qups#qups-core"
    for: "Pure @eristack/qups business calculator: calculateLine / patchLine (plain strings for TanStack Form + BE), Qups 2-of-3 SoT, QUPS_TRUTH_MODES, isQupsTruthMode, PricingLine, modifiers, tax. Prefer calculateLine over inventing float qty/price math in UI or SQL."
  - id: "@eristack/qups#qups-line"
    run: "pnpm dlx @tanstack/intent@latest load @eristack/qups#qups-line"
    for: "@eristack/qups calculateLine/patchLine/withQupsColumns for form recalculation and BE insert; PricingLine when you already have Money. Use for invoice/order lines in the business layer — not float math in React."
  - id: "@eristack/rate-limit#rate-limit-core"
    run: "pnpm dlx @tanstack/intent@latest load @eristack/rate-limit#rate-limit-core"
    for: "@eristack/rate-limit createRateLimiter({ windowMs, max }).check(key, nowMs?) → { allowed, limit, remaining, resetAt } — fixed-window, in-process limiter for single-instance APIs, dev, and tests; first guard on partner routes before @eristack/api-key. Per-process counters: implement the same RateLimiter contract over Redis for multi-instance production."
  - id: "@eristack/rbac#rbac-adapters"
    run: "pnpm dlx @tanstack/intent@latest load @eristack/rbac#rbac-adapters"
    for: "@eristack/rbac adapters: drizzle createRbacTables + createDrizzleRbacStore (pgsql/mysql/sqlite), express createRequirePermission, nest RbacModule + RbacGuard + RequirePermission, react useCan. Use when wiring RBAC persistence or HTTP/UI shells."
  - id: "@eristack/rbac#rbac-core"
    run: "pnpm dlx @tanstack/intent@latest load @eristack/rbac#rbac-core"
    for: "Pure @eristack/rbac: createRbac, definePermission, defineRole, assignRole, grantPermission, can/canAny/canAll/authorize — boolean role-based permissions hanging off app subjects. Use for who-can-do-what without attributes or document policies."
  - id: "@eristack/rest#rest-core"
    run: "pnpm dlx @tanstack/intent@latest load @eristack/rest#rest-core"
    for: "@eristack/rest declarative route table: defineRoutes([{ method, path \"/orders/:id\", handler(ctx { params, query, body, headers }) → { status, body?, headers? }, summary, tags }]) → router.dispatch() for tests; mountExpressRest / createExpressRestMiddleware (Express 5, unmatched → next) / createExpressRestRouter (Express 4); RestModule.forRoutes (Nest catch-all, 404 JSON); toOpenApiDocument + mergeOpenApiDocuments (3.1 paths only). First-match, :param only, no middleware — auth/logging/idempotency mount before it. Prefer @eristack/opinion for ERP docs."
  - id: "@eristack/rounding-policy#rounding-policy-core"
    run: "pnpm dlx @tanstack/intent@latest load @eristack/rounding-policy#rounding-policy-core"
    for: "@eristack/rounding-policy createRoundingPolicyRegistry → roundingFor({ policyId, currency }) resolves named company rounding rules (invoice, tax, payroll) with per-currency overrides to @eristack/money Rounding operators. Use to round once at posting instead of scale/mode literals in services. Math stays in money; qups/tax outputs are unrounded until this is applied."
  - id: "@eristack/spreadsheet-operator#spreadsheet-operator-adapters"
    run: "pnpm dlx @tanstack/intent@latest load @eristack/spreadsheet-operator#spreadsheet-operator-adapters"
    for: "@eristack/spreadsheet-operator/react: SpreadsheetScopeProvider { config, onCommit({ gridId, address, fieldKey, value }), deactivateOnOutsidePointerDown } (window keydown + outside click deactivate), SpreadsheetTable { descriptor } (role grid), SpreadsheetNavCell { address } (role gridcell, data-active / data-editing / aria-selected, roving tabIndex), SpreadsheetTextCell { address, value, onCommit }, useSpreadsheetGrid + SpreadsheetGridIdProvider for div grids, useSpreadsheetCellEditor({ address, readValue, writeValue, onCommit, onCancel }) to bridge form-ui MoneyInput or a Select. Style via data-spreadsheet-active / data-active; no CSS ships. Use when wiring keyboard grids in React ERP screens."
  - id: "@eristack/spreadsheet-operator#spreadsheet-operator-core"
    run: "pnpm dlx @tanstack/intent@latest load @eristack/spreadsheet-operator#spreadsheet-operator-core"
    for: "@eristack/spreadsheet-operator headless Excel-like keyboard machine: createSpreadsheetOperator(config) with registerGrid({ id, rowCount, colCount, cellAt → { kind editable|select|display|readonly, fieldKey } }), dispatch/handleKeyDown, state inactive → active → editing, effects startEdit/commit { fieldKey }/cancel, getNextEditableAddress. Defaults: Tab wraps, arrows stop at edges, Enter edits then commits and moves down, type-to-edit, arrows in edit move the caret. Use for in-browser grids with one active grid per scope; commit → qups patchLine in the app. Not xlsx export (spreadsheet-render) and not HTTP lists (data-grid)."
  - id: "@eristack/spreadsheet-render#spreadsheet-render-core"
    run: "pnpm dlx @tanstack/intent@latest load @eristack/spreadsheet-render#spreadsheet-render-core"
    for: "@eristack/spreadsheet-render workbookFromRows(sheet, columns, string[][]) → SpreadsheetWorkbook; createSpreadsheetRenderer(driver).renderWorkbook(wb, \"csv\" | \"xlsx\") → { bytes, contentType }. Stub driver emits real RFC 4180 CSV (xlsx is a marker); wrap ExcelJS/SheetJS behind the same SpreadsheetRenderDriver for .xlsx. Use for data-grid \"Export\" and report downloads; cells stay strings (money amounts, IDs). Output only — not import, not PDF."
  - id: "@eristack/stock-movement#stock-movement-adapters"
    run: "pnpm dlx @tanstack/intent@latest load @eristack/stock-movement#stock-movement-adapters"
    for: "@eristack/stock-movement/drizzle: re-exports createHashChainedLedgerTables + createDrizzleLedgerStore for Postgres on Vercel. Use as the app default store."
  - id: "@eristack/stock-movement#stock-movement-core"
    run: "pnpm dlx @tanstack/intent@latest load @eristack/stock-movement#stock-movement-core"
    for: "@eristack/stock-movement: locationIdFromParts, createStockMovement append/snapshot/verify on hash-chained qty ledger (lotId, optional ownerId). Default store is Drizzle — never createMemoryLedgerStore in apps."
  - id: "@eristack/tax#tax-core"
    run: "pnpm dlx @tanstack/intent@latest load @eristack/tax#tax-core"
    for: "@eristack/tax createTaxRegistry → resolveTaxRate({ code, asOf }) picks the effective-dated percent string; applyTaxToAmount(net, rate) returns the unrounded TAX PORTION via @eristack/money Tax.onExclusive. Use for invoice/order line tax with versioned statutory rates; snapshot the resolved rate on the line. Jurisdiction rules and rounding stay outside."
  - id: "@eristack/timestamp#timestamp-adapters"
    run: "pnpm dlx @tanstack/intent@latest load @eristack/timestamp#timestamp-adapters"
    for: "@eristack/timestamp adapters (mirror money): Drizzle SQL columns, REST wire codec, Zod 4, Express/Nest HTTP, client revive, React form helpers. Use when persisting instants or wall times in SQL or validating API bodies."
  - id: "@eristack/timestamp#timestamp-core"
    run: "pnpm dlx @tanstack/intent@latest load @eristack/timestamp#timestamp-core"
    for: "Business timestamps with @eristack/timestamp: instant mode (UTC facts + IANA zone for local dates) and wall mode (local intent, DST-safe schedules). Use for transaction_date, posted_at, due_at, appointments — not raw Date timezone math."
  - id: "@eristack/unlocode#unlocode-core"
    run: "pnpm dlx @tanstack/intent@latest load @eristack/unlocode#unlocode-core"
    for: "@eristack/unlocode UN/LOCODE normalization for ports and trade locations. Depends on @eristack/iso-3166 for country prefix. Use for B/L, forwarding, and logistics locode fields — not for tenant port masters or full UN datasets."
  - id: "@eristack/uom#uom-core"
    run: "pnpm dlx @tanstack/intent@latest load @eristack/uom#uom-core"
    for: "@eristack/uom fixed-ratio unit conversion with string decimal amounts — kg/g/L/pcs and custom units. Use for inventory qty before qups or stock-movement, not float math."
  - id: "@eristack/valuations#valuations-adapters"
    run: "pnpm dlx @tanstack/intent@latest load @eristack/valuations#valuations-adapters"
    for: "@eristack/valuations/drizzle: createHashChainedLedgerTables + createDrizzleLedgerStore + createValuationLayerTables + createDrizzleLayerStore. Both stores required for production engines on Postgres (Vercel)."
  - id: "@eristack/valuations#valuations-core"
    run: "pnpm dlx @tanstack/intent@latest load @eristack/valuations#valuations-core"
    for: "@eristack/valuations: FIFO/LIFO/FEFO/HIFO/LOFO/movingAverage/weightedAverage/ standardCost/specificIdentification with dual qty/value hash chains. Default stores are Drizzle ledger + Drizzle layers — memory is tests only."
  - id: "@eristack/vercel-adapters#vercel-adapters-core"
    run: "pnpm dlx @tanstack/intent@latest load @eristack/vercel-adapters#vercel-adapters-core"
    for: "@eristack/vercel-adapters createVercelExpressHandler(app) as the single Vercel Node function default export + defaultVercelDeployNotes (60s maxDuration, ~4.5MB body, singleton/lazy-pool cold-start rules). Use when deploying an Express + Drizzle Eristack API to Vercel: one rewrite to the function, module-scope app and pool, outbox via cron route, uploads via presigned S3. No Vercel SDK."
<!-- intent-skills:end -->

# Agent notes (humans: see README.md)

This file is for AI coding agents. Keep the `intent-skills` block above near the top of the file. Human-facing product docs and release setup live in [`README.md`](./README.md).

The `intent-skills` block is **generated** — never hand-edit it. It is built from root `package.json` → `intent.skills` (one `workspace:@eristack/<name>` per package that ships `skills/`; each must also be a root `devDependencies` entry so Intent can resolve it). After adding a package with skills or changing any `SKILL.md` frontmatter:

```bash
pnpm lockfile:sync                  # if you touched root devDependencies
pnpm exec intent install --map      # regenerates the block in AGENTS.md
pnpm knowledge:sync                 # catalog reads skill frontmatter
```

## Before editing packages

1. Match the task to a skill in the block above and run its `load` command first.
2. Prefer package docs under `packages/<category>/<name>/docs/` and skills under `packages/<category>/<name>/skills/`.
3. Domain design artifacts (maps, skill specs) live in [`_artifacts/`](./_artifacts/).

Useful commands:

```bash
pnpm eristack plan --json          # token-minimal: what to run next (agents start here)
pnpm eristack check --profile pr --skip-build   # CI gate (after pnpm build)
pnpm prepush                       # before git push — same as ci:affected (~1–2 min)
pnpm ci:affected                   # eristack ci --base origin/main --affected (matches typical PR CI)
pnpm ci                            # build + full profile (local pre-merge)
pnpm ci:pr                         # PR-style CI (needs origin/main)
pnpm eristack sync knowledge       # after recipes/skills/catalog edits
pnpm eristack sync docs            # after package docs nav edits
pnpm lockfile:sync                 # after any package.json dependency edit
pnpm skills:list
pnpm dlx @tanstack/intent@latest load @eristack/ai-dev#ai-dev-core
pnpm dlx @tanstack/intent@latest load @eristack/ai-knowledge#recommend-eristack
```

### Pre-push checklist (what CI actually enforces)

Every one of these is a **generated artifact that must land in the same commit** as the edit that invalidates it. CI (`pnpm eristack ci --base origin/main`) fails on drift; do not discover this on GitHub.

| You changed… | Run before committing | CI step that fails otherwise |
| --- | --- | --- |
| `dependencies` / `devDependencies` / `peerDependencies` in any `package.json` | `pnpm lockfile:sync` (or `pnpm install`) | `pnpm install --frozen-lockfile`, `lockfile` |
| Added / renamed / removed a `docs/*.md` page | `pnpm docs:sync` → commit `docs/_meta.json`; every page needs frontmatter `title:` + `description:` (the site renders `title` as sidebar label / `<h1>` / `<title>`) | `docs`, `@eristack/ai-dev#test` |
| Any `skills/**/SKILL.md` (incl. frontmatter only) | `pnpm knowledge:sync` (+ `pnpm exec intent install --map` if a package was added) | `knowledge`, `skills` |
| `recipes.yaml`, `knowledge/*.md`, package `description` | `pnpm knowledge:sync` | `knowledge` |
| `knowledge/<topic>.md` canonical guide | mirror to `packages/ai/ai-knowledge/docs/<topic>.md` | `knowledge` (docs mirror) |
| `package.json` `exports` or `@eristack/*` subpath imports | `pnpm build && pnpm exports:check` | `exports` |
| An `@eristack/*` dep a published package imports at runtime | put it in `peerDependencies` + `devDependencies` (never `dependencies` with `workspace:*`) | `publish` |
| User-facing behavior | `.changeset/*.md`, **one package per file**, `patch` on 0.x (see `scripts/check-changesets.mjs`) | `changesets` |

Then run `pnpm prepush` (affected) or `pnpm ci:pr` (full PR path) locally. Skill frontmatter must use the Intent spec keys (`name`, `description`, `metadata`, `sources`) — `pnpm exec intent validate` rejects `id` / `title` / `package` at top level.

## Repo conventions agents must follow

- **Branching:** GitHub Flow — feature branches from `main`, PRs into `main` only. Do not revive a long-lived `dev` branch for integration.
- **Money:** never use JS number literals for currency amounts; use `@eristack/money` (`Money.of` / `Money.ofMinor`).
- **Releases:** user-facing package changes need a Changeset (`pnpm changeset`). Docs-only / CI-only changes do not. Publishing happens only after the Version Packages PR merges to `main`.
- **Scope:** change only what the task requires; do not rewrite README for agent guidance (put that here).
- **Git / commits / PRs:** taboo for agents — never run git or `gh` VCS commands, never create commits or PRs unless the user explicitly asks. The human owns version control (including committing `apps/web` `_meta.json` after `pnpm docs:sync`). **When the user asks for a commit:** subject line must be `type(scope): message` or `type: message` — colon, space, short plain line (e.g. `fix(ci): fix parity test`). See `.cursor/rules/commit-messages.mdc`; never PR-style titles like `Prepare foo release: a, b, c.`
- **pnpm only:** `pnpm install` and `pnpm web` from repo root — not sandboxed installs that break `node_modules` (`next: command not found`). See `.cursor/rules/pnpm-and-node_modules.mdc`.
- **AI working docs:** while implementing, write notes under [`_ai-docs/wip/<topic>/`](./_ai-docs/wip/) (see [`_ai-docs/README.md`](./_ai-docs/README.md): WIP · brainstorm · audit). When the user says work is **finished**, promote into `packages/<category>/*/docs` and/or `apps/web`, then **delete** that WIP folder. See `.cursor/rules/ai-working-docs.mdc`.
- **HARD RULE — docs + ai-knowledge every iteration:** same change set must update package `docs/`, Intent `skills/`, and (when product-discoverable) `packages/ai/ai-knowledge/knowledge/recipes.yaml`, then `pnpm knowledge:sync` + `pnpm knowledge:check`. When doc **pages** change, also run `pnpm docs:sync` and commit `_meta.json`. CI runs `pnpm docs:check`. Do not finish with fresh docs and stale agent knowledge or nav catalog. See `.cursor/rules/ai-knowledge-sync.mdc`.
- **HARD RULE — new `@eristack/*` package:** ship package docs + skills + recipe + **`apps/web`** (`site.ts`, home **ecosystem** tech stack, products copy) in one pass. Checklist: `packages/ai/ai-knowledge/knowledge/dev-conventions.md` § Shipping a new package; `.cursor/rules/new-package-ship.mdc`.
- **HARD RULE — export map matches build:** when adding/changing `package.json` exports or spine imports, `pnpm build` + `pnpm exports:check` must pass (`scripts/check-package-exports.mjs`). Prevents published packages missing subpaths like `@eristack/backseat/adapters`.
- **HARD RULE — package design targets:** cheap (≤3 files / token budget), predictable (same core in forms + API), reliable (Drizzle default, real tests), clear boundaries (export what consumers would duplicate — do not make apps reinvent truth modes, money validators, decimal compare, etc.). See `.cursor/rules/eristack-package-targets.mdc` and `knowledge/agent-workflow.md` § Design targets.
- **HARD RULE — in-depth docs, minimal file reads:** cross-cutting guides live in **one** canonical `knowledge/<topic>.md` (e.g. upgrading); per-package docs are deltas only. Agents must not need 100+ files. See `.cursor/rules/docs-depth-tokens.mdc`.
- **Package categories:** filesystem order is `packages/primitive` → `packages/registries` → `packages/capability` → `packages/service` → `packages/infrastructure` → `packages/ui` → `packages/features` → `packages/ai` (eight layers; see `roadmap/layers.md`). Layer 07 (`features/`) is **under construction** — no packages; see `roadmap/features.md`.
- **Idempotency:** duplicate POSTs, ledger retries, uploads, and async side effects follow **one** canonical guide — `@eristack/ai-knowledge#idempotency-and-outbox` (`@eristack/idempotency` HTTP guard → app `UNIQUE(tenant_id, idempotency_key)` → `@eristack/outbox` for comms/payment). Do not invent per-package dedup.

## Examples

Prefer `examples/*` when validating or demonstrating framework wiring:

- `examples/express` — Express 5 + Drizzle SQLite: jwt-auth router + require-auth, orders data-grid (joins/aggregates), idempotent `POST /orders` (`@eristack/idempotency` guard + domain UNIQUE)
- `examples/nestjs` — Nest module + guard + controller, `registerAsync` injects app `db`
- `examples/react` — headless client/provider against the Express example: jwt-auth, data-grid list UI, `createIdempotencyClientFetch` create-order form
- `examples/horizon-a` — Backseat-only document-with-lines ERP spine (qups, data-grid, doc-number, pbac) before any backend

Do not invent alternate Express/Nest/React integration patterns when an example already shows the supported one. Examples are private and ignored by Changesets; `pnpm --filter './examples/*' run build` is a CI step.

## Docs: package ↔ web

- **Source of truth for library guides:** `packages/<category>/<name>/docs/*.md` (+ `_meta.json` for sidebar order).
- **Web renders those files** via `apps/web/src/lib/docs.ts` (no duplicate markdown in the app).
- **Site-only pages** (story, support, philosophy, blog posts) live under `apps/web/`.
- When promoting AI notes for a library change, update `packages/<category>/*/docs` first; the site picks them up automatically. Update `apps/web` only for marketing/company copy or search/nav wiring.
- Web docs UI links back to the GitHub source path for each page.
- Docs listing order matches categories: primitive → registries → capability → service → infrastructure → ui → features → AI.

## Monorepo layout

Categories under `packages/` (order matters). Descriptions are the package.json `description` — keep them accurate; `@eristack/ai-knowledge` catalog and the site read them.

### Primitive (01)

- `packages/primitive/address` — `@eristack/address` — Normalized postal addresses with ISO country codes — string fields, no geocoding
- `packages/primitive/business-calendar` — `@eristack/business-calendar` — Business days and holidays on YYYY-MM-DD wall dates — no timestamp import in core
- `packages/primitive/checksum` — `@eristack/checksum` — SHA-256 hex normalize and constant-time compare for exports and file refs
- `packages/primitive/contact` — `@eristack/contact` — Contact roles and channel list normalization on a party — compose with person/phone/email
- `packages/primitive/currency-pair` — `@eristack/currency-pair` — Base/quote currency pair validation and canonical pair keys — no FX rates
- `packages/primitive/dimension` — `@eristack/dimension` — L×W×H dimension triple as decimal strings — cubic volume, optional unit label
- `packages/primitive/email-address` — `@eristack/email-address` — Normalized email local@domain strings for contact channels
- `packages/primitive/entity-id` — `@eristack/entity-id` — UUID v7 entity identifiers — sortable, parseable, Drizzle column helper
- `packages/primitive/fiscal-calendar` — `@eristack/fiscal-calendar` — Fiscal years and periods with open/closed flags — wall-date boundaries on @eristack/timestamp
- `packages/primitive/fraction` — `@eristack/fraction` — Exact rational numbers as reduced fractions — string numerators/denominators, no float literals
- `packages/primitive/geo` — `@eristack/geo` — Latitude and longitude as decimal strings — normalize and haversine distance
- `packages/primitive/money` — `@eristack/money` — Money primitives for Eristack
- `packages/primitive/payment-instrument` — `@eristack/payment-instrument` — Token-safe payment card value types — display + gateway refs, PAN transient only, PCI-minded guards
- `packages/primitive/percent` — `@eristack/percent` — Percent and basis-point ratios as strings — tax, discount, markup without float literals
- `packages/primitive/person` — `@eristack/person` — Structured person name and gender identity — normalize and display, not HRIS
- `packages/primitive/phone` — `@eristack/phone` — E.164 phone normalization — strict plus prefix, no libphonenumber in core
- `packages/primitive/timestamp` — `@eristack/timestamp` — Business timestamps: UTC instants for facts, wall-clock for schedules (DST-safe)
- `packages/primitive/uom` — `@eristack/uom` — Unit of measure quantities with fixed-ratio conversion — string decimal amounts, no silent float math

### Registries (02)

- `packages/registries/iso-3166` — `@eristack/iso-3166` — ISO 3166-1 country codes and ISO 3166-2 subdivision normalization — assigned alpha-2/alpha-3 registry
- `packages/registries/unlocode` — `@eristack/unlocode` — UN/LOCODE port and place codes — normalize five-character locodes with ISO 3166 country validation

### Capability (03)

- `packages/capability/doc-number` — `@eristack/doc-number` — Document number format, parse, and sequence primitives for Eristack
- `packages/capability/doc-transitions` — `@eristack/doc-transitions` — Preset ERP document status graphs for @eristack/pbac documents.transitions()
- `packages/capability/financial-ledger` — `@eristack/financial-ledger` — Accounting ledger on hash-chained-ledger keyed by accountId, amounts via @eristack/money
- `packages/capability/qups` — `@eristack/qups` — Quantity / unit price / subtotal (QUPS) with 2-of-3 sources of truth, plus modifiers and tax — business line pricing on @eristack/money
- `packages/capability/rounding-policy` — `@eristack/rounding-policy` — Named rounding profiles that resolve to @eristack/money Rounding operators
- `packages/capability/stock-movement` — `@eristack/stock-movement` — Inventory quantity ledger on hash-chained-ledger: locationId, lotId, composable locations, snapshots, tamper checks
- `packages/capability/tax` — `@eristack/tax` — Tax code registry and effective-dated rates — math via @eristack/money Tax ops
- `packages/capability/valuations` — `@eristack/valuations` — Product/lot cost valuation: FIFO, LIFO, FEFO, moving/weighted average, standard cost, specific ID, HIFO/LOFO — with hash-chained cost ledger

### Service (04)

- `packages/service/abac` — `@eristack/abac` — Attribute-based access control for Eristack: policy functions over subject/resource/environment attributes
- `packages/service/api-key` — `@eristack/api-key` — Generate, hash, and timing-safe verify API keys for partner B2B routes
- `packages/service/comms` — `@eristack/comms` — Transactional email, SMS, and WhatsApp — SendGrid, Postmark, Mailgun, Resend, Twilio, Vonage, Meta drivers, Drizzle delivery log, Express webhooks
- `packages/service/data-grid` — `@eristack/data-grid` — Dynamic list query primitives: multi-field filters, search mode, multi-sort, offset/cursor pagination for Eristack services and capabilities
- `packages/service/email-template` — `@eristack/email-template` — {{var}} HTML/text email template render and key extraction — pair with @eristack/comms
- `packages/service/epoch` — `@eristack/epoch` — Headless data-version epochs for cache invalidation: compare client epoch vs server, bump on mutation, Drizzle default
- `packages/service/file-manager` — `@eristack/file-manager` — Headless file uploads: S3 presigned PUT/GET, server uploads, FileRef for Drizzle columns, REST/Express/React dev tools
- `packages/service/hash-chained-ledger` — `@eristack/hash-chained-ledger` — Append-only hash-chained ledger primitive: opening/in/out/adjustment/closing, type refs, chain verify and tamper detection
- `packages/service/health` — `@eristack/health` — Liveness and readiness health check registry with Express and Nest mount helpers
- `packages/service/idempotency` — `@eristack/idempotency` — Idempotency-Key guard with Drizzle store, scoped keys, lease, Express/Nest/client adapters
- `packages/service/jwt-auth` — `@eristack/jwt-auth` — Canonical JWT access + refresh-token auth primitives for Eristack
- `packages/service/oauth` — `@eristack/oauth` — OAuth2 client with 17+ IdP drivers (Google, Microsoft, GitHub, Apple, Okta, …) and authorization-server provider — PKCE, Drizzle, Express; hand off to jwt-auth
- `packages/service/opinion` — `@eristack/opinion` — Opinionated ERP HTTP route table: document CRUD + PATCH /:id/:action transitions
- `packages/service/outbox` — `@eristack/outbox` — Transactional outbox enqueue + Drizzle worker batch for reliable comms and payment side effects
- `packages/service/payment-manager` — `@eristack/payment-manager` — Headless payment intents: Stripe/Xendit drivers, Drizzle history, webhooks, REST/Express/client — pairs with payment-instrument
- `packages/service/pbac` — `@eristack/pbac` — Policy-based (software) access control for Eristack: business document rules that return true or false
- `packages/service/pdf-render` — `@eristack/pdf-render` — HTML to PDF driver interface — Puppeteer/Playwright stays in the app or optional adapter
- `packages/service/rate-limit` — `@eristack/rate-limit` — Fixed-window in-memory rate limiter — Redis adapter in app or later package
- `packages/service/rbac` — `@eristack/rbac` — Role-based access control for Eristack: subjects, roles, and boolean permissions
- `packages/service/spreadsheet-render` — `@eristack/spreadsheet-render` — Declarative workbook model and xlsx/csv render drivers — ExcelJS/SheetJS in app or adapter

### Infrastructure (05)

- `packages/infrastructure/backseat` — `@eristack/backseat` — Frontend mock backend engine: in-browser REST server with pluggable store, controllers, and TanStack Query hooks
- `packages/infrastructure/drizzle-kit-helpers` — `@eristack/drizzle-kit-helpers` — Shared drizzle-kit config fragments for Eristack consumer monorepos (pg prod, sqlite tests)
- `packages/infrastructure/logger` — `@eristack/logger` — JSON-lines structured logger with request context and Express/Nest adapters
- `packages/infrastructure/rest` — `@eristack/rest` — Declarative REST route definitions with Express and Nest mounting and OpenAPI 3.1 emit
- `packages/infrastructure/vercel-adapters` — `@eristack/vercel-adapters` — Serverless-friendly Express entry helpers for Vercel — no Vercel SDK in core

### UI (06)

- `packages/ui/command-palette` — `@eristack/command-palette` — Headless command palette state and simple dialog shell
- `packages/ui/design-system` — `@eristack/design-system` — Erista design tokens, Tailwind preset, and React density context for ERP UI
- `packages/ui/doc-shell` — `@eristack/doc-shell` — Document detail page shell — header, actions, body slots
- `packages/ui/filter-builder` — `@eristack/filter-builder` — Stub filter chip bar and sheet UI for data-grid list filters
- `packages/ui/form-ui` — `@eristack/form-ui` — Native React form controls wired to @eristack money, percent, and timestamp
- `packages/ui/line-grid` — `@eristack/line-grid` — Editable QUPS line table with patchLine recalculation hook
- `packages/ui/list-shell` — `@eristack/list-shell` — Presentational list page layout, toolbar, and TanStack Query state banners
- `packages/ui/master-detail` — `@eristack/master-detail` — Two-pane master list + detail layout for picker flows
- `packages/ui/multitab` — `@eristack/multitab` — Headless multi-tab workspace for React ERP screens — document tabs, state preservation, Router sync
- `packages/ui/policy-ui` — `@eristack/policy-ui` — RBAC and PBAC gate components with v0 allowed override
- `packages/ui/spreadsheet-operator` — `@eristack/spreadsheet-operator` — Headless spreadsheet keyboard operator — active-grid scope, cell navigation, Excel-like Enter/Tab editing

### AI (08)

- `packages/ai/ai-dev` — `@eristack/ai-dev` — Unified agent-first dev tooling for Eristack monorepos: plan (token-minimal), check profiles, sync, compact JSON + MCP
- `packages/ai/ai-knowledge` — `@eristack/ai-knowledge` — Eristack knowledge pack for AI agents: recommend packages first, load the right Intent skills, and keep catalog facts in sync
- `packages/ai/ai-ticket-generator` — `@eristack/ai-ticket-generator` — Generate portable maintainer tickets (bugs + suggestions) for every @eristack package — logs, scenario, fix plan, and agent-ready handoff files
- `packages/ai/ai-workflow` — `@eristack/ai-workflow` — Local-first AI workflow for Eristack projects: MCP server, FTS+vector index, backlog/sprint/ADR artifacts — low-token agent tools that do not replace existing editors or Intent

### Features (07)

- `packages/features/` — **under construction** — future `@eristack/feature-*`; apps compose spine today (`roadmap/features.md`)

### Repo-level

- `roadmap/` — living priority stack for future packages (also rendered at `/roadmap` on the site); draft-only catalog at `roadmap/horizon.md`
- `apps/web` — public Next.js site (Libraries → Layer → Library → Docs; changelogs at `/{slug}/changelog`; docs from `packages/<category>/*/docs`; Cmd/Ctrl+K search)
- `_ai-docs/` — WIP (`wip/`), brainstorm (`brainstorm/`), audit snapshot (`audit/`); see `_ai-docs/README.md`
- `examples/*` — private runnable demos (not published)
- `internal/test-harness` — `@internal/test-harness` repo-only sqlite helpers for integration tests (not under `packages/`, not published)
- `scripts/` — CI gate scripts (`check-changesets`, `check-publish-deps`, `check-package-exports`, `docs-check`/`docs-sync`, `lockfile-check`/`lockfile-sync`, `skills-validate`); package discovery comes from `@eristack/ai-dev/repo`, never hand-listed
- `.changeset/` — pending release notes for Changesets
- `.github/workflows/ci.yml` — PR (`pnpm eristack ci --base origin/main`) and `main` (`--profile pr`) checks
- `.github/workflows/check-skills.yml` — `intent validate --github-summary` on skill/artifact PRs
- `.github/workflows/release.yml` — Version Packages PR + npm publish on `main`
