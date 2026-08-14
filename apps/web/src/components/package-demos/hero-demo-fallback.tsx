import { DemoShell } from "@/components/package-demos/demo-shell";
import { cn } from "@/lib/utils";

/** Shown while a slug-specific hero demo chunk loads. */
export function HeroDemoFallback({ className }: { className?: string }) {
  return (
    <DemoShell live="Live · loading" className={className}>
      <div
        className={cn(
          "flex min-h-[8rem] items-center justify-center font-mono text-[11px] text-muted-foreground",
        )}
      >
        Preparing demo…
      </div>
    </DemoShell>
  );
}
