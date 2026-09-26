export const strengths = [
  {
    title: "Agent-first integration",
    body: "Recipes, skills, and docs designed so AI assistants wire money, auth, and ERP paths in a few files — not by reinventing helpers.",
  },
  {
    title: "Core vs adapters",
    body: "Framework-free cores with thin Express, Nest, Drizzle, and React shells. Same rules in forms and on the server.",
  },
  {
    title: "Production defaults",
    body: "Drizzle/Postgres paths, S3 presigned uploads, hash-chained ledgers, string-first money — not in-memory demos dressed as defaults.",
  },
] as const;

export const tradeoffs = [
  {
    title: "Opinionated stack",
    body: "We optimize for TypeScript, Drizzle, and TanStack — not every framework under the sun.",
  },
  {
    title: "0.x velocity",
    body: "Libraries move fast; read changelogs and pin semver ranges in production.",
  },
  {
    title: "You own the product",
    body: "We ship primitives and capabilities, not a full ERP — your tables, UX, and policies stay in your app.",
  },
] as const;

export const historyMilestones = [
  {
    year: "2024",
    title: "Primitives first",
    body: "Money and document numbers — prove domain types before any platform chrome.",
  },
  {
    year: "2025",
    title: "Horizon A → B",
    body: "Backseat mock APIs graduate to Express/Nest with mirror tests and shared route registration.",
  },
  {
    year: "2026",
    title: "Agent knowledge layer",
    body: "Recipes, ai-knowledge sync, and workflow MCP — libraries discoverable by product language.",
  },
] as const;

export const storyChapters = [
  {
    id: "problem",
    label: "The gap",
    title: "Business software keeps reinventing the same ledger math",
    body: "Every ERP team rebuilds money rounding, document sequences, JWT refresh rotation, and list filters. Agents copy float literals from Stack Overflow. The bugs look familiar because the code is familiar.",
  },
  {
    id: "bet",
    label: "Our bet",
    title: "Publish the boring parts as libraries agents can trust",
    body: "Eristack is a monorepo of @eristack packages: primitives, capabilities, services, and infrastructure adapters. One changelog, one JSON error envelope, one recommend() entrypoint before npm roulette.",
  },
  {
    id: "how",
    label: "How we build",
    title: "Cheap to integrate, hard to misuse",
    body: "Four design targets: token-budget docs, predictable core behavior, Drizzle-first reliability, and clear boundaries — export what consumers would otherwise duplicate.",
  },
  {
    id: "now",
    label: "Today",
    title: "Marketing site reboot — docs follow the story",
    body: "This site leads with why and what ships. Package guides stay in-repo markdown; full doc browsing returns in a focused pass without the old layer maze.",
  },
] as const;
