"use client";

import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import {
  AnnotatedCode,
  CodeTabBar,
  PackageLegend,
} from "@/components/stack-compose/annotated-code";
import {
  composeCodeFiles,
  composePackageCatalog,
  composePackageCategory,
  composeSteps,
  stepsForPackage,
  tabHasFocus,
  type ComposeCodeTab,
  type ComposePackageSlug,
  type ComposeStep,
} from "@/lib/stack-compose";

export function ComposeExplorer() {
  const [activePackage, setActivePackage] =
    useState<ComposePackageSlug | null>(null);
  const [activeStepId, setActiveStepId] = useState<string>(composeSteps[0]!.id);
  const [activeTab, setActiveTab] = useState<ComposeCodeTab>("terminal");

  const visibleSteps = useMemo(() => {
    if (!activePackage) return composeSteps;
    return stepsForPackage(activePackage);
  }, [activePackage]);

  const activeStep =
    visibleSteps.find((s) => s.id === activeStepId) ?? visibleSteps[0]!;

  useEffect(() => {
    if (!visibleSteps.some((s) => s.id === activeStepId) && visibleSteps[0]) {
      setActiveStepId(visibleSteps[0].id);
    }
  }, [visibleSteps, activeStepId]);

  useEffect(() => {
    setActiveTab(activeStep.defaultTab);
  }, [activeStep.id, activeStep.defaultTab]);

  return (
    <div className="space-y-10">
      <PackageLegend
        catalog={composePackageCatalog}
        activePackage={activePackage}
        onSelect={(slug) => {
          setActivePackage(slug);
          if (slug) {
            const first = stepsForPackage(slug)[0];
            if (first) setActiveStepId(first.id);
          } else {
            setActiveStepId(composeSteps[0]!.id);
          }
        }}
      />

      <ScenarioRail
        steps={visibleSteps}
        activeStepId={activeStep.id}
        onSelect={setActiveStepId}
        filtered={activePackage !== null}
      />

      <StepPanel
        step={activeStep}
        activePackage={activePackage}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
    </div>
  );
}

function ScenarioRail({
  steps,
  activeStepId,
  onSelect,
  filtered,
}: {
  steps: ComposeStep[];
  activeStepId: string;
  onSelect: (id: string) => void;
  filtered: boolean;
}) {
  return (
    <div className="rounded-2xl border border-border/80 bg-muted/30 p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="font-mono text-[10px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
          Scenario{filtered ? " · filtered" : ""}
        </p>
        <p className="text-[12px] text-muted-foreground">
          Same three files — scenario jumps to the lines that matter
        </p>
      </div>
      <div className="mt-4 flex gap-1 overflow-x-auto pb-1">
        {steps.map((step, index) => {
          const active = step.id === activeStepId;
          return (
            <button
              key={step.id}
              type="button"
              onClick={() => onSelect(step.id)}
              className={cn(
                "shrink-0 rounded-lg border px-3 py-2 text-left transition-colors",
                active
                  ? "border-foreground bg-foreground text-background"
                  : "border-border bg-background text-foreground hover:bg-muted/60",
              )}
            >
              <span className="font-mono text-[9px] opacity-70">
                {String(index + 1).padStart(2, "0")}
              </span>
              <p className="mt-0.5 text-[12px] font-semibold leading-tight">
                {step.title}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function StepPanel({
  step,
  activePackage,
  activeTab,
  onTabChange,
}: {
  step: ComposeStep;
  activePackage: ComposePackageSlug | null;
  activeTab: ComposeCodeTab;
  onTabChange: (tab: ComposeCodeTab) => void;
}) {
  const focusRange = step.focus[activeTab];
  const file = composeCodeFiles[activeTab];

  return (
    <section className="scroll-mt-24 space-y-5">
      <header className="max-w-3xl space-y-2">
        <h2 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
          {step.title}
        </h2>
        <p className="text-[15px] leading-7 text-muted-foreground">
          {step.moment}
        </p>
        <div className="flex flex-wrap gap-1.5 pt-1">
          {step.packages.map((slug) => (
            <span
              key={slug}
              data-layer={composePackageCategory(slug)}
              className="rounded-md bg-[color:var(--layer-soft)] px-2 py-0.5 font-mono text-[10px] text-[color:var(--layer-accent)] ring-1 ring-[color:var(--layer-rail)]"
            >
              @{slug}
            </span>
          ))}
        </div>
      </header>

      <CodeTabBar
        activeTab={activeTab}
        onTabChange={onTabChange}
        stepFocus={step.focus}
      />

      <AnnotatedCode
        file={file}
        tab={activeTab}
        activePackage={activePackage}
        focusRange={focusRange}
        inactive={!tabHasFocus(step, activeTab)}
      />

      {!tabHasFocus(step, activeTab) ? (
        <p className="text-[12px] text-muted-foreground">
          This step focuses elsewhere — switch to{" "}
          {(["backend", "frontend", "terminal"] as const)
            .filter((t) => tabHasFocus(step, t))
            .map((t) => t)
            .join(" or ")}{" "}
          for the highlighted slice.
        </p>
      ) : null}
    </section>
  );
}
