import { createCrudRouteHandlers, wrapHandler } from "./handlers/crud.js";
import { createHandlerContext } from "./context.js";
import { BackseatRouter, normalizeApiPath } from "./router.js";
import { toBackseatErrorResponse } from "./errors.js";
import type {
  Backseat,
  BackseatActionHandler,
  BackseatCollectionOptions,
  BackseatRequest,
  BackseatResponse,
  BackseatSeedSource,
  BackseatSnapshot,
  CreateBackseatOptions,
  CrudHandlers,
  RouteDefinition,
} from "./types.js";

const defaultIdFactory = (): string => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `bs_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
};

async function resolveSeed(source: BackseatSeedSource): Promise<BackseatSnapshot> {
  return typeof source === "function" ? source() : source;
}

export function createBackseat(options: CreateBackseatOptions): Backseat {
  const store = options.store;
  const baseUrl = options.baseUrl ?? "/api";
  const idFactory = options.idFactory ?? defaultIdFactory;
  const defaultSeed = options.seed;
  const router = new BackseatRouter();
  const handlers: Record<string, CrudHandlers> = {};
  const actions: Record<string, BackseatActionHandler> = {};

  const backseatRef = {} as Backseat;

  function registerCollection(
    name: string,
    collectionOptions: BackseatCollectionOptions = {},
  ): CrudHandlers {
    const path = collectionOptions.path ?? name;
    const { handlers: crudHandlers, routes } = createCrudRouteHandlers({
      store,
      collection: name,
      restPath: path,
      idField: collectionOptions.idField,
      idFactory,
    });

    handlers[name] = crudHandlers;

    for (const route of routes) {
      router.register(route);
    }

    return crudHandlers;
  }

  function registerRoute(route: RouteDefinition): void {
    router.register({
      ...route,
      handler: wrapHandler(route.handler, store, backseatRef),
    });
  }

  function registerAction<TInput, TOutput>(
    name: string,
    handler: BackseatActionHandler<TInput, TOutput>,
  ): void {
    actions[name] = handler as BackseatActionHandler;
  }

  async function invoke<TInput, TOutput>(
    name: string,
    input: TInput,
  ): Promise<TOutput> {
    const handler = actions[name];
    if (!handler) {
      throw new Error(`Backseat action not registered: ${name}`);
    }
    return handler({ input, store, backseat: backseatRef }) as Promise<TOutput>;
  }

  if (options.collections) {
    for (const [name, collectionOptions] of Object.entries(options.collections)) {
      registerCollection(name, collectionOptions ?? undefined);
    }
  }

  async function handle(req: BackseatRequest): Promise<BackseatResponse> {
    const apiPath = normalizeApiPath(baseUrl, req.path);
    if (apiPath === null) {
      return {
        status: 404,
        headers: { "Content-Type": "application/json" },
        body: { error: { code: "NOT_FOUND", message: "Not Found" } },
      };
    }

    const matched = router.match(req.method, apiPath);
    if (!matched) {
      return {
        status: 404,
        headers: { "Content-Type": "application/json" },
        body: { error: { code: "NOT_FOUND", message: "Not Found" } },
      };
    }

    const ctx = createHandlerContext(backseatRef, req, matched.params);

    try {
      return await matched.route.handler(ctx);
    } catch (error) {
      const { status, body } = toBackseatErrorResponse(error);
      return {
        status,
        headers: { "Content-Type": "application/json" },
        body,
      };
    }
  }

  async function fetchShim(input: string, init?: RequestInit): Promise<Response> {
    const url = input.startsWith("http")
      ? new URL(input)
      : new URL(input, "http://backseat.local");

    let body: unknown;
    if (init?.body) {
      if (typeof init.body === "string") {
        body = init.body.length > 0 ? JSON.parse(init.body) : undefined;
      } else {
        body = init.body;
      }
    }

    const query: Record<string, string> = {};
    url.searchParams.forEach((value, key) => {
      query[key] = value;
    });

    const response = await handle({
      method: (init?.method?.toUpperCase() ?? "GET") as BackseatRequest["method"],
      path: url.pathname,
      headers: Object.fromEntries(
        init?.headers instanceof Headers
          ? init.headers.entries()
          : Object.entries((init?.headers as Record<string, string>) ?? {}),
      ),
      body,
      query,
    });

    const headers = new Headers(response.headers ?? {});
    if (!headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }

    const payload =
      response.status === 204 ? null : JSON.stringify(response.body ?? null);

    return new Response(payload, { status: response.status, headers });
  }

  async function seed(snapshot: BackseatSnapshot): Promise<void> {
    await store.importSnapshot(snapshot);
  }

  async function reseed(): Promise<void> {
    if (!defaultSeed) {
      throw new Error("Backseat reseed requires createBackseat({ seed })");
    }
    await store.clear();
    await seed(await resolveSeed(defaultSeed));
  }

  async function snapshot(): Promise<BackseatSnapshot> {
    return store.exportSnapshot();
  }

  async function reset(): Promise<void> {
    await store.clear();
  }

  Object.assign(backseatRef, {
    store,
    baseUrl,
    registerCollection,
    registerRoute,
    registerAction,
    invoke,
    actions,
    handle,
    fetch: fetchShim,
    handlers,
    routes: () => router.list(),
    seed,
    reseed,
    snapshot,
    reset,
  });

  return backseatRef;
}
