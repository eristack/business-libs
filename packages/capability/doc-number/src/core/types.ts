export type ResetPeriod = "never" | "yearly" | "monthly" | "daily";

export type Clock = () => Date;

export interface FormatRecord {
  id: string;
  entityKey: string;
  pattern: string;
  reset: ResetPeriod;
  /** IANA zone for `{YYYY}`/`{MM}`/`{DD}` tokens and period keys. Default UTC when omitted. */
  timezone?: string;
  prefix?: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface FormatStore {
  save(record: FormatRecord): Promise<void>;
  findById(id: string): Promise<FormatRecord | null>;
  findActiveByEntityKey(entityKey: string): Promise<FormatRecord | null>;
  listByEntityKey(entityKey: string): Promise<FormatRecord[]>;
}

export interface AllocateNextInput {
  formatId: string;
  periodKey: string;
  /** Branch/location scope — default `""` (company-wide counter). */
  scope?: string;
}

export interface SequenceStore {
  /** Atomically allocate and return the next sequence integer (1-based). */
  allocateNext(input: AllocateNextInput): Promise<number>;
  /** Current value without allocating; `null` if no row yet. */
  getCurrent(input: AllocateNextInput): Promise<number | null>;
  /** Next value that would be allocated without writing. */
  peekNext(input: AllocateNextInput): Promise<number>;
}

export type Incrementer = (input: AllocateNextInput) => Promise<number>;

export interface DocNumberResult {
  value: string;
  sequence: number;
  periodKey: string;
  formatId: string;
  entityKey: string;
  pattern: string;
  scope: string;
}

export interface FormatDocumentNumberInput {
  pattern: string;
  sequence: number;
  at?: Date;
  /** IANA zone for date tokens — default UTC. */
  timezone?: string;
  /** Scope segment for `{SCOPE}` token — sanitized (no slashes). */
  scope?: string;
}

export interface ParsedDocumentNumber {
  sequence: number;
  parts: Record<string, string>;
}

export interface RegisterFormatInput {
  entityKey: string;
  pattern: string;
  reset?: ResetPeriod;
  timezone?: string;
  prefix?: string;
  id?: string;
  active?: boolean;
}

export interface UpdateFormatInput {
  id: string;
  entityKey?: string;
  pattern?: string;
  reset?: ResetPeriod;
  timezone?: string | null;
  /** Pass `null` to clear prefix. */
  prefix?: string | null;
  active?: boolean;
}

export interface NextDocumentNumberInput {
  entityKey: string;
  at?: Date;
  /** Overrides format.timezone for this allocation. */
  timezone?: string;
  /** Independent counter per branch/location within format + period. */
  scope?: string;
}

export interface PeekNextInput {
  entityKey: string;
  at?: Date;
  timezone?: string;
  scope?: string;
}

export interface PreviewInput {
  pattern: string;
  sequence: number;
  at?: Date;
  timezone?: string;
  scope?: string;
}
