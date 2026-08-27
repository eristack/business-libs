export type DocsHubPathLink = {
  label: string;
  href: string;
};

export type DocsHubPath = {
  id: string;
  title: string;
  description: string;
  href: string;
  links?: DocsHubPathLink[];
};

/** Guided documentation journeys on `/docs`. */
export const docsHubPaths: DocsHubPath[] = [
  {
    id: "new-app",
    title: "New app",
    description:
      "Recommend first, stack defaults, and architecture guidance for greenfield TypeScript apps.",
    href: "/docs/ai-knowledge/getting-started",
    links: [
      { label: "Architecture", href: "/docs/ai-knowledge/architecture" },
      { label: "Start here", href: "/start" },
    ],
  },
  {
    id: "upgrade",
    title: "Upgrade Eristack",
    description:
      "Consumer upgrade checklist — outdated packages, export maps, Backseat peers.",
    href: "/docs/ai-knowledge/upgrading",
  },
  {
    id: "line-pricing",
    title: "Money + QUPS lines",
    description:
      "String-first amounts, line pricing, and form/API parity for invoice-style math.",
    href: "/docs/money/getting-started",
    links: [{ label: "QUPS", href: "/docs/qups/getting-started" }],
  },
  {
    id: "auth",
    title: "Auth + RBAC",
    description:
      "JWT sessions, credential stores, and boolean role permissions on your users table.",
    href: "/docs/jwt-auth/getting-started",
    links: [{ label: "RBAC", href: "/docs/rbac/getting-started" }],
  },
];
