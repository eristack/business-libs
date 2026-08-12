/** Ticket kinds consumers and agents can generate. */
export type TicketKind = "bug" | "suggestion";

export type Feasibility =
  | "possible"
  | "partial"
  | "unlikely"
  | "needs-decision";

export type TicketSubscription = {
  /** Fully qualified package name, e.g. @eristack/money */
  package: string;
  /** Short human title for the package */
  title?: string;
  /** Where to send / who owns triage */
  maintainers?: string[];
  /** What this package owns — used in feasibility hints */
  scope?: string;
  /** Explicit non-goals */
  outOfScope?: string;
  /** Optional skill ids agents should load when fixing */
  skills?: string[];
};

export type BugTicketInput = {
  package: string;
  title: string;
  summary: string;
  /** Package version the reporter observed */
  version?: string;
  environment?: {
    runtime?: string;
    os?: string;
    framework?: string;
    extra?: Record<string, string>;
  };
  stepsToReproduce?: string[];
  expected?: string;
  actual?: string;
  logs?: string;
  scenario?: string;
  impact?: string;
  /** Proposed fix plan for the maintainer / agent */
  fixPlan?: string[];
  /** Files or APIs that look involved */
  suspects?: string[];
  reporter?: string;
  /** Extra free-form notes */
  notes?: string;
};

export type SuggestionTicketInput = {
  package: string;
  title: string;
  summary: string;
  userStory?: string;
  proposedBehavior?: string;
  proposedApi?: string;
  /** Reporter's own guess; assessFeasibility may override */
  feasibility?: Feasibility;
  feasibilityRationale?: string;
  implementationSketch?: string[];
  risks?: string[];
  alternatives?: string[];
  reporter?: string;
  notes?: string;
};

export type TicketMeta = {
  id: string;
  kind: TicketKind;
  package: string;
  title: string;
  createdAt: string;
  reporter?: string;
  feasibility?: Feasibility;
};

export type BugTicket = TicketMeta & {
  kind: "bug";
  body: BugTicketInput;
};

export type SuggestionTicket = TicketMeta & {
  kind: "suggestion";
  body: SuggestionTicketInput;
};

export type Ticket = BugTicket | SuggestionTicket;

export type FeasibilityResult = {
  feasibility: Feasibility;
  rationale: string;
  /** Concrete next steps for maintainer/agent when possible/partial */
  nextSteps: string[];
};

export type SubscriptionCheckIssue = {
  package: string;
  path: string;
  reason: string;
};

export type SubscriptionCheckResult = {
  ok: boolean;
  checked: number;
  missing: SubscriptionCheckIssue[];
  invalid: SubscriptionCheckIssue[];
};
