"use client";

import { AbacHeroDemo } from "@/components/package-demos/abac-hero-demo";
import { AiKnowledgeHeroDemo } from "@/components/package-demos/ai-knowledge-hero-demo";
import { AiTicketHeroDemo } from "@/components/package-demos/ai-ticket-hero-demo";
import { AiWorkflowHeroDemo } from "@/components/package-demos/ai-workflow-hero-demo";
import { DataGridHeroDemo } from "@/components/package-demos/data-grid-hero-demo";
import { PbacHeroDemo } from "@/components/package-demos/pbac-hero-demo";
import { QupsHeroDemo } from "@/components/package-demos/qups-hero-demo";
import { RbacHeroDemo } from "@/components/package-demos/rbac-hero-demo";

/**
 * Package landing hero visualization — client-mounted, auto lifecycle.
 */
export function PackageHeroDemo({
  slug,
  className,
}: {
  slug: string;
  className?: string;
}) {
  switch (slug) {
    case "qups":
      return <QupsHeroDemo className={className} />;
    case "rbac":
      return <RbacHeroDemo className={className} />;
    case "abac":
      return <AbacHeroDemo className={className} />;
    case "pbac":
      return <PbacHeroDemo className={className} />;
    case "data-grid":
      return <DataGridHeroDemo className={className} />;
    case "ai-knowledge":
      return <AiKnowledgeHeroDemo className={className} />;
    case "ai-workflow":
      return <AiWorkflowHeroDemo className={className} />;
    case "ai-ticket-generator":
      return <AiTicketHeroDemo className={className} />;
    default:
      return null;
  }
}
