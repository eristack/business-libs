"use client";

import { Suspense, lazy, type ComponentType } from "react";
import { HeroDemoFallback } from "@/components/package-demos/hero-demo-fallback";
import type { PackageHeroDemoSlug } from "@/components/package-demos/demo-slugs";

type HeroDemoProps = { className?: string };

function lazyHero(
  loader: () => Promise<{ default: ComponentType<HeroDemoProps> }>,
) {
  return lazy(loader);
}

/**
 * One dynamic import per slug — avoids pulling Node-only packages (e.g. jwt-auth
 * scrypt) into unrelated package landings.
 */
const heroDemos: Record<PackageHeroDemoSlug, ReturnType<typeof lazyHero>> = {
  money: lazyHero(() =>
    import("@/components/package-demos/money-hero-demo").then((m) => ({
      default: m.MoneyHeroDemo,
    })),
  ),
  "doc-number": lazyHero(() =>
    import("@/components/package-demos/doc-number-hero-demo").then((m) => ({
      default: m.DocNumberHeroDemo,
    })),
  ),
  "jwt-auth": lazyHero(() =>
    import("@/components/package-demos/jwt-auth-hero-demo").then((m) => ({
      default: m.JwtAuthHeroDemo,
    })),
  ),
  backseat: lazyHero(() =>
    import("@/components/package-demos/backseat-hero-demo").then((m) => ({
      default: m.BackseatHeroDemo,
    })),
  ),
  multitab: lazyHero(() =>
    import("@/components/package-demos/multitab-hero-demo").then((m) => ({
      default: m.MultitabHeroDemo,
    })),
  ),
  qups: lazyHero(() =>
    import("@/components/package-demos/qups-hero-demo").then((m) => ({
      default: m.QupsHeroDemo,
    })),
  ),
  rbac: lazyHero(() =>
    import("@/components/package-demos/rbac-hero-demo").then((m) => ({
      default: m.RbacHeroDemo,
    })),
  ),
  abac: lazyHero(() =>
    import("@/components/package-demos/abac-hero-demo").then((m) => ({
      default: m.AbacHeroDemo,
    })),
  ),
  pbac: lazyHero(() =>
    import("@/components/package-demos/pbac-hero-demo").then((m) => ({
      default: m.PbacHeroDemo,
    })),
  ),
  "data-grid": lazyHero(() =>
    import("@/components/package-demos/data-grid-hero-demo").then((m) => ({
      default: m.DataGridHeroDemo,
    })),
  ),
  "hash-chained-ledger": lazyHero(() =>
    import("@/components/package-demos/hash-chained-ledger-hero-demo").then(
      (m) => ({ default: m.HashChainedLedgerHeroDemo }),
    ),
  ),
  "stock-movement": lazyHero(() =>
    import("@/components/package-demos/stock-movement-hero-demo").then((m) => ({
      default: m.StockMovementHeroDemo,
    })),
  ),
  "financial-ledger": lazyHero(() =>
    import("@/components/package-demos/financial-ledger-hero-demo").then((m) => ({
      default: m.FinancialLedgerHeroDemo,
    })),
  ),
  valuations: lazyHero(() =>
    import("@/components/package-demos/valuations-hero-demo").then((m) => ({
      default: m.ValuationsHeroDemo,
    })),
  ),
  "ai-knowledge": lazyHero(() =>
    import("@/components/package-demos/ai-knowledge-hero-demo").then((m) => ({
      default: m.AiKnowledgeHeroDemo,
    })),
  ),
  "ai-workflow": lazyHero(() =>
    import("@/components/package-demos/ai-workflow-hero-demo").then((m) => ({
      default: m.AiWorkflowHeroDemo,
    })),
  ),
  "ai-ticket-generator": lazyHero(() =>
    import("@/components/package-demos/ai-ticket-hero-demo").then((m) => ({
      default: m.AiTicketHeroDemo,
    })),
  ),
};

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
  const Demo = heroDemos[slug as PackageHeroDemoSlug];
  if (!Demo) return null;

  return (
    <Suspense fallback={<HeroDemoFallback className={className} />}>
      <Demo className={className} />
    </Suspense>
  );
}
