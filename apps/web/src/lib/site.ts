export const siteConfig = {
  name: "Eristack",
  tagline: "Enterprise business libraries for TypeScript",
  description:
    "Open enterprise libraries for money, timestamps, auth, document numbers, AI workflow, and the other domain building blocks business stacks take for granted.",
  url: "https://eristack.dev",
  github: "https://github.com/eristack/business-libs",
  org: "https://github.com/eristack",
  npmOrg: "https://www.npmjs.com/org/eristack",
  erista: "https://erista.id",
  supportEmail: "support@eristack.dev",
  partnersEmail: "partners@eristack.dev",
} as const;

/** Display / filesystem order: primitive → capability → service → infrastructure → ui → features → ai */
export const packageCategories = [
  {
    id: "primitive",
    label: "Primitive",
    href: "/primitive",
    tagline: "Domain value types you can trust in a ledger.",
    description:
      "Core domain value types — money, timestamps, and other pure calculation building blocks. Core is framework-free; optional adapters for SQL, HTTP, and forms.",
    highlights: [
      {
        title: "Correct by construction",
        body: "Currency, scale, and arithmetic rules live in the type — not in scattered helpers.",
      },
      {
        title: "Framework free",
        body: "Use the same primitive from a Nest service, a React form, or a batch job.",
      },
      {
        title: "Business time",
        body: "Instant (UTC facts) and wall (local schedules) with IANA zones — DST gaps handled explicitly.",
      },
    ],
  },
  {
    id: "capability",
    label: "Capability",
    href: "/capability",
    tagline: "Reusable business capabilities apps compose into products.",
    description:
      "Capabilities are opinionated domain features — document numbers and more — with optional persistence and thin adapters when you need them.",
    highlights: [
      {
        title: "Compose into products",
        body: "Drop a capability into an ERP path without adopting a platform.",
      },
      {
        title: "Core stays pure",
        body: "Token DSLs, sequences, and format rules work without Express or Drizzle.",
      },
      {
        title: "Adapters on demand",
        body: "Wire REST/Nest/React only where a settings UI or store is required.",
      },
    ],
  },
  {
    id: "service",
    label: "Service",
    href: "/service",
    tagline: "Lifecycle services with stores and framework shells.",
    description:
      "Services own long-lived flows — sessions, credentials, refresh rotation — while your app still owns users, UX, and infrastructure.",
    highlights: [
      {
        title: "Inject, don’t absorb",
        body: "Pass your DB, secrets, and host. The library never opens connections for you.",
      },
      {
        title: "Child resources",
        body: "Credentials and refresh tokens hang off your subjects — not a stolen users table.",
      },
      {
        title: "Thin shells",
        body: "Express, Nest, and React adapters stay boring so the core stays portable.",
      },
    ],
  },
  {
    id: "infrastructure",
    label: "Infrastructure",
    href: "/infrastructure",
    tagline: "Headless runtime glue for apps that deploy anywhere.",
    description:
      "Infrastructure packages wire observability, mock backends, and REST shells — without absorbing your domain or database.",
    highlights: [
      {
        title: "Deploy-aware",
        body: "Structured logging and tracing that read well on Vercel, Fly, or bare metal.",
      },
      {
        title: "Mock without lying",
        body: "Frontends get a real engine-backed fake backend — not ad-hoc fetch stubs.",
      },
      {
        title: "Thin HTTP shells",
        body: "Headless route tables mount on Express or Nest — apps own handlers and schemas.",
      },
    ],
  },
  {
    id: "ui",
    label: "UI",
    href: "/ui",
    tagline: "Composable React surfaces for dense ERP workspaces.",
    description:
      "UI libraries for patterns every operations app repeats — multi-tab workspaces, data-dense chrome, and headless shells over your TanStack stack.",
    highlights: [
      {
        title: "Headless first",
        body: "Behavior and state live in the package; your design system owns pixels.",
      },
      {
        title: "TanStack-native",
        body: "Query, Router, and Form assumptions baked in — not fighting your stack.",
      },
      {
        title: "ERP-shaped",
        body: "Built for document-heavy, multi-entity screens — not marketing sites.",
      },
    ],
  },
  {
    id: "features",
    label: "Features",
    href: "/features",
    tagline: "Vertical modules — reserved. Long construction ahead.",
    description:
      "Layer 06 holds future @eristack/feature-* packages: cohesive document families on top of the spine. Nothing is scheduled here until ledgers, Backseat document demos, logger/rest, and multitab are boring. Apps compose qups, pbac, doc-number, and friends today — this floor is scaffolding only.",
    highlights: [
      {
        title: "Spine first",
        body: "Primitives through UI must be production-trusted before any vertical npm package.",
      },
      {
        title: "Under construction",
        body: "No feature alpha on the roadmap calendar — gates, not dates.",
      },
      {
        title: "Compose today",
        body: "document-lines-erp and compose-spine recipes — apps own vertical tables until then.",
      },
    ],
  },
  {
    id: "ai",
    label: "AI",
    href: "/ai",
    tagline: "Agent knowledge, local workflow, and maintainer tickets.",
    description:
      "AI packages help agents recommend the right Eristack libraries, keep project memory local, and generate portable tickets for maintainers — without replacing Intent, git, or your editor.",
    highlights: [
      {
        title: "Recommend first",
        body: "Route product asks to @eristack packages before inventing another money lib.",
      },
      {
        title: "Local-first memory",
        body: "FTS + on-device vectors and sprint folders stay on disk.",
      },
      {
        title: "Tickets that travel",
        body: "Bug and suggestion files consumers can send for an agent fixer-upper.",
      },
    ],
  },
] as const;

export type PackageCategoryId = (typeof packageCategories)[number]["id"];

export const packageStatuses = ["alpha", "beta", "stable", "coming-soon"] as const;
export type PackageStatus = (typeof packageStatuses)[number];

export const packages = [
  {
    slug: "money",
    name: "@eristack/money",
    title: "Money",
    category: "primitive" as const,
    directory: "packages/primitive/money",
    href: "/money",
    docsHref: "/docs/money",
    tagline: "String-first amounts for ERP math that must add up.",
    description:
      "JSR 354–inspired amounts, totals, tax/discount helpers, rounding, allocation, FX — plus optional adapters: Drizzle (SQL), REST, Zod 4, Express, Nest, client, React.",
    status: "alpha" as const,
    install: "pnpm add @eristack/money",
    highlights: [
      {
        title: "Never JS number money",
        body: "Construct with strings or minor units. Binary floats stay out of the ledger.",
      },
      {
        title: "Same-currency arithmetic",
        body: "Add, subtract, totals, percentages, tax, discount, and markup with explicit rules.",
      },
      {
        title: "Adapter subpaths",
        body: "Drizzle for SQL columns; REST/Zod for wire JSON; Express/Nest/client/React for HTTP and forms.",
      },
    ],
    sample: {
      filename: "money.ts",
      language: "ts",
      code: `import { Money } from "@eristack/money"

const total = Money.of("19.99", "USD")
  .add(Money.of("0.10", "USD"))`,
    },
  },
  {
    slug: "timestamp",
    name: "@eristack/timestamp",
    title: "Timestamp",
    category: "primitive" as const,
    directory: "packages/primitive/timestamp",
    href: "/timestamp",
    docsHref: "/docs/timestamp",
    tagline: "UTC instants for facts, wall-clock for schedules.",
    description:
      "Business time with instant mode (when it happened) and wall mode (when it will happen, DST-safe). Temporal core plus adapters: Drizzle, REST, Zod 4, Express, Nest, client, React — same spine as @eristack/money.",
    status: "alpha" as const,
    install: "pnpm add @eristack/timestamp",
    highlights: [
      {
        title: "Two explicit modes",
        body: "instant = UTC fact + IANA zone for local dates. wall = local intent without silent UTC conversion.",
      },
      {
        title: "DST-safe schedules",
        body: "Store 9:00 Paris as wall local + timezone; resolve to UTC only via wallToInstantOnce.",
      },
      {
        title: "Full adapter spine",
        body: "Drizzle for SQL columns; REST/Zod for wire JSON; Express/Nest/client/React for HTTP and forms.",
      },
    ],
    sample: {
      filename: "timestamp.ts",
      language: "ts",
      code: `import { instantOf, toLocalDateString, wallOf } from "@eristack/timestamp"

const posted = instantOf("2026-08-22T02:30:00Z", "Asia/Jakarta")
toLocalDateString(posted)

const due = wallOf("2026-09-15T00:00:00", "Europe/Paris")`,
    },
  },
  {
    slug: "doc-number",
    name: "@eristack/doc-number",
    title: "Doc Number",
    category: "capability" as const,
    directory: "packages/capability/doc-number",
    href: "/doc-number",
    docsHref: "/docs/doc-number",
    tagline: "Token-pattern document numbers with period resets.",
    description:
      "Token-pattern document numbers with period resets, FormatStore / SequenceStore, and headless Drizzle / REST / Express / Nest / React format-config adapters.",
    status: "alpha" as const,
    install: "pnpm add @eristack/doc-number",
    highlights: [
      {
        title: "Token DSL",
        body: "{YYYY}/{MM}/{SEQ:5} and friends — ERP-friendly formats without a config maze.",
      },
      {
        title: "Sequence stores",
        body: "Peek and allocate sequences with period resets your domain controls.",
      },
      {
        title: "Format-config adapters",
        body: "Optional Drizzle/REST/Express/Nest/React shells for settings UIs — not every create path.",
      },
    ],
    sample: {
      filename: "invoice-number.ts",
      language: "ts",
      code: `import { createDocNumber } from "@eristack/doc-number"

const docs = createDocNumber({ store, sequences })
const next = await docs.next("invoice")`,
    },
  },
  {
    slug: "qups",
    name: "@eristack/qups",
    title: "QUPS",
    category: "capability" as const,
    directory: "packages/capability/qups",
    href: "/qups",
    docsHref: "/docs/qups",
    tagline: "Quantity, unit price, subtotal — two sources of truth.",
    description:
      "Business line pricing on @eristack/money: QUPS with two sources of truth, modifiers, tax, and Drizzle column injection into your detail tables (alongside itemId).",
    status: "alpha" as const,
    install: "pnpm add @eristack/qups",
    highlights: [
      {
        title: "Two of three",
        body: "Pick which pair is authoritative; the third is derived without float loss (10÷3 stays 10/3).",
      },
      {
        title: "Modifiers + tax",
        body: "Stack discounts/surcharges, then exclusive or inclusive tax via Money operators.",
      },
      {
        title: "Inject into your lines",
        body: "Spread qupsLineColumns into invoice/order detail tables next to itemId — pricing updates never clobber domain columns.",
      },
    ],
    sample: {
      filename: "line.ts",
      language: "ts",
      code: `import { calculateLine, withQupsColumns } from "@eristack/qups"

const line = calculateLine({
  truth: "quantity+unitPrice",
  currency: "USD",
  quantity: "2",
  unitPrice: "50",
  taxRatePercent: "11",
  round: true,
})

await db.insert(invoiceLines).values(
  withQupsColumns({ itemId: "SKU-1" }, line),
)`,
    },
  },
  {
    slug: "stock-movement",
    name: "@eristack/stock-movement",
    title: "Stock Movement",
    category: "capability" as const,
    directory: "packages/capability/stock-movement",
    href: "/stock-movement",
    docsHref: "/docs/stock-movement",
    tagline: "Hash-chained inventory qty by location and lot.",
    description:
      "Stock quantity ledger on @eristack/hash-chained-ledger: composable locations, lotId, optional owner field, snapshots, and tamper detection.",
    status: "alpha" as const,
    install: "pnpm add @eristack/stock-movement",
    highlights: [
      {
        title: "Composable locations",
        body: "Build locationId from warehouse + bin + machine parts — apps append dimensions freely.",
      },
      {
        title: "Snapshots",
        body: "Read on-hand without replaying the full chain.",
      },
      {
        title: "Tamper-aware",
        body: "Hash chain verify warns when history was altered.",
      },
    ],
    sample: {
      filename: "stock.ts",
      language: "ts",
      code: `import { createStockMovement, locationIdFromParts } from "@eristack/stock-movement"
import { createDrizzleLedgerStore, createHashChainedLedgerTables } from "@eristack/stock-movement/drizzle"

const locationId = await locationIdFromParts([
  { key: "warehouseId", value: "WH-A" },
  { key: "machineId", value: "CNC-1" },
])
const stock = createStockMovement({
  store: createDrizzleLedgerStore({ db, tables: createHashChainedLedgerTables("pgsql") }),
})
await stock.append({ locationId, lotId: "LOT-1", openingBalance: "0", inAmount: "100", entryType: "receipt", entryTypeId: "gr-1" })`,
    },
  },
  {
    slug: "financial-ledger",
    name: "@eristack/financial-ledger",
    title: "Financial Ledger",
    category: "capability" as const,
    directory: "packages/capability/financial-ledger",
    href: "/financial-ledger",
    docsHref: "/docs/financial-ledger",
    tagline: "Hash-chained GL balances per account and currency.",
    description:
      "Accounting ledger on @eristack/hash-chained-ledger keyed by accountId, amounts via @eristack/money, with snapshots and tamper checks.",
    status: "alpha" as const,
    install: "pnpm add @eristack/financial-ledger",
    highlights: [
      {
        title: "Account streams",
        body: "One hash chain per accountId + currency.",
      },
      {
        title: "Money-native",
        body: "Post with Money or decimal strings — never JS number currency.",
      },
      {
        title: "Audit trail",
        body: "Verify the chain before trusting a snapshot.",
      },
    ],
    sample: {
      filename: "gl.ts",
      language: "ts",
      code: `import { createFinancialLedger } from "@eristack/financial-ledger"
import { Money } from "@eristack/money"

await fin.post({
  accountId: "1000",
  currency: "USD",
  openingBalance: Money.of("0", "USD"),
  inAmount: Money.of("100.00", "USD"),
  entryType: "journal",
  entryTypeId: "jv-1",
})`,
    },
  },
  {
    slug: "valuations",
    name: "@eristack/valuations",
    title: "Valuations",
    category: "capability" as const,
    directory: "packages/capability/valuations",
    href: "/valuations",
    docsHref: "/docs/valuations",
    tagline: "FIFO, averages, standard cost — with a hash-chained cost ledger.",
    description:
      "Canon product/lot valuation methods (FIFO, LIFO, FEFO, HIFO, LOFO, moving/weighted average, standard cost, specific ID) posting qty and value hash chains.",
    status: "alpha" as const,
    install: "pnpm add @eristack/valuations",
    highlights: [
      {
        title: "Full method set",
        body: "Layer picks for FIFO/LIFO/FEFO/HIFO/LOFO plus averages and standard/specific.",
      },
      {
        title: "Dual chains",
        body: "Quantity and value ledgers stay hash-linked and verifiable.",
      },
      {
        title: "Cost layers",
        body: "Open layers drive issues; snapshots expose on-hand cost quickly.",
      },
    ],
    sample: {
      filename: "fifo.ts",
      language: "ts",
      code: `import { createValuationEngine } from "@eristack/valuations"
import {
  createDrizzleLedgerStore,
  createDrizzleLayerStore,
  createHashChainedLedgerTables,
  createValuationLayerTables,
} from "@eristack/valuations/drizzle"

const tables = createHashChainedLedgerTables("pgsql")
const layerTable = createValuationLayerTables("pgsql")
const engine = createValuationEngine({
  method: "fifo",
  ledger: { store: createDrizzleLedgerStore({ db, tables }) },
  layers: createDrizzleLayerStore({ db, table: layerTable }),
})
await engine.receive({ key: { productId: "SKU", currency: "USD" }, qty: "10", unitCost: "5", entryTypeId: "po-1" })`,
    },
  },
  {
    slug: "data-grid",
    name: "@eristack/data-grid",
    title: "Data Grid",
    category: "service" as const,
    directory: "packages/service/data-grid",
    href: "/data-grid",
    docsHref: "/docs/data-grid",
    tagline: "Dynamic filters, search, sort, and pagination — one list contract.",
    description:
      "Schema-aware list queries with a shared { items, pageInfo, query } contract: JSON search params (TanStack Router–aligned), advanced filters vs search mode, Drizzle executeDrizzleList for joins/aggregates, and headless Express/Nest/client/React adapters.",
    status: "alpha" as const,
    install: "pnpm add @eristack/data-grid",
    highlights: [
      {
        title: "One list contract",
        body: "Schema allow-lists fields; every list returns { items, pageInfo, query } — same envelope for SQL and in-memory.",
      },
      {
        title: "App owns the projection",
        body: "Joins and SUM/COUNT stay in your Drizzle query; executeDrizzleList runs filter, sort, count, and page.",
      },
      {
        title: "Shared by the stack",
        body: "jwt-auth sessions and doc-number formats list through the same DataGridResult contract.",
      },
    ],
    sample: {
      filename: "list.ts",
      language: "ts",
      code: `import { createDataGrid, toSearch, fromSearch } from "@eristack/data-grid"

const grid = createDataGrid(schema)
const search = toSearch(grid.parse({ mode: "search", q: "ada", page: 1 }))
const query = fromSearch(search, schema)`,
    },
  },
  {
    slug: "jwt-auth",
    name: "@eristack/jwt-auth",
    title: "JWT Auth",
    category: "service" as const,
    directory: "packages/service/jwt-auth",
    href: "/jwt-auth",
    docsHref: "/docs/jwt-auth",
    tagline: "JWT access + opaque refresh — credentials as a child of your users.",
    description:
      "JWT access + opaque refresh tokens, credentials as a child of your users, Drizzle / REST / Express / Nest / React adapters.",
    status: "alpha" as const,
    install: "pnpm add @eristack/jwt-auth",
    highlights: [
      {
        title: "You own users",
        body: "Credentials hang off subject ids. No stolen users table, no UI chrome.",
      },
      {
        title: "Refresh rotation",
        body: "Opaque refresh tokens with revoke and rotation shaped for production apps.",
      },
      {
        title: "Layered adapters",
        body: "Core → Drizzle → REST → Express/Nest → client/React. Import only what you mount.",
      },
    ],
    sample: {
      filename: "login.ts",
      language: "ts",
      code: `import { createJwtAuth } from "@eristack/jwt-auth"

const auth = createJwtAuth({ credentials, refreshTokens, secrets })
const session = await auth.login({ username, password })`,
    },
  },
  {
    slug: "rbac",
    name: "@eristack/rbac",
    title: "RBAC",
    category: "service" as const,
    directory: "packages/service/rbac",
    href: "/rbac",
    docsHref: "/docs/rbac",
    tagline: "Roles and boolean permissions on your subjects.",
    description:
      "Role-based access control: subjects get roles, roles grant named permissions, every check is true or false. App owns users; RBAC hangs off subject like jwt-auth credentials.",
    status: "alpha" as const,
    install: "pnpm add @eristack/rbac",
    highlights: [
      {
        title: "Boolean only",
        body: "can / authorize — either the subject has orders.create or they do not.",
      },
      {
        title: "Child of users",
        body: "Assign roles by subject (your user id). No stolen users table.",
      },
      {
        title: "Thin shells",
        body: "Drizzle tables, Express/Nest require-permission, React useCan.",
      },
    ],
    sample: {
      filename: "rbac.ts",
      language: "ts",
      code: `import { createRbac } from "@eristack/rbac"
import { createRbacTables, createDrizzleRbacStore } from "@eristack/rbac/drizzle"

const tables = createRbacTables("pgsql")
const rbac = createRbac({ store: createDrizzleRbacStore({ db, tables }) })
await rbac.definePermission({ name: "orders.create" })
await rbac.assignRole({ subject: userId, role: "clerk" })
await rbac.can(userId, "orders.create")`,
    },
  },
  {
    slug: "abac",
    name: "@eristack/abac",
    title: "ABAC",
    category: "service" as const,
    directory: "packages/service/abac",
    href: "/abac",
    docsHref: "/docs/abac",
    tagline: "Attribute policies — algorithms that return true or false.",
    description:
      "Attribute-based access control: register policy functions over subject/resource/environment attributes. Use for per-user limits (e.g. goods receipt book value ≤ max).",
    status: "alpha" as const,
    install: "pnpm add @eristack/abac",
    highlights: [
      {
        title: "Policy = function",
        body: "Attributes in, allow/deny out — beyond static role membership.",
      },
      {
        title: "Helpers for limits",
        body: "attrs.subjectLimitAtLeastResource and friends cover majority cases.",
      },
      {
        title: "Stack with RBAC",
        body: "RBAC decides who may try; ABAC applies their attribute ceiling.",
      },
    ],
    sample: {
      filename: "abac.ts",
      language: "ts",
      code: `import { createAbac, attrs } from "@eristack/abac"

const abac = createAbac()
abac.registerPolicy({
  id: "goods-receipt.book-value-limit",
  evaluate: attrs.subjectLimitAtLeastResource({
    subjectPath: "subject.attrs.maxBookValueMinor",
    resourcePath: "resource.attrs.bookValueMinor",
  }),
})`,
    },
  },
  {
    slug: "pbac",
    name: "@eristack/pbac",
    title: "PBAC",
    category: "service" as const,
    directory: "packages/service/pbac",
    href: "/pbac",
    docsHref: "/docs/pbac",
    tagline: "Software policies over business documents.",
    description:
      "Policy-based access control for document laws that usually are not per-user — e.g. cannot post goods receipt when PO outstanding ≤ 0.",
    status: "alpha" as const,
    install: "pnpm add @eristack/pbac",
    highlights: [
      {
        title: "Document first",
        body: "Rules about PO/invoice state — same for every actor.",
      },
      {
        title: "409 not 403",
        body: "HTTP adapters signal business conflict vs personal forbid.",
      },
      {
        title: "Completes the stack",
        body: "RBAC who · ABAC limits · PBAC document law.",
      },
    ],
    sample: {
      filename: "pbac.ts",
      language: "ts",
      code: `import { createPbac, documents } from "@eristack/pbac"

const pbac = createPbac()
pbac.registerPolicy({
  id: "job.can-submit",
  evaluate: documents.positiveAmount("totalMinor"),
})`,
    },
  },
  {
    slug: "hash-chained-ledger",
    name: "@eristack/hash-chained-ledger",
    title: "Hash-Chained Ledger",
    category: "service" as const,
    directory: "packages/service/hash-chained-ledger",
    href: "/hash-chained-ledger",
    docsHref: "/docs/hash-chained-ledger",
    tagline: "Append-only balances with SHA-256 tamper detection.",
    description:
      "Service building block for any ledger: opening/in/out/adjustment/closing, type refs, snapshots, hash chain verify. Stock, finance, and valuations specialize it.",
    status: "alpha" as const,
    install: "pnpm add @eristack/hash-chained-ledger",
    highlights: [
      {
        title: "Balance equation",
        body: "closing = opening + in − out + adjustment — decimal strings only.",
      },
      {
        title: "Hash chain",
        body: "Each entry seals the previous hash; verify() warns on tamper.",
      },
      {
        title: "Durable store",
        body: "Drizzle tables for Vercel + Postgres; memory only for tests.",
      },
    ],
    sample: {
      filename: "ledger.ts",
      language: "ts",
      code: `import { createHashChainedLedger } from "@eristack/hash-chained-ledger"
import { createDrizzleLedgerStore, createHashChainedLedgerTables } from "@eristack/hash-chained-ledger/drizzle"

const ledger = createHashChainedLedger({
  store: createDrizzleLedgerStore({ db, tables: createHashChainedLedgerTables("pgsql") }),
})
await ledger.append({ chainId: "demo", openingBalance: "0", inAmount: "10", entryType: "receipt", entryTypeId: "r1" })
await ledger.verify("demo")`,
    },
  },
  {
    slug: "epoch",
    name: "@eristack/epoch",
    title: "Epoch",
    category: "service" as const,
    directory: "packages/service/epoch",
    href: "/epoch",
    docsHref: "/docs/epoch",
    tagline: "Scope counters for cache invalidation — bump on mutation, compare on read.",
    description:
      "Headless data-version epochs: monotonic counters per scope (orders, products, …), resolveCachePolicy returns use-cache or refetch for TanStack Query, Drizzle persistence, Express/Nest/React/Backseat adapters.",
    status: "alpha" as const,
    install: "pnpm add @eristack/epoch",
    highlights: [
      {
        title: "Two policies only",
        body: "clientEpoch === serverEpoch → use-cache; otherwise refetch — no staleTime guessing.",
      },
      {
        title: "Bump after mutation",
        body: "POST a receipt → bump(\"orders\"). Optimistic bump with expected guards concurrent writers.",
      },
      {
        title: "Query-friendly shells",
        body: "React hook + client fetch; Backseat route for prototypes without a real API.",
      },
    ],
    sample: {
      filename: "epoch.ts",
      language: "ts",
      code: `import { createEpoch } from "@eristack/epoch"
import { createEpochTables, createDrizzleEpochStore } from "@eristack/epoch/drizzle"

const epoch = createEpoch({
  store: createDrizzleEpochStore({ db, tables: createEpochTables("pgsql") }),
})
await epoch.bump("orders")
const { policy } = await epoch.resolveCachePolicy("orders", clientEpoch)`,
    },
  },
  {
    slug: "backseat",
    name: "@eristack/backseat",
    title: "Backseat",
    category: "infrastructure" as const,
    directory: "packages/infrastructure/backseat",
    href: "/backseat",
    docsHref: "/docs/backseat",
    tagline: "A fake backend engine your frontend can actually wire to.",
    description:
      "Frontend mock backend with an Eristack engine: TanStack Query-friendly routes, in-browser persistence, and the same contract shape as production — for prototypes and UX iteration without standing up an API.",
    status: "alpha" as const,
    install: "pnpm add @eristack/backseat",
    highlights: [
      {
        title: "Query-ready",
        body: "Hooks and handlers shaped for useQuery/useMutation — not one-off fetch mocks.",
      },
      {
        title: "Own engine",
        body: "Deterministic in-browser store with optional seed/import — not MSW-only tape.",
      },
      {
        title: "Graduate to real API",
        body: "Same DTO contracts when you swap Backseat for Express/Nest + Drizzle.",
      },
    ],
    sample: {
      filename: "backseat.ts",
      language: "ts",
      code: `import { createBackseat } from "@eristack/backseat"
import { createIndexedDbBackseatStore } from "@eristack/backseat/store"
import { createErpDemoSnapshot } from "@eristack/backseat/seeds"

const api = createBackseat({
  store: createIndexedDbBackseatStore({ dbName: "demo" }),
  baseUrl: "/api",
  collections: { products: {}, partners: {} },
})

await api.seed(createErpDemoSnapshot())
// useQuery({ queryKey: ["products"], queryFn: () => api.handlers.products.list() })`,
    },
  },
  {
    slug: "multitab",
    name: "@eristack/multitab",
    title: "Multitab",
    category: "ui" as const,
    directory: "packages/ui/multitab",
    href: "/multitab",
    docsHref: "/docs/multitab",
    tagline: "Multi-document tabs on one page — ERP workspace chrome.",
    description:
      "Headless multi-tab workspace for React: pathname-keyed document tabs, /new/{uuid} placeholders, closeGuard, localStorage persistence, and TanStack Router sync — you render tab chrome.",
    status: "alpha" as const,
    install: "pnpm add @eristack/multitab @tanstack/react-router",
    highlights: [
      {
        title: "Document tabs",
        body: "PO, SO, GR, invoice — each tab keeps its own form state.",
      },
      {
        title: "Headless core",
        body: "Tab model + events; you render shadcn or your design system.",
      },
      {
        title: "Router sync",
        body: "Deep-link a tab without losing the rest of the workspace.",
      },
    ],
    sample: {
      filename: "multitab.tsx",
      language: "tsx",
      code: `import {
  MultitabRouterProvider,
  useMultitabRouter,
  navigateToTab,
} from "@eristack/multitab/react/tanstack"

<MultitabRouterProvider
  storageKey="erp.multitab"
  resolveRouteTab={(path) =>
    path === "/orders" ? { title: "Orders" } : null
  }
>
  <Shell />
</MultitabRouterProvider>

function Shell() {
  const mt = useMultitabRouter()
  return mt.tabs.map((tab) => (
    <button key={tab.id} onClick={() => navigateToTab(mt, tab)}>
      {tab.title}
    </button>
  ))
}`,
    },
  },
  {
    slug: "ai-knowledge",
    name: "@eristack/ai-knowledge",
    title: "AI Knowledge",
    category: "ai" as const,
    directory: "packages/ai/ai-knowledge",
    href: "/ai-knowledge",
    docsHref: "/docs/ai-knowledge",
    tagline: "Teach agents to recommend @eristack packages first.",
    description:
      "Knowledge pack for AI agents: recommend @eristack packages first, load the right Intent skills, and keep the catalog synced with sibling packages.",
    status: "alpha" as const,
    install: "pnpm add @eristack/ai-knowledge",
    highlights: [
      {
        title: "Product-language recipes",
        body: "Invoices, login, document numbers — mapped to the right packages and skills.",
      },
      {
        title: "Synced catalog",
        body: "pnpm knowledge:sync keeps versions, adapters, and Intent skills from rotting.",
      },
      {
        title: "Architecture canon",
        body: "Stack defaults for Express/Nest, Drizzle, React, and TanStack — without a platform lock-in.",
      },
    ],
    sample: {
      filename: "recommend.ts",
      language: "ts",
      code: `import { recommend, loadPlan } from "@eristack/ai-knowledge"

const result = recommend(["invoices", "login"])
const plan = loadPlan(result)`,
    },
  },
  {
    slug: "ai-workflow",
    name: "@eristack/ai-workflow",
    title: "AI Workflow",
    category: "ai" as const,
    directory: "packages/ai/ai-workflow",
    href: "/ai-workflow",
    docsHref: "/docs/ai-workflow",
    tagline: "Local MCP, indexed search, and sprint folders — low token.",
    description:
      "Local-first MCP, FTS+vector project index, and sprint/backlog/ADR folders — low-token agent tools that do not replace your existing stack.",
    status: "alpha" as const,
    install: "pnpm add @eristack/ai-workflow",
    highlights: [
      {
        title: "Local index",
        body: "FTS5 + on-device vectors. No API key required for project search.",
      },
      {
        title: "Sprint cadence",
        body: "Backlog, sprints, ADR, and summary under .eristack/workflow/.",
      },
      {
        title: "MCP that stays small",
        body: "Tools return ids, status, and short snippets — not the whole repo.",
      },
    ],
    sample: {
      filename: "mcp.json",
      language: "json",
      code: `{
  "mcpServers": {
    "eristack-workflow": {
      "command": "eristack-workflow-mcp"
    }
  }
}`,
    },
  },
  {
    slug: "ai-ticket-generator",
    name: "@eristack/ai-ticket-generator",
    title: "AI Ticket Generator",
    category: "ai" as const,
    directory: "packages/ai/ai-ticket-generator",
    href: "/ai-ticket-generator",
    docsHref: "/docs/ai-ticket-generator",
    tagline: "Portable bug + suggestion tickets for maintainers.",
    description:
      "Generate one markdown file with logs, scenario, fix plan, or a feasibility-gated suggestion — send it to maintainers for an immediate agent fixer-upper. Every @eristack package must subscribe via ticket.yaml.",
    status: "alpha" as const,
    install: "pnpm add -D @eristack/ai-ticket-generator",
    highlights: [
      {
        title: "Bug tickets that travel",
        body: "Repro, logs, scenario, and a fix plan in one attachable file.",
      },
      {
        title: "Suggestion + feasibility",
        body: "possible / partial / unlikely / needs-decision before an agent codes.",
      },
      {
        title: "Mandatory subscription",
        body: "Every package ships ticket.yaml — pnpm ticket:check enforces it.",
      },
    ],
    sample: {
      filename: "ticket.sh",
      language: "bash",
      code: `pnpm eristack-ticket bug \\
  --package @eristack/money \\
  --title "Money.sum mixed currency" \\
  --summary "Did not throw" \\
  --fix-plan "Add guard + test"`,
    },
  },
] as const;

export type PackageSlug = (typeof packages)[number]["slug"];

export function packagesByCategory() {
  return packageCategories.map((category) => ({
    ...category,
    packages: packages.filter((pkg) => pkg.category === category.id),
  }));
}

export function packageDirectory(slug: string) {
  const pkg = packages.find((item) => item.slug === slug);
  return pkg?.directory ?? `packages/${slug}`;
}

export function getCategory(id: string) {
  return packageCategories.find((item) => item.id === id);
}

export function getPackage(slug: string) {
  return packages.find((item) => item.slug === slug);
}

export function categoryIndex(categoryId: PackageCategoryId) {
  return packageCategories.findIndex((item) => item.id === categoryId) + 1;
}

export const librarySlugs = [
  ...packageCategories.map((category) => category.id),
  ...packages.map((pkg) => pkg.slug),
] as const;

export const startNav = { href: "/start", label: "Start here" } as const;

export const primaryNav = [
  startNav,
  { href: "/packages", label: "Libraries" },
  { href: "/compose", label: "Compose" },
  { href: "/docs", label: "Docs" },
  { href: "/blog", label: "Blog" },
  { href: "/support", label: "Support" },
] as const;

/** Paths that should light up the Libraries nav item. */
export function isLibrariesNavActive(pathname: string) {
  if (pathname === "/packages" || pathname.startsWith("/packages/")) return true;
  if (librarySlugs.some((slug) => pathname === `/${slug}`)) return true;
  return false;
}

export const companyNav = [
  { href: "/roadmap", label: "Roadmap" },
  { href: "/story", label: "Story" },
  { href: "/philosophy", label: "Philosophy" },
  { href: "/maintainers", label: "Maintainers" },
  { href: "/support", label: "Support & partners" },
] as const;

export const tenets = [
  {
    title: "Libraries, not platforms",
    body: "Ship a sharp library. Leave product decisions, UI chrome, and infrastructure ownership to the application.",
  },
  {
    title: "Business truth over clever APIs",
    body: "Money, sessions, and credentials have laws. Prefer correctness and boring edges over clever abstractions.",
  },
  {
    title: "Inject, don’t absorb",
    body: "Adapters accept your database, host, storage, and secrets. The package never invents env loading or opens connections for you.",
  },
  {
    title: "Compose with the ecosystem",
    body: "Express, Nest, Drizzle, React — thin shells over a pure core. Import the entry you need; ignore the rest.",
  },
  {
    title: "Document the contract",
    body: "Guides live next to the code. If behavior isn’t written down, it isn’t done.",
  },
  {
    title: "Version for trust",
    body: "Independent packages, Changesets, and GitHub Flow. Releases should feel deliberate — not accidental.",
  },
] as const;

/** Four package design targets — agent + consumer integration quality bar. */
export const packageDesignTargets = [
  {
    title: "Cheap to implement",
    body: "Finish integration in ≤3 files: one skill, one getting-started guide, optional adapter page.",
  },
  {
    title: "Predictable result",
    body: "Same core in forms, APIs, and tests — string-first money, explicit defaults, no silent coercion.",
  },
  {
    title: "High reliability",
    body: "Drizzle/DB-first production paths, real integration tests, hash-chained ledgers where audit matters.",
  },
  {
    title: "Clear boundaries",
    body: "Export registries and helpers consumers would copy — apps own UX, domain tables, and product rules.",
  },
] as const;

export const maintainers = [
  {
    name: "Michael Lam",
    role: "Senior Software Engineer / Tech Lead",
    company: "Erista",
    org: "eristack",
    github: "https://github.com/eristack",
    website: "https://erista.id",
    bio: "Builds and stewards Eristack — open enterprise business libraries extracted from real product work at Erista.",
  },
] as const;

export const supportTiers = [
  {
    name: "Community",
    price: "Free",
    description: "GitHub issues, discussions, and docs for open-source usage.",
    features: [
      "Public issue tracker",
      "Documentation & examples",
      "Best-effort responses",
    ],
    cta: { label: "Open an issue", href: "https://github.com/eristack/business-libs/issues" },
  },
  {
    name: "Enterprise support",
    price: "Custom",
    description:
      "Priority help for teams running Eristack libraries in production finance, ERP, and auth paths.",
    features: [
      "Private Slack / email channel",
      "Guaranteed response windows",
      "Upgrade & migration guidance",
      "Security advisory coordination",
    ],
    cta: { label: "Talk to us", href: "mailto:support@eristack.dev" },
  },
  {
    name: "Consultation",
    price: "Engagement",
    description:
      "Architecture reviews and pairing when you’re wiring money, sessions, or credentials into a greenfield or brownfield stack.",
    features: [
      "Domain modeling workshops",
      "Adapter & schema reviews",
      "Production readiness checklist",
      "Partner integration planning",
    ],
    cta: { label: "Book a consult", href: "mailto:partners@eristack.dev" },
  },
] as const;
