"use client";

import { Sparkles } from "lucide-react";
import { CopyCodeButton } from "@/components/copy-code-button";
import { formatSkillLabel } from "@/lib/doc-agent-skills";
import type { CatalogSkill } from "@eristack/ai-knowledge";

type DocsSkillStripProps = {
  skills: CatalogSkill[];
};

export function DocsSkillStrip({ skills }: DocsSkillStripProps) {
  if (skills.length === 0) return null;

  const skill = skills[0];

  return (
    <div className="docs-skill-strip no-print mt-4 rounded-lg border border-violet-500/20 bg-violet-500/[0.06] px-3 py-2.5 dark:border-violet-400/15 dark:bg-violet-400/[0.08]">
      <div className="flex items-start gap-2.5">
        <Sparkles
          className="mt-0.5 size-4 shrink-0 text-violet-700 dark:text-violet-300"
          aria-hidden
        />
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold tracking-[0.08em] text-violet-900 uppercase dark:text-violet-200">
            Agent · load skill first
          </p>
          <p className="mt-0.5 text-[12px] leading-5 text-muted-foreground">
            {skill.description}
          </p>
          <div className="mt-2 flex items-center gap-2 rounded-md border border-border/50 bg-background/80 px-2.5 py-1.5">
            <code className="min-w-0 flex-1 truncate font-mono text-[11px] text-foreground">
              {formatSkillLabel(skill)}
            </code>
            <CopyCodeButton
              getText={() => skill.loadCommand}
              label="Copy Intent load command"
              className="size-7 shrink-0 opacity-100"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
