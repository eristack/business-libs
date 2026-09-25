"use client";

import { cn } from "@/lib/utils";
import { CopyCodeButton } from "@/components/copy-code-button";

type CodePanelShellProps = {
  code: string;
  className?: string;
  children: React.ReactNode;
};

export function CodePanelShell({
  code,
  className,
  children,
}: CodePanelShellProps) {
  return (
    <div className={cn("code-panel group/code relative", className)}>
      <div className="code-panel-copy-anchor">
        <CopyCodeButton getText={() => code} />
      </div>
      {children}
    </div>
  );
}
