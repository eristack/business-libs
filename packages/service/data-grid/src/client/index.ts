import { createDataGrid } from "../core/create-data-grid.js";
import type {
  DataGridQuery,
  DataGridQueryInput,
  DataGridResult,
  DataGridSchema,
  PageInfo,
} from "../core/types.js";
import { serializeQueryString } from "../core/serialize.js";

export type MaybeAsync<T> = T | Promise<T>;

export type DataGridClientConfig = {
  baseUrl: string | (() => MaybeAsync<string>);
  /** Path for the list endpoint, e.g. `/items`. */
  path: string | (() => MaybeAsync<string>);
  schema: DataGridSchema;
  fetch?: typeof fetch;
  credentials?: RequestCredentials | (() => MaybeAsync<RequestCredentials>);
  getHeaders?: () => MaybeAsync<Record<string, string>>;
};

export type DataGridListResponse<T> = {
  items: T[];
  pageInfo: PageInfo;
  query: DataGridQuery;
};

export type DataGridClient<T = unknown> = {
  list(input?: DataGridQueryInput): Promise<DataGridResult<T>>;
  serialize(input?: DataGridQueryInput): string;
};

function joinUrl(baseUrl: string, path: string): string {
  const base = baseUrl.replace(/\/+$/, "");
  const suffix = path.startsWith("/") ? path : `/${path}`;
  return `${base}${suffix}`;
}

async function resolveValue<T>(value: T | (() => MaybeAsync<T>)): Promise<T> {
  return typeof value === "function"
    ? await (value as () => MaybeAsync<T>)()
    : value;
}

export function createDataGridClient<T = unknown>(
  config: DataGridClientConfig,
): DataGridClient<T> {
  const grid = createDataGrid(config.schema);
  const fetchImpl = config.fetch ?? fetch;

  return {
    serialize(input) {
      return serializeQueryString(grid.parse(input));
    },
    async list(input) {
      const query = grid.parse(input);
      const baseUrl = await resolveValue(config.baseUrl);
      const path = await resolveValue(config.path);
      const credentials = config.credentials
        ? await resolveValue(config.credentials)
        : "include";
      const extra = config.getHeaders ? await config.getHeaders() : {};
      const url = `${joinUrl(baseUrl, path)}?${serializeQueryString(query)}`;

      const headers = new Headers();
      for (const [key, value] of Object.entries(extra)) headers.set(key, value);

      const res = await fetchImpl(url, { credentials, headers });
      const data = (await res.json()) as
        | DataGridListResponse<T>
        | { error?: { code?: string; message?: string } };

      if (!res.ok) {
        const err = data as { error?: { code?: string; message?: string } };
        const error = new Error(
          err.error?.message ?? `Data grid request failed (${res.status})`,
        ) as Error & { code?: string; status?: number };
        error.code = err.error?.code;
        error.status = res.status;
        throw error;
      }

      const body = data as DataGridListResponse<T>;
      return {
        items: body.items,
        pageInfo: body.pageInfo,
        query: body.query ?? query,
      };
    },
  };
}
