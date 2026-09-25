/** Community & ecosystem content — update as real names and quotes are cleared for public use. */

export type UserFeedback = {
  quote: string;
  name: string;
  role: string;
  organization?: string;
};

export type OrganizationEntry = {
  name: string;
  description: string;
  href?: string;
  kind: "using" | "supporting";
};

export type TechStackGroup = {
  label: string;
  description: string;
  items: { name: string; href: string; note?: string }[];
};

export const userFeedback: UserFeedback[] = [
  {
    quote:
      "We stopped re-implementing money rounding in three services once everything went through @eristack/money — forms and API finally agree.",
    name: "Integrator (early access)",
    role: "Backend lead",
    organization: "ERP product team",
  },
  {
    quote:
      "The agent recipes matter as much as the code. recommend-eristack routes our team to doc-number and jwt-auth before we invent another npm dependency.",
    name: "Platform engineer",
    role: "Staff engineer",
    organization: "Internal platform",
  },
  {
    quote:
      "Backseat → Express graduation with the same route registration is the first mock-to-prod path that did not feel like a rewrite.",
    name: "Full-stack developer",
    role: "Tech lead",
    organization: "Horizon A/B pilot",
  },
];

export const organizationsUsing: OrganizationEntry[] = [
  {
    name: "Erista",
    description:
      "Product company where Eristack was extracted — operational apps on money, timestamps, document lines, and auth adapters.",
    href: "https://erista.id",
    kind: "using",
  },
  {
    name: "Open-source adopters",
    description:
      "Teams wiring @eristack/* from npm for finance, inventory, and session flows — we list logos when partners opt in.",
    kind: "using",
  },
];

export const organizationsSupporting: OrganizationEntry[] = [
  {
    name: "Erista",
    description:
      "Stewards the monorepo, docs, agent knowledge sync, and release cadence for @eristack packages.",
    href: "https://erista.id",
    kind: "supporting",
  },
  {
    name: "Contributors & maintainers",
    description:
      "Issues, docs fixes, and adapter work on GitHub — every merged PR keeps the spine honest for everyone.",
    href: "https://github.com/eristack/business-libs",
    kind: "supporting",
  },
];

export const technologyStack: TechStackGroup[] = [
  {
    label: "Monorepo & quality",
    description: "How the libraries are built and shipped.",
    items: [
      { name: "TypeScript", href: "https://www.typescriptlang.org/", note: "Strict ESM packages" },
      { name: "pnpm", href: "https://pnpm.io/", note: "Workspaces & catalogs" },
      { name: "Turborepo", href: "https://turbo.build/", note: "CI build graph" },
      { name: "Vitest", href: "https://vitest.dev/", note: "Unit & integration tests" },
      { name: "Changesets", href: "https://github.com/changesets/changesets", note: "Version & changelog" },
    ],
  },
  {
    label: "Persistence & validation",
    description: "Production defaults for adapters and apps.",
    items: [
      { name: "Drizzle ORM", href: "https://orm.drizzle.team/", note: "Default SQL stores" },
      { name: "PostgreSQL", href: "https://www.postgresql.org/", note: "Production dialect pgsql" },
      { name: "Zod 4", href: "https://zod.dev/", note: "Wire & form schemas" },
    ],
  },
  {
    label: "HTTP & services",
    description: "Thin shells around framework-free cores.",
    items: [
      { name: "Express", href: "https://expressjs.com/", note: "Reference routers" },
      { name: "NestJS", href: "https://nestjs.com/", note: "Modules & guards" },
      { name: "OpenAPI 3.1", href: "https://www.openapis.org/", note: "@eristack/rest emit" },
    ],
  },
  {
    label: "Frontend & agents",
    description: "Apps and this site.",
    items: [
      { name: "React", href: "https://react.dev/", note: "Headless hooks" },
      { name: "TanStack Query", href: "https://tanstack.com/query", note: "Client cache" },
      { name: "TanStack Router", href: "https://tanstack.com/router", note: "File routes" },
      { name: "TanStack Form", href: "https://tanstack.com/form", note: "String-first fields" },
      { name: "TanStack Intent", href: "https://tanstack.com/intent", note: "Skills & docs load" },
      { name: "Next.js", href: "https://nextjs.org/", note: "eristack.dev" },
      { name: "Tailwind CSS", href: "https://tailwindcss.com/", note: "Marketing UI" },
    ],
  },
];

export const supportUsActions = [
  {
    title: "Star & share",
    body: "GitHub stars and npm installs signal which packages teams rely on — it helps prioritise docs and adapters.",
    cta: { label: "Star on GitHub", href: "https://github.com/eristack/business-libs" },
  },
  {
    title: "Contribute",
    body: "Docs, skills, recipes, tests, and adapter fixes — especially when you hit an edge case in production.",
    cta: { label: "Contribution guide", href: "https://github.com/eristack/business-libs/blob/main/README.md" },
  },
  {
    title: "File clear tickets",
    body: "Use @eristack/ai-ticket-generator skills for reproducible bug reports maintainers and agents can run.",
    cta: { label: "Open an issue", href: "https://github.com/eristack/business-libs/issues" },
  },
  {
    title: "Partner or sponsor",
    body: "Fund roadmap items, co-marketing, or dedicated enablement — we align with integrators shipping on the spine.",
    cta: { label: "Partners email", href: "mailto:partners@eristack.dev" },
  },
  {
    title: "Enterprise support",
    body: "When libraries sit on a revenue or compliance path, paid support buys response windows and migration help.",
    cta: { label: "Services", href: "/support" },
  },
] as const;
