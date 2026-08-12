import type { ResetPeriod } from "../core/types.js";
import { toErrorResponse } from "./errors.js";
import { toFormatBody } from "./serialize.js";
import type {
  CreateFormatBody,
  FormatBody,
  PreviewBody,
  RestDocNumberConfig,
  RestErrorBody,
  RestRequest,
  RestResponse,
  UpdateFormatBody,
} from "./types.js";

const RESETS = new Set<ResetPeriod>(["never", "yearly", "monthly", "daily"]);

function readBodyObject(req: RestRequest): Record<string, unknown> {
  if (!req.body || typeof req.body !== "object" || Array.isArray(req.body)) {
    return {};
  }
  return req.body as Record<string, unknown>;
}

function queryString(
  query: RestRequest["query"],
  key: string,
): string | undefined {
  const raw = query?.[key];
  if (typeof raw === "string") return raw;
  if (Array.isArray(raw) && typeof raw[0] === "string") return raw[0];
  return undefined;
}

function isReset(value: unknown): value is ResetPeriod {
  return typeof value === "string" && RESETS.has(value as ResetPeriod);
}

export function createListFormatsAction(config: RestDocNumberConfig) {
  return async (
    req: RestRequest,
  ): Promise<RestResponse<
    | {
        items: FormatBody[];
        pageInfo: import("@eristack/data-grid").PageInfo;
        query: import("@eristack/data-grid").DataGridQuery;
      }
    | RestErrorBody
  >> => {
    try {
      const entityKey = queryString(req.query, "entityKey");
      if (!entityKey) {
        return {
          status: 400,
          body: {
            error: {
              code: "INVALID_QUERY",
              message: "query.entityKey is required",
            },
          },
        };
      }
      const result = await config.docNumber.listFormats(entityKey, req.query);
      return {
        status: 200,
        body: {
          items: result.items.map(toFormatBody),
          pageInfo: result.pageInfo,
          query: result.query,
        },
      };
    } catch (error) {
      return toErrorResponse(error);
    }
  };
}

export function createGetActiveFormatAction(config: RestDocNumberConfig) {
  return async (
    req: RestRequest,
  ): Promise<RestResponse<{ format: FormatBody | null } | RestErrorBody>> => {
    try {
      const entityKey = queryString(req.query, "entityKey");
      if (!entityKey) {
        return {
          status: 400,
          body: {
            error: {
              code: "INVALID_QUERY",
              message: "query.entityKey is required",
            },
          },
        };
      }
      const format = await config.docNumber.getFormat(entityKey);
      return {
        status: 200,
        body: { format: format ? toFormatBody(format) : null },
      };
    } catch (error) {
      return toErrorResponse(error);
    }
  };
}

export function createGetFormatByIdAction(config: RestDocNumberConfig) {
  return async (
    req: RestRequest,
  ): Promise<RestResponse<{ format: FormatBody } | RestErrorBody>> => {
    try {
      const id = req.params?.id;
      if (!id) {
        return {
          status: 400,
          body: {
            error: { code: "INVALID_PARAMS", message: "params.id is required" },
          },
        };
      }
      const format = await config.docNumber.getFormatById(id);
      if (!format) {
        return {
          status: 404,
          body: {
            error: {
              code: "FORMAT_NOT_FOUND",
              message: `No document format with id "${id}"`,
            },
          },
        };
      }
      return { status: 200, body: { format: toFormatBody(format) } };
    } catch (error) {
      return toErrorResponse(error);
    }
  };
}

export function createCreateFormatAction(config: RestDocNumberConfig) {
  return async (
    req: RestRequest,
  ): Promise<RestResponse<{ format: FormatBody } | RestErrorBody>> => {
    try {
      const body = readBodyObject(req) as Partial<CreateFormatBody>;
      if (typeof body.entityKey !== "string" || !body.entityKey) {
        return {
          status: 400,
          body: {
            error: {
              code: "INVALID_BODY",
              message: "body.entityKey is required",
            },
          },
        };
      }
      if (typeof body.pattern !== "string" || !body.pattern) {
        return {
          status: 400,
          body: {
            error: {
              code: "INVALID_BODY",
              message: "body.pattern is required",
            },
          },
        };
      }
      if (body.reset !== undefined && !isReset(body.reset)) {
        return {
          status: 400,
          body: {
            error: {
              code: "INVALID_BODY",
              message: 'body.reset must be "never"|"yearly"|"monthly"|"daily"',
            },
          },
        };
      }

      const format = await config.docNumber.registerFormat({
        entityKey: body.entityKey,
        pattern: body.pattern,
        reset: body.reset,
        prefix: typeof body.prefix === "string" ? body.prefix : undefined,
        id: typeof body.id === "string" ? body.id : undefined,
        active: typeof body.active === "boolean" ? body.active : undefined,
      });
      return { status: 201, body: { format: toFormatBody(format) } };
    } catch (error) {
      return toErrorResponse(error);
    }
  };
}

export function createUpdateFormatAction(config: RestDocNumberConfig) {
  return async (
    req: RestRequest,
  ): Promise<RestResponse<{ format: FormatBody } | RestErrorBody>> => {
    try {
      const id = req.params?.id;
      if (!id) {
        return {
          status: 400,
          body: {
            error: { code: "INVALID_PARAMS", message: "params.id is required" },
          },
        };
      }
      const body = readBodyObject(req) as Partial<UpdateFormatBody>;
      if (body.reset !== undefined && !isReset(body.reset)) {
        return {
          status: 400,
          body: {
            error: {
              code: "INVALID_BODY",
              message: 'body.reset must be "never"|"yearly"|"monthly"|"daily"',
            },
          },
        };
      }

      const format = await config.docNumber.updateFormat({
        id,
        entityKey: typeof body.entityKey === "string" ? body.entityKey : undefined,
        pattern: typeof body.pattern === "string" ? body.pattern : undefined,
        reset: body.reset,
        prefix:
          body.prefix === null
            ? null
            : typeof body.prefix === "string"
              ? body.prefix
              : undefined,
        active: typeof body.active === "boolean" ? body.active : undefined,
      });
      return { status: 200, body: { format: toFormatBody(format) } };
    } catch (error) {
      return toErrorResponse(error);
    }
  };
}

export function createPreviewAction(config: RestDocNumberConfig) {
  return async (
    req: RestRequest,
  ): Promise<RestResponse<{ value: string } | RestErrorBody>> => {
    try {
      const body = readBodyObject(req) as Partial<PreviewBody>;
      if (typeof body.pattern !== "string" || !body.pattern) {
        return {
          status: 400,
          body: {
            error: {
              code: "INVALID_BODY",
              message: "body.pattern is required",
            },
          },
        };
      }
      if (typeof body.sequence !== "number" || !Number.isInteger(body.sequence)) {
        return {
          status: 400,
          body: {
            error: {
              code: "INVALID_BODY",
              message: "body.sequence must be an integer",
            },
          },
        };
      }

      const at =
        typeof body.at === "string" && body.at
          ? new Date(body.at)
          : undefined;
      if (at && Number.isNaN(at.getTime())) {
        return {
          status: 400,
          body: {
            error: {
              code: "INVALID_BODY",
              message: "body.at must be an ISO date string",
            },
          },
        };
      }

      let value = config.docNumber.preview({
        pattern: body.pattern,
        sequence: body.sequence,
        at,
      });
      if (typeof body.prefix === "string" && body.prefix) {
        value = `${body.prefix}${value}`;
      }
      return { status: 200, body: { value } };
    } catch (error) {
      return toErrorResponse(error);
    }
  };
}

export function createRestActions(config: RestDocNumberConfig) {
  return {
    listFormats: createListFormatsAction(config),
    getActiveFormat: createGetActiveFormatAction(config),
    getFormatById: createGetFormatByIdAction(config),
    createFormat: createCreateFormatAction(config),
    updateFormat: createUpdateFormatAction(config),
    preview: createPreviewAction(config),
  };
}
