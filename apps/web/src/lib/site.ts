export const siteConfig = {
  name: "Eristack",
  tagline: "Enterprise business libraries for TypeScript",
  description:
    "Open enterprise libraries for money, auth, document numbers, AI workflow, and the other domain building blocks business stacks take for granted.",
  url: "https://eristack.dev",
  github: "https://github.com/eristack/business-libs",
  org: "https://github.com/eristack",
  npmOrg: "https://www.npmjs.com/org/eristack",
  erista: "https://erista.id",
  supportEmail: "support@eristack.dev",
  partnersEmail: "partners@eristack.dev",
} as const;

/** Display / filesystem order: primitive → capability → service → ai */
export const packageCategories = [
  {
    id: "primitive",
    label: "Primitive",
    href: "/primitive",
    tagline: "Domain value types you can trust in a ledger.",
    description:
      "Core domain value types — money and other pure calculation building blocks. No frameworks, no HTTP, no database — just correct types.",
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
        title: "String-first money",
        body: "Prefer decimal strings over JS number literals. Ledgers stay honest.",
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

export const packageStatuses = ["alpha", "beta", "stable"] as const;
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
      "JSR 354–inspired amounts, totals, percentages, tax/discount helpers, rounding, allocation, and FX — string-first, never JS number money.",
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
        title: "Ledger boundaries",
        body: "Round, allocate without losing cents, convert with rates you supply, serialize as decimal strings.",
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

export const primaryNav = [
  { href: "/packages", label: "Libraries" },
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
