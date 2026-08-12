import { cn } from "@/lib/utils";
import type { LibraryMotifId } from "@/lib/layer-theme";

type LibraryMotifProps = {
  motif: LibraryMotifId;
  className?: string;
};

/** Decorative symbolism behind package heroes — visible, still restrained. */
export function LibraryMotif({ motif, className }: LibraryMotifProps) {
  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden select-none",
        "mask-[linear-gradient(90deg,black_0%,black_42%,transparent_78%)]",
        className,
      )}
      aria-hidden
    >
      <div className="absolute top-[-10%] right-[18%] size-[22rem] rounded-full bg-[color:var(--layer-glow)] blur-3xl" />
      {motif === "money" ? <MoneyMotif /> : null}
      {motif === "doc-number" ? <DocNumberMotif /> : null}
      {motif === "jwt-auth" ? <JwtMotif /> : null}
      {motif === "ai-knowledge" ? <KnowledgeMotif /> : null}
      {motif === "ai-workflow" ? <WorkflowMotif /> : null}
    </div>
  );
}

function MoneyMotif() {
  const symbols = [
    { s: "$", x: "12%", y: "18%", size: "5.5rem", rot: -12 },
    { s: "€", x: "28%", y: "42%", size: "3.4rem", rot: 8 },
    { s: "¥", x: "8%", y: "58%", size: "4rem", rot: 14 },
    { s: "£", x: "34%", y: "14%", size: "2.8rem", rot: -6 },
    { s: "₹", x: "22%", y: "72%", size: "2.4rem", rot: 10 },
  ];
  return (
    <div className="absolute inset-0 text-[color:var(--layer-accent)] opacity-[0.16] dark:opacity-[0.22]">
      {symbols.map((item) => (
        <span
          key={item.s}
          className="absolute font-serif font-semibold"
          style={{
            left: item.x,
            top: item.y,
            fontSize: item.size,
            transform: `rotate(${item.rot}deg)`,
          }}
        >
          {item.s}
        </span>
      ))}
      <span className="absolute bottom-[20%] left-[10%] font-mono text-[12px] tracking-[0.28em] uppercase">
        USD · EUR · JPY
      </span>
    </div>
  );
}

function DocNumberMotif() {
  return (
    <div className="absolute inset-0 text-[color:var(--layer-accent)] opacity-[0.15] dark:opacity-[0.22]">
      <span className="absolute top-[16%] left-[8%] font-mono text-[1.65rem] tracking-wide">
        PO-2026-00042
      </span>
      <span className="absolute top-[34%] left-[10%] font-mono text-[13px] tracking-wide opacity-80">
        INV/{"{YYYY}"}/{"{SEQ:5}"}
      </span>
      <span className="absolute top-[48%] left-[10%] font-mono text-[13px] tracking-wide opacity-70">
        RCPT/{"{YY}{MM}"}/{"{SEQ:4}"}
      </span>
      <span className="absolute top-[62%] left-[10%] font-mono text-[12px] tracking-wide opacity-60">
        DN-26-0318-0007
      </span>
    </div>
  );
}

function JwtMotif() {
  return (
    <div className="absolute inset-0 text-[color:var(--layer-accent)] opacity-[0.15] dark:opacity-[0.22]">
      <pre className="absolute top-[14%] left-[6%] font-mono text-[11px] leading-5 sm:text-[12px] sm:leading-6">
        {`{
  "alg": "HS256",
  "typ": "JWT"
}
.
{
  "sub": "user_18f2",
  "sid": "sess_9c"
}`}
      </pre>
      <span className="absolute bottom-[18%] left-[6%] max-w-[55%] break-all font-mono text-[10px] leading-4 tracking-tight opacity-80">
        eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1c2VyXzE4ZjIifQ
      </span>
    </div>
  );
}

function KnowledgeMotif() {
  const tags = [
    "recommend()",
    "invoices → money",
    "login → jwt-auth",
    "recipes.yaml",
  ];
  return (
    <div className="absolute inset-0 text-[color:var(--layer-accent)] opacity-[0.16] dark:opacity-[0.22]">
      {tags.map((tag, index) => (
        <span
          key={tag}
          className="absolute rounded-md border border-current/35 bg-[color:var(--layer-soft)] px-2.5 py-1 font-mono text-[12px]"
          style={{
            left: `${8 + (index % 2) * 22}%`,
            top: `${16 + index * 16}%`,
            transform: `rotate(${(index % 2 === 0 ? -1 : 1) * 3}deg)`,
          }}
        >
          {tag}
        </span>
      ))}
      <svg
        className="absolute top-[20%] left-[38%] h-40 w-48 opacity-50"
        viewBox="0 0 200 120"
        fill="none"
      >
        <path
          d="M20 60 H70 M70 30 V90 M70 30 H130 M70 90 H130 M130 30 V90 M130 60 H180"
          stroke="currentColor"
          strokeWidth="1.4"
        />
        <circle cx="20" cy="60" r="4.5" fill="currentColor" />
        <circle cx="70" cy="30" r="4.5" fill="currentColor" />
        <circle cx="70" cy="90" r="4.5" fill="currentColor" />
        <circle cx="130" cy="30" r="4.5" fill="currentColor" />
        <circle cx="130" cy="90" r="4.5" fill="currentColor" />
        <circle cx="180" cy="60" r="4.5" fill="currentColor" />
      </svg>
    </div>
  );
}

function WorkflowMotif() {
  return (
    <div className="absolute inset-0 text-[color:var(--layer-accent)] opacity-[0.15] dark:opacity-[0.22]">
      <div className="absolute top-[16%] left-[8%] space-y-2 font-mono text-[12px] leading-5">
        <p className="font-semibold">.eristack/workflow/</p>
        <p className="pl-3 opacity-85">backlog.yaml</p>
        <p className="pl-3 opacity-85">sprints/2026-08/</p>
        <p className="pl-6 opacity-70">plan.md</p>
        <p className="pl-6 opacity-70">tasks.yaml</p>
        <p className="pl-3 opacity-85">adr/</p>
      </div>
      <div className="absolute bottom-[18%] left-[8%] rounded-lg border border-current/40 bg-[color:var(--layer-soft)] px-3 py-2 font-mono text-[11px] leading-5">
        <p className="font-semibold">mcp · search</p>
        <p className="opacity-75">fts5 + vector · rrf</p>
      </div>
    </div>
  );
}

/** Softer layer-only watermark when there is no package motif. */
export function LayerMotif({
  layerId,
  className,
}: {
  layerId: string;
  className?: string;
}) {
  const marks: Record<string, string[]> = {
    primitive: ["type", "value", "pure"],
    capability: ["compose", "format", "store"],
    service: ["session", "inject", "rotate"],
    ai: ["agent", "local", "index"],
  };
  const words = marks[layerId] ?? [];

  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden select-none",
        "text-[color:var(--layer-accent)] opacity-[0.1] dark:opacity-[0.14]",
        "mask-[linear-gradient(90deg,black_0%,black_45%,transparent_75%)]",
        className,
      )}
      aria-hidden
    >
      <div className="absolute top-[-8%] right-[22%] size-[18rem] rounded-full bg-[color:var(--layer-glow)] blur-3xl" />
      {words.map((word, index) => (
        <span
          key={word}
          className="absolute font-semibold tracking-[0.22em] uppercase"
          style={{
            left: `${10 + index * 16}%`,
            top: `${22 + (index % 2) * 28}%`,
            fontSize: "1.75rem",
          }}
        >
          {word}
        </span>
      ))}
    </div>
  );
}
