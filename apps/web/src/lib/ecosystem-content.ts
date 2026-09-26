/** Home-page community content — feedback, adopters, technology stack. */

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
  },
  {
    name: "Open-source adopters",
    description:
      "Teams wiring @eristack/* from npm for finance, inventory, and session flows — we list logos when partners opt in.",
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
    label: "Auth & SSO",
    description: "@eristack/oauth client + jwt-auth sessions — IdP login, your JWTs.",
    items: [
      {
        name: "Google OAuth",
        href: "https://developers.google.com/identity/protocols/oauth2",
        note: "createGoogleOAuthDriver",
      },
      {
        name: "OpenID Connect",
        href: "https://openid.net/connect/",
        note: "createOidcOAuthDriver (Azure, Okta, …)",
      },
      {
        name: "OAuth getting started",
        href: "/docs/oauth/getting-started",
        note: "PKCE + jwt-auth handoff",
      },
    ],
  },
  {
    label: "Payments & PSPs",
    description: "@eristack/payment-manager + payment-instrument — intents in SQL, tokens not PAN.",
    items: [
      {
        name: "Stripe",
        href: "https://stripe.com/docs",
        note: "createStripePaymentDriver peer",
      },
      {
        name: "Xendit",
        href: "https://docs.xendit.co/",
        note: "SEA checkout + callback token webhooks",
      },
      {
        name: "Payment intents",
        href: "/docs/payment-manager/getting-started",
        note: "Idempotency + Drizzle history",
      },
    ],
  },
  {
    label: "Files & object storage",
    description: "@eristack/file-manager — metadata in SQL, bytes in the cloud.",
    items: [
      {
        name: "Amazon S3",
        href: "https://aws.amazon.com/s3/",
        note: "Default production driver",
      },
      {
        name: "AWS SDK for JavaScript",
        href: "https://docs.aws.amazon.com/sdk-for-javascript/",
        note: "Presigned PUT/GET",
      },
      {
        name: "Presigned uploads",
        href: "/docs/file-manager/s3-and-presigned",
        note: "Browser → S3 without proxying bytes",
      },
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
