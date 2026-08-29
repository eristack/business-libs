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
      {motif === "timestamp" ? <TimestampMotif /> : null}
      {motif === "uom" ? <UomMotif /> : null}
      {motif === "percent" ? <PercentMotif /> : null}
      {motif === "fiscal-calendar" ? <FiscalCalendarMotif /> : null}
      {motif === "address" ? <AddressMotif /> : null}
      {motif === "doc-number" ? <DocNumberMotif /> : null}
      {motif === "doc-transitions" ? <DocTransitionsMotif /> : null}
      {motif === "qups" ? <QupsMotif /> : null}
      {motif === "data-grid" ? <DataGridMotif /> : null}
      {motif === "epoch" ? <EpochMotif /> : null}
      {motif === "opinion" ? <OpinionMotif /> : null}
      {motif === "jwt-auth" ? <JwtMotif /> : null}
      {motif === "rbac" ? <RbacMotif /> : null}
      {motif === "abac" ? <AbacMotif /> : null}
      {motif === "pbac" ? <PbacMotif /> : null}
      {motif === "ai-knowledge" ? <KnowledgeMotif /> : null}
      {motif === "ai-dev" ? <AiDevMotif /> : null}
      {motif === "ai-workflow" ? <WorkflowMotif /> : null}
      {motif === "ai-ticket-generator" ? <TicketMotif /> : null}
      {motif === "backseat" ? <BackseatMotif /> : null}
      {motif === "logger" ? <LoggerMotif /> : null}
      {motif === "rest" ? <RestMotif /> : null}
      {motif === "multitab" ? <MultitabMotif /> : null}
      {motif === "stock-movement" ? <StockMovementMotif /> : null}
      {motif === "financial-ledger" ? <FinancialLedgerMotif /> : null}
      {motif === "valuations" ? <ValuationsMotif /> : null}
      {motif === "hash-chained-ledger" ? <HashChainedLedgerMotif /> : null}
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

function UomMotif() {
  const units = [
    { u: "kg", x: "10%", y: "18%" },
    { u: "g", x: "24%", y: "38%" },
    { u: "L", x: "8%", y: "56%" },
    { u: "pcs", x: "28%", y: "68%" },
  ];
  return (
    <div className="absolute inset-0 text-[color:var(--layer-accent)] opacity-[0.15] dark:opacity-[0.22]">
      {units.map((item) => (
        <span
          key={item.u}
          className="absolute rounded-md border border-current/30 px-2 py-1 font-mono text-[13px]"
          style={{ left: item.x, top: item.y }}
        >
          {item.u}
        </span>
      ))}
      <span className="absolute top-[44%] left-[10%] font-mono text-[12px] opacity-80">
        1.5 kg → 1500 g
      </span>
      <span className="absolute bottom-[18%] left-[8%] font-mono text-[11px] opacity-70">
        convertUom · fixed ratio · string qty
      </span>
    </div>
  );
}

function PercentMotif() {
  return (
    <div className="absolute inset-0 text-[color:var(--layer-accent)] opacity-[0.15] dark:opacity-[0.22]">
      <div className="absolute top-[16%] left-[8%] space-y-2 font-mono text-[12px] leading-5">
        <p className="font-semibold">ratio · 0.11</p>
        <p className="pl-3 opacity-85">11% · VAT</p>
        <p className="pl-3 opacity-85">1100 bps</p>
        <p className="pl-3 opacity-70">percentOf("100") → 11</p>
      </div>
    </div>
  );
}

function FiscalCalendarMotif() {
  return (
    <div className="absolute inset-0 text-[color:var(--layer-accent)] opacity-[0.15] dark:opacity-[0.22]">
      <div className="absolute top-[16%] left-[8%] space-y-2 font-mono text-[12px] leading-5">
        <p className="font-semibold">FY2026 · P02</p>
        <p className="pl-3 opacity-85">2026-02-01 → 2026-02-28</p>
        <p className="pl-3 opacity-85">status · open</p>
        <p className="pl-3 opacity-70">wall date · Asia/Jakarta</p>
      </div>
    </div>
  );
}

function AddressMotif() {
  return (
    <div className="absolute inset-0 text-[color:var(--layer-accent)] opacity-[0.15] dark:opacity-[0.22]">
      <div className="absolute top-[16%] left-[8%] space-y-1.5 font-mono text-[11px] leading-5">
        <p>Jl. Sudirman No. 45</p>
        <p className="opacity-85">Jakarta 10220</p>
        <p className="opacity-75">ID · normalizeAddress</p>
      </div>
      <span className="absolute bottom-[20%] left-[8%] font-mono text-[11px] opacity-70">
        ship-to · bill-to · ISO country
      </span>
    </div>
  );
}

function DocTransitionsMotif() {
  return (
    <div className="absolute inset-0 text-[color:var(--layer-accent)] opacity-[0.15] dark:opacity-[0.22]">
      <div className="absolute top-[16%] left-[8%] space-y-2 font-mono text-[12px] leading-5">
        <p className="font-semibold">publicationGraph</p>
        <p className="pl-3 opacity-85">draft → submit → publish</p>
        <p className="pl-3 opacity-85">journalGraph · post</p>
        <p className="pl-3 opacity-70">lockGraph · lock/unlock</p>
      </div>
    </div>
  );
}

function OpinionMotif() {
  return (
    <div className="absolute inset-0 text-[color:var(--layer-accent)] opacity-[0.15] dark:opacity-[0.22]">
      <div className="absolute top-[14%] left-[8%] space-y-1.5 font-mono text-[11px] leading-5">
        <p className="font-semibold">GET /invoices/data-grid</p>
        <p className="opacity-80">POST /invoices</p>
        <p className="opacity-90">PATCH /invoices/:id/submit</p>
        <p className="opacity-70">DELETE /invoices/:id</p>
      </div>
    </div>
  );
}

function AiDevMotif() {
  return (
    <div className="absolute inset-0 text-[color:var(--layer-accent)] opacity-[0.15] dark:opacity-[0.22]">
      <div className="absolute top-[16%] left-[8%] space-y-2 font-mono text-[12px] leading-5">
        <p className="font-semibold">pnpm eristack plan --json</p>
        <p className="pl-3 opacity-85">check --profile pr</p>
        <p className="pl-3 opacity-85">sync docs · knowledge</p>
        <p className="pl-3 opacity-70">MCP · eristack-mcp</p>
      </div>
    </div>
  );
}

function LoggerMotif() {
  return (
    <div className="absolute inset-0 text-[color:var(--layer-accent)] opacity-[0.15] dark:opacity-[0.22]">
      <pre className="absolute top-[14%] left-[6%] font-mono text-[10px] leading-5 opacity-90">
        {`{"level":"info","msg":"request","requestId":"req_8f2"}`}
      </pre>
      <span className="absolute bottom-[18%] left-[8%] font-mono text-[11px] opacity-75">
        JSON-lines · requestId scope
      </span>
    </div>
  );
}

function RestMotif() {
  return (
    <div className="absolute inset-0 text-[color:var(--layer-accent)] opacity-[0.15] dark:opacity-[0.22]">
      <div className="absolute top-[16%] left-[8%] space-y-1.5 font-mono text-[11px] leading-5">
        <p className="font-semibold">defineRoutes([…])</p>
        <p className="opacity-85">toOpenApiDocument</p>
        <p className="opacity-75">Express · Nest mount</p>
      </div>
    </div>
  );
}

function QupsMotif() {
  return (
    <div className="absolute inset-0 text-[color:var(--layer-accent)] opacity-[0.15] dark:opacity-[0.22]">
      <div className="absolute top-[16%] left-[8%] space-y-2 font-mono text-[12px] leading-5">
        <p className="font-semibold">truth · unitPrice + subtotal</p>
        <p className="pl-3 opacity-85">UP 3 · S 10</p>
        <p className="pl-3 opacity-85">qty = 10/3</p>
        <p className="pl-3 opacity-70">product() → 10</p>
      </div>
    </div>
  );
}

function DataGridMotif() {
  return (
    <div className="absolute inset-0 font-mono text-[color:var(--layer-accent)] opacity-[0.15] dark:opacity-[0.22]">
      <span className="absolute top-[18%] left-[8%] text-[12px] tracking-wide">
        mode=advanced
      </span>
      <span className="absolute top-[32%] left-[8%] text-[12px] tracking-wide opacity-90">
        {"filters={…FilterNode}"}
      </span>
      <span className="absolute top-[46%] left-[8%] text-[12px] tracking-wide opacity-80">
        {"sorts=[{field,dir}]"}
      </span>
      <span className="absolute top-[60%] left-[8%] text-[12px] tracking-wide opacity-70">
        page=1&amp;pageSize=20
      </span>
      <span className="absolute top-[74%] left-[8%] text-[11px] tracking-[0.18em] uppercase opacity-60">
        items · pageInfo · query
      </span>
    </div>
  );
}

function EpochMotif() {
  return (
    <div className="absolute inset-0 text-[color:var(--layer-accent)] opacity-[0.15] dark:opacity-[0.22]">
      <div className="absolute top-[16%] left-[8%] space-y-2 font-mono text-[12px] leading-5">
        <p className="font-semibold">scope · orders</p>
        <p className="pl-3 opacity-85">server epoch 7</p>
        <p className="pl-3 opacity-85">client epoch 6</p>
        <p className="pl-3 opacity-70">→ refetch</p>
      </div>
      <div className="absolute bottom-[20%] left-[8%] font-mono text-[11px] opacity-75">
        bump(scope) after mutation · compare on read
      </div>
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

function RbacMotif() {
  return (
    <div className="absolute inset-0 text-[color:var(--layer-accent)] opacity-[0.15] dark:opacity-[0.22]">
      <div className="absolute top-[16%] left-[8%] space-y-2 font-mono text-[12px] leading-5">
        <p className="font-semibold">role · clerk</p>
        <p className="pl-3 opacity-85">orders.read ✓</p>
        <p className="pl-3 opacity-85">orders.create ✓</p>
        <p className="pl-3 opacity-60">orders.approve ✗</p>
      </div>
      <div className="absolute bottom-[20%] left-[8%] font-mono text-[11px] opacity-75">
        can(subject, permission) → boolean
      </div>
    </div>
  );
}

function AbacMotif() {
  return (
    <div className="absolute inset-0 text-[color:var(--layer-accent)] opacity-[0.15] dark:opacity-[0.22]">
      <div className="absolute top-[16%] left-[8%] space-y-2 font-mono text-[12px] leading-5">
        <p className="font-semibold">policy · book-value-limit</p>
        <p className="pl-3 opacity-85">subject.max ≤ 5_000_000</p>
        <p className="pl-3 opacity-85">resource.book = 1_200_000</p>
        <p className="pl-3 opacity-70">→ allow</p>
      </div>
    </div>
  );
}

function PbacMotif() {
  return (
    <div className="absolute inset-0 text-[color:var(--layer-accent)] opacity-[0.15] dark:opacity-[0.22]">
      <div className="absolute top-[16%] left-[8%] space-y-2 font-mono text-[12px] leading-5">
        <p className="font-semibold">document · job</p>
        <p className="pl-3 opacity-85">outstandingMinor &gt; 0</p>
        <p className="pl-3 opacity-85">status ∈ open | partial</p>
        <p className="pl-3 opacity-70">→ can-receive</p>
      </div>
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

function TicketMotif() {
  return (
    <div className="absolute inset-0 text-[color:var(--layer-accent)] opacity-[0.15] dark:opacity-[0.22]">
      <div className="absolute top-[16%] left-[8%] space-y-2 font-mono text-[12px] leading-5">
        <p className="font-semibold">.eristack/tickets/</p>
        <p className="pl-3 opacity-85">…-bug-money-sum-….md</p>
        <p className="pl-3 opacity-85">…-suggestion-grid-….md</p>
      </div>
      <div className="absolute top-[48%] left-[8%] rounded-lg border border-current/40 bg-[color:var(--layer-soft)] px-3 py-2 font-mono text-[11px] leading-5">
        <p className="font-semibold">kind · bug</p>
        <p className="opacity-75">logs · scenario · fix plan</p>
        <p className="opacity-75">agent handoff → maintainer</p>
      </div>
    </div>
  );
}

function BackseatMotif() {
  return (
    <div className="absolute inset-0 text-[color:var(--layer-accent)] opacity-[0.15] dark:opacity-[0.22]">
      <div className="absolute top-[14%] left-[8%] space-y-1.5 font-mono text-[11px] leading-5">
        <p className="font-semibold">GET /api/products</p>
        <p className="opacity-80">POST /api/partners</p>
        <p className="opacity-70">PATCH /api/purchaseOrders/po-1001</p>
      </div>
      <div className="absolute top-[46%] left-[8%] rounded-lg border border-current/40 bg-[color:var(--layer-soft)] px-3 py-2 font-mono text-[11px] leading-5">
        <p className="font-semibold">in-browser REST</p>
        <p className="opacity-75">IndexedDB · devtools · seed</p>
      </div>
    </div>
  );
}

function MultitabMotif() {
  const tabs = ["PO 1001", "SO 2044", "New tab", "Stock"];
  return (
    <div className="absolute inset-0 text-[color:var(--layer-accent)] opacity-[0.15] dark:opacity-[0.22]">
      <div className="absolute top-[20%] left-[8%] flex gap-1">
        {tabs.map((tab, i) => (
          <span
            key={tab}
            className={cn(
              "rounded-md border border-current/30 px-2 py-1 font-mono text-[10px]",
              i === 1 && "bg-[color:var(--layer-soft)] opacity-100",
            )}
            style={{ opacity: i === 1 ? 1 : 0.55 + i * 0.05 }}
          >
            {tab}
          </span>
        ))}
      </div>
      <span className="absolute top-[38%] left-[8%] font-mono text-[12px] tracking-wide opacity-80">
        /sales/orders · active
      </span>
    </div>
  );
}

function TimestampMotif() {
  return (
    <div className="absolute inset-0 text-[color:var(--layer-accent)] opacity-[0.15] dark:opacity-[0.22]">
      <div className="absolute top-[16%] left-[8%] space-y-2 font-mono text-[12px] leading-5">
        <p className="font-semibold">instant · UTC fact</p>
        <p className="pl-3 opacity-85">2026-08-27T14:32:00Z</p>
        <p className="font-semibold pt-1">wall · local intent</p>
        <p className="pl-3 opacity-85">2026-08-27 09:32</p>
        <p className="pl-3 opacity-70">America/New_York · DST-safe</p>
      </div>
    </div>
  );
}

function StockMovementMotif() {
  return (
    <div className="absolute inset-0 text-[color:var(--layer-accent)] opacity-[0.15] dark:opacity-[0.22]">
      <div className="absolute top-[16%] left-[8%] space-y-2 font-mono text-[12px] leading-5">
        <p className="font-semibold">location · WH-A/bin-12</p>
        <p className="pl-3 opacity-85">lot · L-8842</p>
        <p className="pl-3 opacity-85">append +120</p>
        <p className="pl-3 opacity-70">snapshot → 540 on hand</p>
      </div>
    </div>
  );
}

function FinancialLedgerMotif() {
  return (
    <div className="absolute inset-0 text-[color:var(--layer-accent)] opacity-[0.15] dark:opacity-[0.22]">
      <div className="absolute top-[16%] left-[8%] space-y-2 font-mono text-[12px] leading-5">
        <p className="font-semibold">accountId · AR:1001</p>
        <p className="pl-3 opacity-85">USD +1_250.00</p>
        <p className="pl-3 opacity-85">EUR −980.00</p>
        <p className="pl-3 opacity-70">@eristack/money · GL post</p>
      </div>
    </div>
  );
}

function ValuationsMotif() {
  return (
    <div className="absolute inset-0 text-[color:var(--layer-accent)] opacity-[0.15] dark:opacity-[0.22]">
      <div className="absolute top-[16%] left-[8%] space-y-2 font-mono text-[12px] leading-5">
        <p className="font-semibold">FIFO · consume layers</p>
        <p className="pl-3 opacity-85">L1 · 10 @ 12.50</p>
        <p className="pl-3 opacity-85">L2 · 5 @ 13.00</p>
        <p className="pl-3 opacity-70">COGS → 155.00</p>
      </div>
    </div>
  );
}

function HashChainedLedgerMotif() {
  return (
    <div className="absolute inset-0 text-[color:var(--layer-accent)] opacity-[0.15] dark:opacity-[0.22]">
      <div className="absolute top-[16%] left-[8%] space-y-2 font-mono text-[12px] leading-5">
        <p className="font-semibold">entry #42</p>
        <p className="pl-3 opacity-85">prev · a3f8…c91e</p>
        <p className="pl-3 opacity-85">SHA-256 chain</p>
        <p className="pl-3 opacity-70">verify() · tamper → fail</p>
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
    infrastructure: ["runtime", "mock", "glue"],
    ui: ["surface", "tabs", "chrome"],
    features: ["scaffold", "vertical", "later"],
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
