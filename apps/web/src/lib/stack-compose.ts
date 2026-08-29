import { getPackage, packages, type PackageCategoryId } from "@/lib/site";

export type ComposePackageSlug = (typeof packages)[number]["slug"];

export type ComposeCodeLine = {
  text: string;
  packages?: ComposePackageSlug[];
};

export type ComposeCodeFile = {
  filename: string;
  lines: ComposeCodeLine[];
};

export type ComposeFocusRange = {
  from: number;
  to: number;
};

export type ComposeCodeTab = "backend" | "frontend" | "terminal";

export type ComposeStep = {
  id: string;
  title: string;
  moment: string;
  packages: ComposePackageSlug[];
  focus: Partial<Record<ComposeCodeTab, ComposeFocusRange>>;
  defaultTab: ComposeCodeTab;
};

/** Short chip label in code gutters */
export const composePackageShort: Record<ComposePackageSlug, string> = {
  money: "money",
  timestamp: "time",
  "doc-number": "doc#",
  qups: "qups",
  "stock-movement": "stock",
  "financial-ledger": "gl",
  valuations: "fifo",
  "data-grid": "grid",
  "jwt-auth": "jwt",
  rbac: "rbac",
  abac: "abac",
  pbac: "pbac",
  "hash-chained-ledger": "chain",
  epoch: "epoch",
  backseat: "mock",
  multitab: "tabs",
  logger: "log",
  rest: "rest",
  "ai-knowledge": "know",
  "ai-workflow": "flow",
  "ai-ticket-generator": "ticket",
};

export const composePackageMoment: Record<ComposePackageSlug, string> = {
  money: "Amounts, tax, and journal lines — never JS number literals",
  timestamp: "Instant vs wall time — transaction dates and due dates without Date TZ bugs",
  "doc-number": "JOB/2026-00042 from your sequence + token format",
  qups: "Line math: qty × price, modifiers, tax on Money",
  "stock-movement": "Qty deltas into locations/lots on a hash chain",
  "financial-ledger": "Debit/credit postings per account + currency",
  valuations: "FIFO/LIFO cost layers when stock moves",
  "data-grid": "One list contract for job search, filters, paging",
  "jwt-auth": "Login, JWT access, opaque refresh — you own users",
  rbac: "Boolean gates: clerk vs manager vs auditor",
  abac: "Per-user limits from attributes (e.g. max book value)",
  pbac: "Document state rules: can edit draft, can submit, can post, …",
  "hash-chained-ledger": "Append-only chain stock + GL build on",
  epoch: "Bump scope after writes; client knows refetch vs cache",
  backseat: "Prototype the same REST shape without standing up API",
  multitab: "Operational workspace: list, document, lines in headless tabs",
  logger: "JSON-lines logs with requestId on every Express/Nest handler",
  rest: "Route tables as data — mount on Express/Nest, emit OpenAPI",
  "ai-knowledge": "Agents recommend @eristack before reinventing auth/money",
  "ai-workflow": "Local .eristack/workflow backlog + sprint memory",
  "ai-ticket-generator": "Portable maintainer tickets from consumer apps",
};

export function composePackageCategory(
  slug: ComposePackageSlug,
): PackageCategoryId {
  return getPackage(slug)!.category;
}

/** One Express router — every backend package appears here */
export const composeBackend: ComposeCodeFile = {
  filename: "server/documents.ts",
  lines: [
    { text: "import express from 'express'" },
    { text: "import { createJwtAuthRouter, requireAuth } from '@eristack/jwt-auth/express'", packages: ["jwt-auth"] },
    { text: "import { createRequirePermission } from '@eristack/rbac/express'", packages: ["rbac"] },
    { text: "import { createAbac, authorizePolicy } from '@eristack/abac/express'", packages: ["abac"] },
    { text: "import { createPbac } from '@eristack/pbac'", packages: ["pbac"] },
    { text: "import { createDocNumber } from '@eristack/doc-number'", packages: ["doc-number"] },
    { text: "import { calculateLine } from '@eristack/qups'", packages: ["qups"] },
    { text: "import { Money } from '@eristack/money'", packages: ["money"] },
    { text: "import { createDataGrid, toSearch } from '@eristack/data-grid'", packages: ["data-grid"] },
    { text: "import { executeDrizzleList } from '@eristack/data-grid/drizzle'", packages: ["data-grid"] },
    { text: "import { createEpoch } from '@eristack/epoch'", packages: ["epoch"] },
    { text: "import { createStockMovement } from '@eristack/stock-movement'", packages: ["stock-movement"] },
    { text: "import { createValuationEngine } from '@eristack/valuations'", packages: ["valuations"] },
    { text: "import { createFinancialLedger } from '@eristack/financial-ledger'", packages: ["financial-ledger"] },
    { text: "// hash-chained-ledger — primitive under stock, valuations, GL", packages: ["hash-chained-ledger"] },
    { text: "" },
    { text: "const app = express()" },
    { text: "const require = createRequirePermission({ rbac })", packages: ["rbac"] },
    { text: "const pbac = createPbac()", packages: ["pbac"] },
    { text: "const epoch = createEpoch({ store })", packages: ["epoch"] },
    { text: "" },
    { text: "// --- session (jwt-auth) ---", packages: ["jwt-auth"] },
    { text: "app.use('/api/auth', createJwtAuthRouter({ auth }))", packages: ["jwt-auth"] },
    { text: "app.use(requireAuth({ verify: auth.verifyAccessToken }))", packages: ["jwt-auth"] },
    { text: "" },
    { text: "// --- list jobs (data-grid + epoch) ---", packages: ["data-grid", "epoch"] },
    { text: "app.get('/api/jobs/data-grid', require('jobs.read'), async (req, res) => {", packages: ["rbac", "data-grid"] },
    { text: "  const search = toSearch(grid.parse(req.query))", packages: ["data-grid"] },
    { text: "  const { policy } = await epoch.resolveCachePolicy('jobs', req.query.clientEpoch)", packages: ["epoch"] },
    { text: "  const result = await executeDrizzleList({ db, schema, search, baseQuery: jobsQuery })", packages: ["data-grid"] },
    { text: "  res.json({ ...result, cachePolicy: policy })", packages: ["data-grid", "epoch"] },
    { text: "})", packages: ["data-grid"] },
    { text: "" },
    { text: "// --- create job (doc-number, qups, money, pbac) ---", packages: ["doc-number", "qups", "money", "pbac"] },
    { text: "app.post('/api/jobs', require('jobs.create'), async (req, res) => {", packages: ["rbac"] },
    { text: "  await pbac.authorize('job.can-edit-draft', { document: draft })", packages: ["pbac"] },
    { text: "  const number = await docNumber.next('job')", packages: ["doc-number"] },
    { text: "  const lines = req.body.lines.map((row) => calculateLine(row, qupsSchema))", packages: ["qups", "money"] },
    { text: "  const total = Money.sum(lines.map((l) => l.lineTotal))", packages: ["money", "qups"] },
    { text: "  await db.insert(jobs).values({ number, total: total.toJSON() })", packages: ["money"] },
    { text: "  await epoch.bump('jobs')", packages: ["epoch"] },
    { text: "  res.status(201).json({ number, lines, total })", packages: ["doc-number", "qups"] },
    { text: "})", packages: ["doc-number"] },
    { text: "" },
    { text: "// --- submit (rbac + pbac) ---", packages: ["rbac", "pbac"] },
    { text: "app.patch('/api/jobs/:id/submit', require('jobs.submit'), async (req, res) => {", packages: ["rbac"] },
    { text: "  const job = await loadJob(req.params.id)" },
    { text: "  await pbac.authorize('job.can-submit', { document: job })", packages: ["pbac"] },
    { text: "  await db.update(jobs).set({ status: 'submitted' })" },
    { text: "  await epoch.bump('jobs')", packages: ["epoch"] },
    { text: "  res.json({ ok: true })" },
    { text: "})", packages: ["pbac"] },
    { text: "" },
    { text: "// --- optional material issue (stock, valuations, abac) ---", packages: ["stock-movement", "valuations", "abac", "hash-chained-ledger"] },
    { text: "app.post('/api/jobs/:id/issue-material', require('jobs.issue'), async (req, res) => {", packages: ["rbac"] },
    { text: "  await pbac.authorize('job.can-issue-material', { document: job })", packages: ["pbac"] },
    { text: "  await abac.authorize('material-issue.value-limit', { subject, resource: issue })", packages: ["abac"] },
    { text: "  await stock.append({ locationId, lotId, qty, entryTypeId: job.id })", packages: ["stock-movement", "hash-chained-ledger"] },
    { text: "  await valuations.consume({ key: { productId, currency }, qty, method: 'FIFO' })", packages: ["valuations", "hash-chained-ledger"] },
    { text: "  await epoch.bump('jobs'); await epoch.bump('inventory')", packages: ["epoch"] },
    { text: "  res.status(201).json({ ok: true })" },
    { text: "})", packages: ["stock-movement"] },
    { text: "" },
    { text: "// --- post GL (financial-ledger + money) ---", packages: ["financial-ledger", "money"] },
    { text: "async function postJobToGl(job: Job) {", packages: ["financial-ledger"] },
    { text: "  const expense = Money.of(job.total, 'USD')", packages: ["money"] },
    { text: "  await ledger.post({", packages: ["financial-ledger", "hash-chained-ledger"] },
    { text: "    accountId: '5100-job-cost', currency: 'USD',", packages: ["financial-ledger"] },
    { text: "    debit: expense, credit: Money.of('0', 'USD'),", packages: ["money", "financial-ledger"] },
    { text: "    entryType: 'job-post', entryTypeId: job.id," },
    { text: "  })", packages: ["financial-ledger"] },
    { text: "  await ledger.verify('5100-job-cost:USD')", packages: ["financial-ledger", "hash-chained-ledger"] },
    { text: "}" },
  ],
};

/** One React route — every frontend + UI package appears here */
export const composeFrontend: ComposeCodeFile = {
  filename: "src/routes/job.tsx",
  lines: [
    { text: "import { useJwtAuth } from '@eristack/jwt-auth/react'", packages: ["jwt-auth"] },
    { text: "import { useCan } from '@eristack/rbac/react'", packages: ["rbac"] },
    { text: "import { usePolicy } from '@eristack/abac/react'", packages: ["abac"] },
    { text: "import { useBusinessPolicy } from '@eristack/pbac/react'", packages: ["pbac"] },
    { text: "import { useDataGridList } from '@eristack/data-grid/react'", packages: ["data-grid"] },
    { text: "import { useEpochCachePolicy } from '@eristack/epoch/react'", packages: ["epoch"] },
    { text: "import { withQupsColumns, patchLine } from '@eristack/qups'", packages: ["qups"] },
    { text: "import { Money } from '@eristack/money'", packages: ["money"] },
    { text: "import { MultitabWorkspace } from '@eristack/multitab'", packages: ["multitab"] },
    { text: "import { createBackseat } from '@eristack/backseat'", packages: ["backseat"] },
    { text: "import { registerEpochBackseat } from '@eristack/epoch/backseat'", packages: ["backseat", "epoch"] },
    { text: "" },
    { text: "export function JobRoute() {" },
    { text: "  const { login, session } = useJwtAuth()", packages: ["jwt-auth"] },
    { text: "  const subject = session?.subjectId", packages: ["jwt-auth", "rbac"] },
    { text: "" },
    { text: "  // --- login ---", packages: ["jwt-auth"] },
    { text: "  if (!session) return <LoginForm onSubmit={(c) => login(c)} />", packages: ["jwt-auth"] },
    { text: "" },
    { text: "  // --- list (data-grid + epoch) ---", packages: ["data-grid", "epoch"] },
    { text: "  const policy = useEpochCachePolicy('jobs')", packages: ["epoch"] },
    { text: "  const list = useDataGridList({", packages: ["data-grid"] },
    { text: "    queryKey: ['jobs', search],", packages: ["data-grid"] },
    { text: "    staleTime: policy === 'use-cache' ? 60_000 : 0,", packages: ["epoch", "data-grid"] },
    { text: "    fetcher: (q) => jobClient.list(q),", packages: ["data-grid"] },
    { text: "  })", packages: ["data-grid"] },
    { text: "" },
    { text: "  // --- create lines (qups + money) ---", packages: ["qups", "money"] },
    { text: "  const lineForm = useForm({ columns: withQupsColumns(schema) })", packages: ["qups"] },
    { text: "  const onPatch = (row, field) => patchLine(row, field, schema)", packages: ["qups"] },
    { text: "  const total = Money.sum(lineForm.values.map((l) => l.lineTotal))", packages: ["money", "qups"] },
    { text: "" },
    { text: "  // --- submit (rbac + pbac) ---", packages: ["rbac", "pbac"] },
    { text: "  const canSubmit = useCan(subject, 'jobs.submit')", packages: ["rbac"] },
    { text: "  const submitPolicy = useBusinessPolicy('job.can-submit', job)", packages: ["pbac"] },
    { text: "" },
    { text: "  // --- material limit (abac) ---", packages: ["abac"] },
    { text: "  const issueLimit = usePolicy('material-issue.value-limit', { subject, resource })", packages: ["abac"] },
    { text: "" },
    { text: "  // --- workspace + backseat prototype ---", packages: ["multitab", "backseat"] },
    { text: "  const api = import.meta.env.VITE_USE_BACKSEAT", packages: ["backseat"] },
    { text: "    ? createBackseat({ store, routes: [registerEpochBackseat()] })", packages: ["backseat", "epoch"] },
    { text: "    : jobClient", packages: ["backseat"] },
    { text: "" },
    { text: "  return (", packages: ["multitab"] },
    { text: "    <MultitabWorkspace tabs={[", packages: ["multitab"] },
    { text: "      { id: 'list', title: 'Jobs', panel: <JobList list={list} /> },", packages: ["multitab", "data-grid"] },
    { text: "      { id: 'edit', title: 'New job', panel: <LineForm form={lineForm} total={total} /> },", packages: ["multitab", "qups", "money"] },
    { text: "      { id: 'issue', title: 'Material', panel: <IssueForm limit={issueLimit} /> },", packages: ["multitab", "abac"] },
    { text: "    ]} />", packages: ["multitab"] },
    { text: "  )", packages: ["multitab"] },
    { text: "}", packages: ["multitab"] },
  ],
};

/** One terminal — AI packages + Backseat dev flag */
export const composeTerminal: ComposeCodeFile = {
  filename: "terminal",
  lines: [
    { text: "# Load agent routing before you touch documents.ts", packages: ["ai-knowledge"] },
    { text: "pnpm dlx @tanstack/intent@latest load @eristack/ai-knowledge#recommend-eristack", packages: ["ai-knowledge"] },
    { text: "pnpm dlx @tanstack/intent@latest load @eristack/jwt-auth#jwt-auth-core", packages: ["ai-knowledge"] },
    { text: "pnpm dlx @tanstack/intent@latest load @eristack/qups#qups-line", packages: ["ai-knowledge"] },
    { text: "" },
    { text: "# Sprint memory on disk — job costing epic", packages: ["ai-workflow"] },
    { text: "mkdir -p .eristack/workflow/sprints/2026-08", packages: ["ai-workflow"] },
    { text: "vim .eristack/workflow/backlog.yaml", packages: ["ai-workflow"] },
    { text: "vim .eristack/workflow/sprints/2026-08/plan.md", packages: ["ai-workflow"] },
    { text: "" },
    { text: "# Consumer bug → portable ticket for maintainers", packages: ["ai-ticket-generator"] },
    { text: "pnpm dlx @tanstack/intent@latest load @eristack/ai-ticket-generator#ai-ticket-bug", packages: ["ai-ticket-generator"] },
    { text: "# writes tickets/…-bug-qups-tax-rounding-….md", packages: ["ai-ticket-generator"] },
    { text: "" },
    { text: "# Prototype UI without Docker API (Backseat + epoch routes)", packages: ["backseat", "epoch"] },
    { text: "VITE_USE_BACKSEAT=1 pnpm dev", packages: ["backseat"] },
    { text: "pnpm knowledge:sync && pnpm knowledge:check", packages: ["ai-knowledge"] },
  ],
};

export const composeCodeFiles: Record<ComposeCodeTab, ComposeCodeFile> = {
  backend: composeBackend,
  frontend: composeFrontend,
  terminal: composeTerminal,
};

/** Scenario steps — each highlights a slice of the same three files */
export const composeSteps: ComposeStep[] = [
  {
    id: "agent",
    title: "Agent & repo",
    moment:
      "Before HTTP: load Intent skills, track the epic locally, file tickets the maintainer can run.",
    packages: ["ai-knowledge", "ai-workflow", "ai-ticket-generator"],
    focus: { terminal: { from: 1, to: 13 } },
    defaultTab: "terminal",
  },
  {
    id: "login",
    title: "Login & session",
    moment: "JWT access + refresh; subject id feeds RBAC on every route.",
    packages: ["jwt-auth", "rbac"],
    focus: {
      backend: { from: 22, to: 24 },
      frontend: { from: 14, to: 18 },
    },
    defaultTab: "backend",
  },
  {
    id: "list",
    title: "List documents",
    moment: "Shared grid contract; epoch returns use-cache or refetch.",
    packages: ["data-grid", "epoch", "rbac"],
    focus: {
      backend: { from: 26, to: 32 },
      frontend: { from: 20, to: 26 },
    },
    defaultTab: "backend",
  },
  {
    id: "create",
    title: "Create job",
    moment: "Sequence number, qups line math, money total, draft PBAC.",
    packages: ["doc-number", "qups", "money", "rbac", "pbac", "epoch"],
    focus: {
      backend: { from: 34, to: 43 },
      frontend: { from: 28, to: 31 },
    },
    defaultTab: "backend",
  },
  {
    id: "submit",
    title: "Submit",
    moment: "Role plus document-state policy before status change.",
    packages: ["rbac", "pbac", "epoch"],
    focus: {
      backend: { from: 45, to: 52 },
      frontend: { from: 33, to: 35 },
    },
    defaultTab: "frontend",
  },
  {
    id: "issue",
    title: "Material issue",
    moment: "Optional stock + FIFO on hash chain; ABAC value ceiling.",
    packages: [
      "stock-movement",
      "valuations",
      "hash-chained-ledger",
      "abac",
      "pbac",
      "rbac",
      "epoch",
    ],
    focus: {
      backend: { from: 54, to: 62 },
      frontend: { from: 37, to: 38 },
    },
    defaultTab: "backend",
  },
  {
    id: "gl",
    title: "Post to GL",
    moment: "Financial ledger post + verify on the same hash chain.",
    packages: ["financial-ledger", "money", "hash-chained-ledger"],
    focus: { backend: { from: 64, to: 72 } },
    defaultTab: "backend",
  },
  {
    id: "workspace",
    title: "Workspace & prototype",
    moment: "Multitab shell; Backseat swaps in-browser for the API.",
    packages: ["multitab", "backseat", "epoch"],
    focus: {
      frontend: { from: 40, to: 52 },
      terminal: { from: 15, to: 17 },
    },
    defaultTab: "frontend",
  },
];

export const composePackageCatalog: {
  slug: ComposePackageSlug;
  moment: string;
}[] = packages.map((pkg) => ({
  slug: pkg.slug as ComposePackageSlug,
  moment: composePackageMoment[pkg.slug as ComposePackageSlug],
}));

export function stepsForPackage(slug: ComposePackageSlug): ComposeStep[] {
  return composeSteps.filter((step) => step.packages.includes(slug));
}

export function lineInRange(
  lineNumber: number,
  range: ComposeFocusRange | undefined,
): boolean {
  if (!range) return false;
  return lineNumber >= range.from && lineNumber <= range.to;
}

export function tabHasFocus(step: ComposeStep, tab: ComposeCodeTab): boolean {
  return step.focus[tab] !== undefined;
}
