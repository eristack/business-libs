/** Sponsors and ways to support the project — shown on /sponsor only. */

export type SponsorEntry = {
  name: string;
  description: string;
  href?: string;
  tier?: "steward" | "partner" | "community";
};

export const sponsors: SponsorEntry[] = [
  {
    name: "Erista",
    description:
      "Stewards the monorepo, docs, agent knowledge sync, and release cadence for @eristack packages.",
    href: "https://erista.id",
    tier: "steward",
  },
  {
    name: "Contributors & maintainers",
    description:
      "Issues, docs fixes, and adapter work on GitHub — every merged PR keeps the spine honest for everyone.",
    href: "https://github.com/eristack/business-libs",
    tier: "community",
  },
];

export const sponsorActions = [
  {
    title: "Become a sponsor",
    body: "Fund roadmap items, co-marketing, or dedicated enablement — we align with integrators shipping on the spine.",
    cta: { label: "Email partners", href: "mailto:partners@eristack.dev" },
  },
  {
    title: "Star & share",
    body: "GitHub stars and npm installs signal which packages teams rely on — it helps prioritise docs and adapters.",
    cta: { label: "Star on GitHub", href: "https://github.com/eristack/business-libs" },
  },
  {
    title: "Contribute",
    body: "Docs, skills, recipes, tests, and adapter fixes — especially when you hit an edge case in production.",
    cta: {
      label: "Contribution guide",
      href: "https://github.com/eristack/business-libs/blob/main/README.md",
    },
  },
  {
    title: "File clear tickets",
    body: "Use @eristack/ai-ticket-generator skills for reproducible bug reports maintainers and agents can run.",
    cta: { label: "Open an issue", href: "https://github.com/eristack/business-libs/issues" },
  },
] as const;
