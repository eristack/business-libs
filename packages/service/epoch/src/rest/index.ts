import type { Epoch, EpochScope, EpochValue } from "../core/types.js";
import { StaleEpochError } from "../core/errors.js";

export type RestRequest = {
  method?: string;
  headers?: { get(name: string): string | null | undefined };
  body?: unknown;
  params?: Record<string, string | undefined>;
  query?: Record<string, string | string[] | undefined>;
};

export type RestResponse<T = unknown> = {
  status: number;
  body: T;
  headers?: Record<string, string>;
};

export type RestErrorBody = {
  error: { code: string; message: string };
};

export type RestEpochConfig = {
  epoch: Epoch;
};

export type CurrentEpochBody = {
  scope: EpochScope;
  value: EpochValue;
};

export type BumpEpochBody = {
  scope: EpochScope;
  value: EpochValue;
};

export type CachePolicyBody = {
  scope: EpochScope;
  clientEpoch: EpochValue;
  current: EpochValue;
  policy: "use-cache" | "refetch";
};

function queryOne(
  query: RestRequest["query"],
  key: string,
): string | undefined {
  const raw = query?.[key];
  if (Array.isArray(raw)) return raw[0];
  return raw;
}

function parseEpoch(value: string | undefined): EpochValue | undefined {
  if (value == null || value === "") return undefined;
  const n = Number(value);
  if (!Number.isInteger(n) || n < 0) return undefined;
  return n;
}

export function createRestEpochActions(config: RestEpochConfig) {
  const { epoch } = config;

  return {
    async getCurrent(req: RestRequest): Promise<RestResponse<CurrentEpochBody | RestErrorBody>> {
      const scope = req.params?.scope ?? queryOne(req.query, "scope");
      if (!scope) {
        return {
          status: 400,
          body: {
            error: { code: "VALIDATION_ERROR", message: "scope is required" },
          },
        };
      }
      const value = await epoch.current(scope);
      return { status: 200, body: { scope, value } };
    },

    async bump(req: RestRequest): Promise<RestResponse<BumpEpochBody | RestErrorBody>> {
      const scope = req.params?.scope ?? queryOne(req.query, "scope");
      if (!scope) {
        return {
          status: 400,
          body: {
            error: { code: "VALIDATION_ERROR", message: "scope is required" },
          },
        };
      }
      const body = (req.body ?? {}) as { expected?: number; by?: number };
      try {
        const value = await epoch.bump(scope, {
          expected: body.expected,
          by: body.by,
        });
        return { status: 200, body: { scope, value } };
      } catch (err) {
        if (err instanceof StaleEpochError) {
          return {
            status: 409,
            body: {
              error: { code: err.code, message: err.message },
            },
            headers: {
              "X-Epoch-Current": String(err.current),
            },
          };
        }
        throw err;
      }
    },

    async resolveCachePolicy(
      req: RestRequest,
    ): Promise<RestResponse<CachePolicyBody | RestErrorBody>> {
      const scope = req.params?.scope ?? queryOne(req.query, "scope");
      const clientEpoch = parseEpoch(
        queryOne(req.query, "clientEpoch") ??
          queryOne(req.query, "epoch") ??
          (req.body as { clientEpoch?: number } | undefined)?.clientEpoch?.toString(),
      );
      if (!scope || clientEpoch === undefined) {
        return {
          status: 400,
          body: {
            error: {
              code: "VALIDATION_ERROR",
              message: "scope and clientEpoch are required",
            },
          },
        };
      }
      const result = await epoch.resolveCachePolicy(scope, clientEpoch);
      return { status: 200, body: result };
    },
  };
}

export function toEpochErrorResponse(error: unknown): RestResponse<RestErrorBody> {
  if (error instanceof StaleEpochError) {
    return {
      status: 409,
      body: { error: { code: error.code, message: error.message } },
      headers: { "X-Epoch-Current": String(error.current) },
    };
  }
  return {
    status: 500,
    body: {
      error: {
        code: "INTERNAL_ERROR",
        message: error instanceof Error ? error.message : "Unexpected error",
      },
    },
  };
}
