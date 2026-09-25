import { getCatalog } from "@eristack/ai-knowledge";
import type { CatalogSkill } from "@eristack/ai-knowledge";
import type { DocPackageSlug } from "@/lib/docs";

const INTENT = "pnpm dlx @tanstack/intent@latest load";

/** ai-knowledge is omitted from generated catalog — static doc skill map. */
const AI_KNOWLEDGE_SKILLS: Record<string, CatalogSkill> = {
  "recommend-eristack": {
    id: "recommend-eristack",
    name: "recommend-eristack",
    packageName: "@eristack/ai-knowledge",
    description:
      "Route product asks to @eristack packages via recommend() and recipes before ad-hoc npm libs.",
    type: "core",
    loadCommand: `${INTENT} @eristack/ai-knowledge#recommend-eristack`,
  },
  "architecture-recommend": {
    id: "architecture-recommend",
    name: "architecture-recommend",
    packageName: "@eristack/ai-knowledge",
    description: "Canon app architecture: TypeScript, Drizzle, Express/Nest, React, TanStack stack.",
    type: "core",
    loadCommand: `${INTENT} @eristack/ai-knowledge#architecture-recommend`,
  },
  "upgrading-eristack": {
    id: "upgrading-eristack",
    name: "upgrading-eristack",
    packageName: "@eristack/ai-knowledge",
    description: "Upgrade consumer apps: outdated packages, export maps, Changesets 0.x rules.",
    type: "core",
    loadCommand: `${INTENT} @eristack/ai-knowledge#upgrading-eristack`,
  },
  "agent-workflow": {
    id: "agent-workflow",
    name: "agent-workflow",
    packageName: "@eristack/ai-knowledge",
    description: "Agent workflow: design targets, docs+skills+recipes every iteration.",
    type: "core",
    loadCommand: `${INTENT} @eristack/ai-knowledge#agent-workflow`,
  },
  "document-lines-erp": {
    id: "document-lines-erp",
    name: "document-lines-erp",
    packageName: "@eristack/ai-knowledge",
    description:
      "Header + QUPS lines ERP spine — qups, doc-number, pbac, data-grid, backseat mock.",
    type: "core",
    loadCommand: `${INTENT} @eristack/ai-knowledge#document-lines-erp`,
  },
};

function aiKnowledgeSkillForPage(pageSlug: string): CatalogSkill[] {
  if (pageSlug === "upgrading") {
    return [AI_KNOWLEDGE_SKILLS["upgrading-eristack"]];
  }
  if (pageSlug === "architecture") {
    return [AI_KNOWLEDGE_SKILLS["architecture-recommend"]];
  }
  if (pageSlug === "recommend" || pageSlug === "getting-started" || pageSlug === "index") {
    return [AI_KNOWLEDGE_SKILLS["recommend-eristack"]];
  }
  if (pageSlug === "skills" || pageSlug === "sync" || pageSlug === "authoring") {
    return [AI_KNOWLEDGE_SKILLS["agent-workflow"]];
  }
  return [AI_KNOWLEDGE_SKILLS["recommend-eristack"]];
}

const ERP_DOC_PACKAGES = new Set(["qups", "backseat", "pbac"]);

function erpCompanionSkill(packageSlug: DocPackageSlug, pageSlug: string): CatalogSkill | null {
  if (!ERP_DOC_PACKAGES.has(packageSlug)) return null;
  if (pageSlug !== "getting-started" && pageSlug !== "index") return null;
  return AI_KNOWLEDGE_SKILLS["document-lines-erp"];
}

const ADAPTER_PAGE_SLUGS = new Set([
  "adapters",
  "drizzle",
  "rest",
  "zod",
  "express",
  "nest",
  "client",
  "react",
  "backseat",
]);

/** Intent skills for a doc page — from synced ai-knowledge catalog. */
export function resolveDocSkills(
  packageSlug: DocPackageSlug,
  pageSlug: string,
): CatalogSkill[] {
  if (packageSlug === "ai-knowledge") {
    return aiKnowledgeSkillForPage(pageSlug);
  }

  const pkg = getCatalog().packages.find((entry) => entry.slug === packageSlug);
  if (!pkg || pkg.skills.length === 0) return [];

  const byId = (id: string) => pkg.skills.find((skill) => skill.id === id);

  if (pageSlug === "upgrading") {
    const skill = byId("upgrading-eristack");
    if (skill) return [skill];
  }
  if (pageSlug === "recommend" || pageSlug === "getting-started") {
    const skill = byId("recommend-eristack");
    if (skill) return [skill];
  }

  const isAdapterPage =
    pageSlug === "adapters" || ADAPTER_PAGE_SLUGS.has(pageSlug);

  if (isAdapterPage) {
    const adapterSkill = pkg.skills.find((skill) => skill.type === "adapter");
    if (adapterSkill) return [adapterSkill];
  }

  const coreSkill = pkg.skills.find((skill) => skill.type === "core");
  const primary = coreSkill ?? pkg.skills[0];
  const erp = erpCompanionSkill(packageSlug, pageSlug);
  return erp ? [primary, erp] : [primary];
}

export function formatSkillLabel(skill: CatalogSkill) {
  return `${skill.packageName}#${skill.id}`;
}
