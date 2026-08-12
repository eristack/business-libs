export type ResetPeriod = "never" | "yearly" | "monthly" | "daily";

export type Clock = () => Date;

export interface FormatRecord {
  id: string;
  entityKey: string;
  pattern: string;
  reset: ResetPeriod;
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
}

export interface FormatDocumentNumberInput {
  pattern: string;
  sequence: number;
  at?: Date;
}

export interface ParsedDocumentNumber {
  sequence: number;
  parts: Record<string, string>;
}

export interface RegisterFormatInput {
  entityKey: string;
  pattern: string;
  reset?: ResetPeriod;
  prefix?: string;
  id?: string;
  active?: boolean;
}

export interface UpdateFormatInput {
  id: string;
  entityKey?: string;
  pattern?: string;
  reset?: ResetPeriod;
  /** Pass `null` to clear prefix. */
  prefix?: string | null;
  active?: boolean;
}

export interface NextDocumentNumberInput {
  entityKey: string;
  at?: Date;
}

export interface PeekNextInput {
  entityKey: string;
  at?: Date;
}

export interface PreviewInput {
  pattern: string;
  sequence: number;
  at?: Date;
}
