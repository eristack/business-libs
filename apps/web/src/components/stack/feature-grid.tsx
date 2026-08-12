type FeatureGridProps = {
  highlights: readonly { title: string; body: string }[];
};

export function FeatureGrid({ highlights }: FeatureGridProps) {
  return (
    <div className="grid gap-6 sm:grid-cols-3">
      {highlights.map((item, index) => (
        <div
          key={item.title}
          className="rounded-xl border border-border bg-card/80 px-4 py-4"
        >
          <p className="font-mono text-[11px] text-accent tabular-nums">
            {String(index + 1).padStart(2, "0")}
          </p>
          <h3 className="mt-2 text-[15px] font-semibold tracking-tight">
            {item.title}
          </h3>
          <p className="mt-2 text-[13px] leading-6 text-muted-foreground">
            {item.body}
          </p>
        </div>
      ))}
    </div>
  );
}
