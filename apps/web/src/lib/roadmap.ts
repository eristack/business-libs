import fs from "node:fs";
import path from "node:path";

const repoRoot = path.resolve(process.cwd(), "../..");
const roadmapDir = path.join(repoRoot, "roadmap");

export type RoadmapLink = {
  slug: string;
  title: string;
  description: string;
  href: string;
};

export type RoadmapSection = {
  id: string;
  title: string;
  description: string;
  links: RoadmapLink[];
};

export const roadmapSections: RoadmapSection[] = [
  {
    id: "work",
    title: "Work",
    description: "What ships now and next.",
    links: [
      {
        slug: "priorities",
        title: "Priorities",
        description: "In flight, sequenced next steps, and infra milestones.",
        href: "/roadmap/priorities",
      },
    ],
  },
  {
    id: "reference",
    title: "Reference",
    description: "Taxonomy and longer horizon.",
    links: [
      {
        slug: "horizon",
        title: "Horizon",
        description: "Planning only — draft packages; does not override Priorities or Layers.",
        href: "/roadmap/horizon",
      },
      {
        slug: "layers",
        title: "Layers",
        description: "Seven-layer stack and where packages belong.",
        href: "/roadmap/layers",
      },
      {
        slug: "backlog",
        title: "Backlog",
        description: "Ideas after near-term spine work lands.",
        href: "/roadmap/backlog",
      },
    ],
  },
  {
    id: "erp",
    title: "ERP",
    description: "Feature modules — strategy and reprioritization.",
    links: [
      {
        slug: "erp",
        title: "ERP modules",
        description: "Priority stack, module reference, gates, spine mapping.",
        href: "/roadmap/erp",
      },
    ],
  },
];

/** Flat list for static params, search, and legacy helpers. */
export const roadmapLinks: RoadmapLink[] = roadmapSections.flatMap(
  (section) => section.links,
);

export const roadmapPrinciples = [
  "Spine before verticals — money, auth, ledgers, access control first.",
  "Drizzle-default — memory stores are tests and demos only.",
  "One sharp package — focused libraries, not a platform.",
  "Docs + skills + recipes ship together every iteration.",
  "Thin adapters — apps own domain tables and connections.",
] as const;

export const roadmapStatusLegend = [
  { status: "Shipped", meaning: "On npm with docs" },
  { status: "Alpha", meaning: "Usable; API may move" },
  { status: "Scaffold", meaning: "Package + docs; core API pending" },
  { status: "Planned", meaning: "Named; not started" },
  { status: "Coming soon", meaning: "Layer or package reserved on site" },
] as const;

export function readRoadmapMarkdown(slug: string): string | null {
  const file = path.join(roadmapDir, `${slug}.md`);
  if (!fs.existsSync(file)) return null;
  return fs.readFileSync(file, "utf8");
}

export function readRoadmapReadme(): string {
  return fs.readFileSync(path.join(roadmapDir, "README.md"), "utf8");
}

export function roadmapSourcePath(slug: string) {
  return slug === "index" ? "roadmap/README" : `roadmap/${slug}`;
}

export function findRoadmapLink(slug: string): RoadmapLink | undefined {
  return roadmapLinks.find((link) => link.slug === slug);
}

export function adjacentRoadmapLinks(slug: string): {
  prev?: RoadmapLink;
  next?: RoadmapLink;
} {
  const index = roadmapLinks.findIndex((link) => link.slug === slug);
  if (index < 0) return {};
  return {
    prev: index > 0 ? roadmapLinks[index - 1] : undefined,
    next:
      index < roadmapLinks.length - 1 ? roadmapLinks[index + 1] : undefined,
  };
}
