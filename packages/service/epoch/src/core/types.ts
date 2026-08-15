/** Opaque cache scope key (e.g. `orders`, `products`, `tenant:abc:inventory`). */
export type EpochScope = string;

/** Monotonic non-negative counter for a scope. */
export type EpochValue = number;

/** Client cache decision when comparing stored epoch to server epoch. */
export type CachePolicy = "use-cache" | "refetch";

export type EpochCounter = {
  scope: EpochScope;
  value: EpochValue;
  updatedAt?: string;
};

export type BumpEpochInput = {
  /** Optimistic concurrency — bump fails with StaleEpochError when mismatch. */
  expected?: EpochValue;
  /** Increment amount. Default 1. */
  by?: number;
};

export type EpochStore = {
  get(scope: EpochScope): Promise<EpochValue>;
  getMany(scopes: EpochScope[]): Promise<Record<EpochScope, EpochValue>>;
  bump(scope: EpochScope, input?: BumpEpochInput): Promise<EpochValue>;
};

export type EpochConfig = {
  store: EpochStore;
  /** Default increment for bump when `by` omitted. Default 1. */
  defaultIncrement?: number;
};

export type CachePolicyResult = {
  scope: EpochScope;
  clientEpoch: EpochValue;
  current: EpochValue;
  policy: CachePolicy;
};

export type Epoch = {
  /** Current server epoch for a scope (0 when never bumped). */
  current(scope: EpochScope): Promise<EpochValue>;
  currentMany(scopes: EpochScope[]): Promise<Record<EpochScope, EpochValue>>;
  /** Atomically increment; optional expected check. */
  bump(scope: EpochScope, input?: BumpEpochInput): Promise<EpochValue>;
  /** Pure compare — same helper the client uses locally. */
  compare(clientEpoch: EpochValue, serverEpoch: EpochValue): CachePolicy;
  /** Fetch current and return cache policy for a client-held epoch. */
  resolveCachePolicy(
    scope: EpochScope,
    clientEpoch: EpochValue,
  ): Promise<CachePolicyResult>;
  resolveCachePolicyMany(
    input: Record<EpochScope, EpochValue>,
  ): Promise<CachePolicyResult[]>;
  /** Throws StaleEpochError when client epoch !== current. */
  assertFresh(scope: EpochScope, clientEpoch: EpochValue): Promise<EpochValue>;
};
