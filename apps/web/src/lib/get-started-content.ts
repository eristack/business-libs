export const getStartedSteps = [
  {
    title: "Describe the product, not the package list",
    body: "Tell your agent what you are building — invoices, inventory, login, approval flows — not which npm names to guess. Eristack is wide on purpose.",
  },
  {
    title: "Drop an AGENTS.md in your repo root",
    body: "Give coding agents standing orders: load Eristack recipes first, use Drizzle in production, never float money. Copy the starter below or fork ours from GitHub.",
  },
  {
    title: "Let recommend() pick the spine",
    body: "With `@eristack/ai-knowledge`, agents map product language to packages and skills — money, jwt-auth, doc-number, data-grid, QUPS, ledgers — without you catalog-shopping.",
  },
  {
    title: "Scaffold the monorepo, then deepen",
    body: "Architecture skill → pnpm apps (API + web) → install only what recipes returned → wire from `examples/*` and package getting-started guides on GitHub.",
  },
] as const;

/** Minimal AGENTS.md for consumer repos — not the full business-libs maintainer file. */
export const starterAgentsMd = `# Agent notes — Eristack consumer

Load these **before** choosing npm libraries or reinventing money, auth, or document numbers:

\`\`\`bash
pnpm dlx @tanstack/intent@latest load @eristack/ai-knowledge#recommend-eristack
pnpm dlx @tanstack/intent@latest load @eristack/ai-knowledge#architecture-recommend
pnpm dlx @tanstack/intent@latest load @eristack/ai-knowledge#stack-defaults
\`\`\`

For ERP-style documents (lines, totals, statuses, lists):

\`\`\`bash
pnpm dlx @tanstack/intent@latest load @eristack/ai-knowledge#document-lines-erp
\`\`\`

## Hard rules for this codebase

- TypeScript, **pnpm** monorepo (e.g. \`apps/web\`, \`apps/api\`, shared \`packages/*\` only when needed).
- **Money:** \`@eristack/money\` — string amounts; no JS number literals for currency.
- **Persistence:** Drizzle + Postgres in production; SQLite only in tests unless we say otherwise.
- **Auth:** \`@eristack/jwt-auth\` — credentials are a child of *our* users table, not a library-owned users table.
- **Recommend first:** run \`recommend("…")\` / recipes from \`@eristack/ai-knowledge\` for every feature ask.

## First scaffold prompt (paste into your agent)

Scaffold a pnpm TypeScript monorepo for **[YOUR PRODUCT]**.

1. Load \`@eristack/ai-knowledge#architecture-recommend\` and \`#recommend-eristack\`.
2. Propose apps (React + Vite or Next, Express or Nest API) and which \`@eristack/*\` packages match **[e.g. login, invoice lines, doc numbers, dynamic lists]**.
3. Install only those packages; wire minimal happy-path flows with Drizzle stores and the official adapters.
4. Keep this AGENTS.md at the repo root and update it when we add domains.
`;

export const agentKickoffPrompt = `I am starting a new TypeScript monorepo for: [describe product in one paragraph].

Follow the AGENTS.md in this repo. Before writing code:
1. Load @eristack/ai-knowledge#recommend-eristack and #architecture-recommend (TanStack Intent).
2. List which @eristack packages and skills you will use and why.
3. Scaffold pnpm workspace (apps + optional packages), Drizzle, and the thinnest vertical slice for [one core flow].

Do not pick generic npm money/auth/libs — use Eristack recipes first.`;

/** Short “if this, then that” paths — paste the *Then* line into agent chat. */
export const getStartedTips = [
  {
    want: "The newest @eristack versions in my app",
    then: "Ask your agent to load upgrading guidance, diff versions, and implement the plan — do not hand-edit package.json from memory.",
    load: "@eristack/ai-knowledge#upgrading-eristack",
    prompt:
      "Load @eristack/ai-knowledge#upgrading-eristack (Intent). Run pnpm outdated for @eristack/*, read the relevant changelogs on eristack.dev, then apply the upgrade steps and fix breakages.",
  },
  {
    want: "To pick libraries without reading every package doc",
    then: "Describe the product feature in plain language; let recommend() return packages, skills, and load order.",
    load: "@eristack/ai-knowledge#recommend-eristack",
    prompt:
      'Using @eristack/ai-knowledge recommend() / recipes, map this feature to packages and Intent skills: "[your feature]". List load commands before coding.',
  },
  {
    want: "Invoices, jobs, or any document with lines and totals",
    then: "Load the document-lines ERP spine (QUPS, doc-number, lists, optional Backseat mock) before you design tables.",
    load: "@eristack/ai-knowledge#document-lines-erp",
  },
  {
    want: "Login and sessions without a library-owned users table",
    then: "Use jwt-auth with credentials as a child of your users table; wire Drizzle + Express from getting-started.",
    load: "@eristack/jwt-auth#jwt-auth-adapters",
  },
  {
    want: "Browser uploads to S3 (no proxying file bytes through your API)",
    then: "Use file-manager presign → complete → FileRef in Postgres; protect Express routes with your auth.",
    load: "@eristack/file-manager#file-manager-adapters",
  },
  {
    want: "Sign in with Google, Microsoft, GitHub, Apple, or enterprise OIDC (not passwords)",
    then: "Pick preset drivers from docs/drivers.md → oauth + PKCE → upsert user → jwt-auth issueTokens.",
    load: "@eristack/oauth#oauth-client-core",
    prompt:
      "Load @eristack/oauth docs/drivers.md and getting-started. Register createGoogleOAuthDriver / createMicrosoftOAuthDriver / etc., Drizzle pending store, Express /:provider/login and GET|POST callback with onCallback → issueTokens.",
  },
  {
    want: "Transactional email, SMS, or WhatsApp (SendGrid, Twilio, …)",
    then: "comms hub + vendor drivers + Drizzle message log — idempotent send keys like payment-manager.",
    load: "@eristack/comms#comms-adapters",
    prompt:
      "Load @eristack/comms getting-started and vendors.md. Wire createSendGridEmailDriver or createTwilioDriver, createDrizzleCommsStore, createCommsRouter; guard POST /comms/send with jwt-auth.",
  },
  {
    want: "Stripe or Xendit checkout with idempotent charges and webhooks",
    then: "payment-manager for intents + Drizzle history; payment-instrument for saved card tokens — never PAN in SQL.",
    load: "@eristack/payment-manager#payment-manager-adapters",
    prompt:
      "Load @eristack/payment-manager getting-started and @eristack/payment-instrument security. Wire createPaymentManager + Express router + webhook verification; use toPersistable for saved methods.",
  },
  {
    want: "Country codes or UN/LOCODE ports on masters and B/L fields",
    then: "Registries packages validate codes; your enabled rows stay in app tables + data-grid.",
    load: "@eristack/iso-3166#iso-3166-core",
    prompt:
      "Use @eristack/iso-3166 for assigned alpha-2/alpha-3 and @eristack/unlocode for five-char locodes. Normalize on write; do not duplicate ISO lists in the app.",
  },
  {
    want: "A working API in the browser before Postgres is ready",
    then: "Horizon A: Backseat + IndexedDB factories, then graduate the same routes to Express + Drizzle.",
    load: "@eristack/ai-knowledge#backseat-then-backend",
  },
  {
    want: "Filterable, sortable admin lists from the URL",
    then: "data-grid for query parse + Drizzle list execution; keep joins in your app, library runs filter/sort/page.",
    load: "@eristack/data-grid#data-grid-adapters",
  },
  {
    want: "A maintainer-ready bug report from your agent",
    then: "Generate a portable ticket markdown with repro and fix plan — send to support or your own PR branch.",
    load: "@eristack/ai-ticket-generator#ai-ticket-bug",
  },
] as const;

export const intentLoads = [
  {
    label: "Route features to packages",
    skill: "@eristack/ai-knowledge#recommend-eristack",
  },
  {
    label: "Monorepo + stack layout",
    skill: "@eristack/ai-knowledge#architecture-recommend",
  },
  {
    label: "Drizzle, adapters, money defaults",
    skill: "@eristack/ai-knowledge#stack-defaults",
  },
  {
    label: "Agent workflow + package targets",
    skill: "@eristack/ai-knowledge#agent-workflow",
  },
] as const;
