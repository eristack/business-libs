export const siteConfig = {
  name: "Eristack",
  tagline: "Business primitives for TypeScript",
  description:
    "Small, sharp libraries for money, auth, document numbers, and the other domain building blocks enterprise stacks take for granted.",
  url: "https://eristack.dev",
  github: "https://github.com/eristack/business-libs",
  org: "https://github.com/eristack",
  npmOrg: "https://www.npmjs.com/org/eristack",
  erista: "https://erista.id",
  supportEmail: "support@eristack.dev",
  partnersEmail: "partners@eristack.dev",
} as const;

export const packages = [
  {
    slug: "money",
    name: "@eristack/money",
    title: "Money",
    description:
      "JSR 354–inspired amounts, totals, percentages, tax/discount helpers, rounding, allocation, and FX — string-first, never JS number money.",
    href: "/docs/money",
    status: "stable" as const,
  },
  {
    slug: "jwt-auth",
    name: "@eristack/jwt-auth",
    title: "JWT Auth",
    description:
      "JWT access + opaque refresh tokens, credentials as a child of your users, Drizzle / REST / Express / Nest / React adapters.",
    href: "/docs/jwt-auth",
    status: "stable" as const,
  },
  {
    slug: "doc-number",
    name: "@eristack/doc-number",
    title: "Doc Number",
    description:
      "Token-pattern document numbers with period resets, FormatStore / SequenceStore, and headless Drizzle / REST / Express / Nest / React format-config adapters.",
    href: "/docs/doc-number",
    status: "stable" as const,
  },
] as const;

export const primaryNav = [
  { href: "/packages", label: "Packages" },
  { href: "/docs", label: "Docs" },
  { href: "/blog", label: "Blog" },
  { href: "/support", label: "Support" },
] as const;

export const companyNav = [
  { href: "/story", label: "Story" },
  { href: "/philosophy", label: "Philosophy" },
  { href: "/maintainers", label: "Maintainers" },
  { href: "/support", label: "Support & partners" },
] as const;

export const tenets = [
  {
    title: "Libraries, not platforms",
    body: "Ship a sharp primitive. Leave product decisions, UI chrome, and infrastructure ownership to the application.",
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
    bio: "Builds and stewards Eristack — open business primitives extracted from real product work at Erista.",
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
