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
