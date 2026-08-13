/**
 * Decimal-string amounts (quantity or money). Never JS number money/qty math.
 */
export type LedgerAmount = string;

/** Opaque stream id (location+lot, account, valuation key, …). */
export type ChainId = string;

export type LedgerEntry = {
  id: string;
  chainId: ChainId;
  /** 1-based append order within the chain. */
  sequence: number;
  openingBalance: LedgerAmount;
  inAmount: LedgerAmount;
  outAmount: LedgerAmount;
  adjustment: LedgerAmount;
  closingBalance: LedgerAmount;
  /** Business movement kind (receipt, issue, journal, …). */
  entryType: string;
  /** Source document / event id for this type. */
  entryTypeId: string;
  occurredAt: string;
  /** SHA-256 hex of previous entry; null for genesis. */
  prevHash: string | null;
  /** SHA-256 hex of this entry's canonical payload. */
  entryHash: string;
  /**
   * Extra fields included in the hash (domain extensions).
   * Keep JSON-stable (sorted keys when serializing).
   */
  meta?: Record<string, unknown>;
};

export type AppendLedgerEntryInput = {
  chainId: ChainId;
  /** Required when the chain has no entries yet. */
  openingBalance?: LedgerAmount;
  inAmount?: LedgerAmount;
  outAmount?: LedgerAmount;
  adjustment?: LedgerAmount;
  entryType: string;
  entryTypeId: string;
  occurredAt?: string | Date;
  id?: string;
  meta?: Record<string, unknown>;
};

export type LedgerSnapshot = {
  chainId: ChainId;
  sequence: number;
  balance: LedgerAmount;
  entryHash: string;
  updatedAt: string;
};

export type ChainVerifyResult =
  | { ok: true; entries: number; tipHash: string | null }
  | {
      ok: false;
      tampered: true;
      sequence: number;
      warnings: string[];
      tipHash: string | null;
    };

export type LedgerEntryStore = {
  listByChain(chainId: ChainId): Promise<LedgerEntry[]>;
  getTip(chainId: ChainId): Promise<LedgerEntry | null>;
  append(entry: LedgerEntry): Promise<void>;
  getSnapshot(chainId: ChainId): Promise<LedgerSnapshot | null>;
  upsertSnapshot(snapshot: LedgerSnapshot): Promise<void>;
};

export type HashChainedLedger = {
  append(input: AppendLedgerEntryInput): Promise<LedgerEntry>;
  list(chainId: ChainId): Promise<LedgerEntry[]>;
  tip(chainId: ChainId): Promise<LedgerEntry | null>;
  snapshot(chainId: ChainId): Promise<LedgerSnapshot | null>;
  /** Replay + rehash; throws ChainTamperedError when broken. */
  verify(chainId: ChainId): Promise<ChainVerifyResult>;
  /** Same as verify but always returns result (no throw). */
  check(chainId: ChainId): Promise<ChainVerifyResult>;
};

export type CreateHashChainedLedgerOptions = {
  store: LedgerEntryStore;
  /** Override id factory (tests). */
  idFactory?: () => string;
  /** Override clock (tests). */
  now?: () => Date;
};
