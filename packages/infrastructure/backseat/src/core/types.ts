export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export type BackseatDocument = Record<string, unknown> & { id?: string };

export type BackseatSnapshot = Record<string, BackseatDocument[]>;

export type BackseatCollectionFilter = {
  where?: Record<string, unknown>;
  sort?: string;
  order?: "asc" | "desc";
  offset?: number;
  limit?: number;
};

/** Persistence port — memory for tests; IndexedDB for browser prototypes. */
export type BackseatStore = {
  list(collection: string, filter?: BackseatCollectionFilter): Promise<BackseatDocument[]>;
  get(collection: string, id: string): Promise<BackseatDocument | null>;
  create(collection: string, doc: BackseatDocument): Promise<BackseatDocument>;
  update(
    collection: string,
    id: string,
    patch: BackseatDocument,
  ): Promise<BackseatDocument>;
  delete(collection: string, id: string): Promise<void>;
  listCollections(): Promise<string[]>;
  exportSnapshot(): Promise<BackseatSnapshot>;
  importSnapshot(snapshot: BackseatSnapshot): Promise<void>;
  clear(): Promise<void>;
};

export type BackseatRequest = {
  method: HttpMethod;
  path: string;
  headers?: Record<string, string>;
  body?: unknown;
  query?: Record<string, string | string[] | undefined>;
};

export type BackseatResponse<T = unknown> = {
  status: number;
  body: T;
  headers?: Record<string, string>;
};

export type BackseatErrorBody = {
  error: { code: string; message: string };
};

export type { BackseatHandlerContext } from "./context.js";

export type BackseatHandler = (
  ctx: import("./context.js").BackseatHandlerContext,
) => Promise<BackseatResponse>;

export type RouteDefinition = {
  method: HttpMethod;
  /** e.g. `/reports/inventory`, `/search/*`, `/orders/:id/lines` */
  path: string;
  handler: BackseatHandler;
  collection?: string;
  /** Optional label for devtools / debugging. */
  name?: string;
};

export type BackseatActionContext<TInput = unknown> = {
  input: TInput;
  store: BackseatStore;
  backseat: Backseat;
};

export type BackseatActionHandler<TInput = unknown, TOutput = unknown> = (
  ctx: BackseatActionContext<TInput>,
) => Promise<TOutput>;

export type CrudHandlers<T extends BackseatDocument = BackseatDocument> = {
  list: (filter?: BackseatCollectionFilter) => Promise<T[]>;
  get: (id: string) => Promise<T>;
  create: (body: BackseatDocument) => Promise<T>;
  patch: (id: string, body: BackseatDocument) => Promise<T>;
  replace: (id: string, body: BackseatDocument) => Promise<T>;
  delete: (id: string) => Promise<void>;
};

export type BackseatCollectionOptions = {
  /** REST path segment — defaults to collection name. */
  path?: string;
  /** Document id field — defaults to `id`. */
  idField?: string;
};

export type BackseatSeedSource =
  | BackseatSnapshot
  | (() => BackseatSnapshot | Promise<BackseatSnapshot>);

export type CreateBackseatOptions = {
  store: BackseatStore;
  /** URL prefix for `handle` / `fetch` — default `/api`. */
  baseUrl?: string;
  /** Auto-register CRUD routes and direct handlers. */
  collections?: Record<string, BackseatCollectionOptions | undefined>;
  /** Default seed for devtools re-seed and `api.reseed()`. */
  seed?: BackseatSeedSource;
  idFactory?: () => string;
};

export type Backseat = {
  store: BackseatStore;
  baseUrl: string;
  registerCollection(
    name: string,
    options?: BackseatCollectionOptions,
  ): CrudHandlers;
  /** Register any HTTP controller — complex queries, aggregations, multi-store logic. */
  registerRoute(route: RouteDefinition): void;
  /** Named controller callable directly from Query (no URL shape required). */
  registerAction<TInput = unknown, TOutput = unknown>(
    name: string,
    handler: BackseatActionHandler<TInput, TOutput>,
  ): void;
  invoke<TInput = unknown, TOutput = unknown>(
    name: string,
    input: TInput,
  ): Promise<TOutput>;
  actions: Record<string, BackseatActionHandler>;
  handle(req: BackseatRequest): Promise<BackseatResponse>;
  fetch(input: string, init?: RequestInit): Promise<Response>;
  handlers: Record<string, CrudHandlers>;
  routes(): RouteDefinition[];
  seed(snapshot: BackseatSnapshot): Promise<void>;
  reseed(): Promise<void>;
  snapshot(): Promise<BackseatSnapshot>;
  reset(): Promise<void>;
};
