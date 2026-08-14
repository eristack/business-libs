import { parseListFilter } from "../filter.js";
import {
  BackseatNotFoundError,
  BackseatValidationError,
  toBackseatErrorResponse,
} from "../errors.js";
import type {
  BackseatDocument,
  BackseatHandler,
  BackseatResponse,
  BackseatStore,
  CrudHandlers,
} from "../types.js";

function jsonResponse<T>(status: number, body: T): BackseatResponse<T> {
  return {
    status,
    body,
    headers: { "Content-Type": "application/json" },
  };
}

function readId(doc: BackseatDocument, idField: string): string {
  const id = doc[idField];
  if (id === undefined || id === null || String(id).length === 0) {
    throw new BackseatValidationError(`Missing ${idField}`);
  }
  return String(id);
}

export function createCrudHandlers(options: {
  store: BackseatStore;
  collection: string;
  idField?: string;
  idFactory?: () => string;
}): CrudHandlers {
  const idField = options.idField ?? "id";

  const list = async (filter?: Parameters<CrudHandlers["list"]>[0]) =>
    options.store.list(options.collection, filter);

  const get = async (id: string) => {
    const doc = await options.store.get(options.collection, id);
    if (!doc) {
      throw new BackseatNotFoundError(`${options.collection}/${id} not found`);
    }
    return doc;
  };

  const create = async (body: BackseatDocument) => {
    const id = body[idField] ? String(body[idField]) : options.idFactory?.();
    if (!id) {
      throw new BackseatValidationError(`${idField} is required`);
    }
    return options.store.create(options.collection, { ...body, [idField]: id });
  };

  const patch = async (id: string, body: BackseatDocument) => {
    const { [idField]: _ignored, ...patchBody } = body;
    return options.store.update(options.collection, id, patchBody);
  };

  const replace = async (id: string, body: BackseatDocument) =>
    options.store.update(options.collection, id, { ...body, [idField]: id });

  const del = async (id: string) => {
    await options.store.delete(options.collection, id);
  };

  return { list, get, create, patch, replace, delete: del };
}

export function createCrudRouteHandlers(options: {
  store: BackseatStore;
  /** Store collection key. */
  collection: string;
  /** REST path segment — defaults to collection name. */
  restPath?: string;
  idField?: string;
  idFactory?: () => string;
}): {
  handlers: CrudHandlers;
  routes: Array<{
    method: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
    path: string;
    handler: BackseatHandler;
    collection: string;
  }>;
} {
  const handlers = createCrudHandlers(options);
  const collection = options.collection;
  const restPath = options.restPath ?? collection;

  const listHandler: BackseatHandler = async (ctx) => {
    try {
      const filter = parseListFilter(ctx.req.query);
      const items = await handlers.list(filter);
      return jsonResponse(200, items);
    } catch (error) {
      const { status, body } = toBackseatErrorResponse(error);
      return jsonResponse(status, body);
    }
  };

  const getHandler: BackseatHandler = async (ctx) => {
    try {
      const id = ctx.params.id;
      if (!id) throw new BackseatValidationError("Missing id");
      const item = await handlers.get(id);
      return jsonResponse(200, item);
    } catch (error) {
      const { status, body } = toBackseatErrorResponse(error);
      return jsonResponse(status, body);
    }
  };

  const createHandler: BackseatHandler = async (ctx) => {
    try {
      const body =
        ctx.req.body && typeof ctx.req.body === "object"
          ? (ctx.req.body as BackseatDocument)
          : {};
      const item = await handlers.create(body);
      return jsonResponse(201, item);
    } catch (error) {
      const { status, body } = toBackseatErrorResponse(error);
      return jsonResponse(status, body);
    }
  };

  const patchHandler: BackseatHandler = async (ctx) => {
    try {
      const id = ctx.params.id;
      if (!id) throw new BackseatValidationError("Missing id");
      const body =
        ctx.req.body && typeof ctx.req.body === "object"
          ? (ctx.req.body as BackseatDocument)
          : {};
      const item = await handlers.patch(id, body);
      return jsonResponse(200, item);
    } catch (error) {
      const { status, body } = toBackseatErrorResponse(error);
      return jsonResponse(status, body);
    }
  };

  const replaceHandler: BackseatHandler = async (ctx) => {
    try {
      const id = ctx.params.id;
      if (!id) throw new BackseatValidationError("Missing id");
      const body =
        ctx.req.body && typeof ctx.req.body === "object"
          ? (ctx.req.body as BackseatDocument)
          : {};
      const item = await handlers.replace(id, body);
      return jsonResponse(200, item);
    } catch (error) {
      const { status, body } = toBackseatErrorResponse(error);
      return jsonResponse(status, body);
    }
  };

  const deleteHandler: BackseatHandler = async (ctx) => {
    try {
      const id = ctx.params.id;
      if (!id) throw new BackseatValidationError("Missing id");
      await handlers.delete(id);
      return jsonResponse(204, null);
    } catch (error) {
      const { status, body } = toBackseatErrorResponse(error);
      return jsonResponse(status, body);
    }
  };

  return {
    handlers,
    routes: [
      { method: "GET", path: `/${restPath}`, handler: listHandler, collection },
      { method: "POST", path: `/${restPath}`, handler: createHandler, collection },
      {
        method: "GET",
        path: `/${restPath}/:id`,
        handler: getHandler,
        collection,
      },
      {
        method: "PATCH",
        path: `/${restPath}/:id`,
        handler: patchHandler,
        collection,
      },
      {
        method: "PUT",
        path: `/${restPath}/:id`,
        handler: replaceHandler,
        collection,
      },
      {
        method: "DELETE",
        path: `/${restPath}/:id`,
        handler: deleteHandler,
        collection,
      },
    ],
  };
}

export function wrapHandler(
  handler: BackseatHandler,
  store: BackseatStore,
  backseat: import("../types.js").Backseat,
): BackseatHandler {
  return async (ctx) => {
    try {
      return await handler({ ...ctx, store, backseat });
    } catch (error) {
      const { status, body } = toBackseatErrorResponse(error);
      return jsonResponse(status, body);
    }
  };
}

export { readId };
