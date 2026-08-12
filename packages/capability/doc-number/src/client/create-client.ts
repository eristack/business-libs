import type {
  CreateFormatBody,
  FormatBody,
  PreviewBody,
  UpdateFormatBody,
} from "../rest/types.js";
import {
  createDataGrid,
  serializeQuery,
  type DataGridQueryInput,
  type DataGridResult,
} from "@eristack/data-grid";
import { formatDataGridSchema } from "../core/format-grid.js";

export type MaybeAsync<T> = T | Promise<T>;

/**
 * All runtime dependencies are injected by the app.
 * Never invents base URLs or reads env.
 */
export interface DocNumberClientConfig {
  /**
   * API origin, or a getter resolved at call time
   * (env, feature flags, multi-tenant hosts, …).
   */
  baseUrl: string | (() => MaybeAsync<string>);
  /** Defaults assume Nest-style `/doc-number/*` paths. */
  formatsPath?: string;
  activeFormatPath?: string;
  formatByIdPath?: (id: string) => string;
  previewPath?: string;
  /** Injected fetch (defaults to global `fetch`). */
  fetch?: typeof fetch;
  /** Static value or getter for `credentials` (default `"include"`). */
  credentials?: RequestCredentials | (() => MaybeAsync<RequestCredentials>);
  /** Extra headers merged into every request (e.g. auth, tenant id). */
  getHeaders?: () => MaybeAsync<Record<string, string>>;
}

export interface DocNumberClient {
  listFormats(
    entityKey: string,
    query?: DataGridQueryInput,
  ): Promise<DataGridResult<FormatBody>>;
  getActiveFormat(entityKey: string): Promise<FormatBody | null>;
  getFormatById(id: string): Promise<FormatBody>;
  createFormat(input: CreateFormatBody): Promise<FormatBody>;
  updateFormat(id: string, input: UpdateFormatBody): Promise<FormatBody>;
  preview(input: PreviewBody): Promise<string>;
}

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

export function createDocNumberClient(
  config: DocNumberClientConfig,
): DocNumberClient {
  const fetchImpl = config.fetch ?? fetch;
  const formatsPath = config.formatsPath ?? "/doc-number/formats";
  const activeFormatPath =
    config.activeFormatPath ?? "/doc-number/formats/active";
  const formatByIdPath =
    config.formatByIdPath ?? ((id: string) => `/doc-number/formats/${id}`);
  const previewPath = config.previewPath ?? "/doc-number/preview";

  async function request<T>(
    path: string,
    init: RequestInit & { parse?: "json" } = {},
  ): Promise<T> {
    const baseUrl = await resolveValue(config.baseUrl);
    const credentials = config.credentials
      ? await resolveValue(config.credentials)
      : "include";
    const extra = config.getHeaders ? await config.getHeaders() : {};

    const headers = new Headers(init.headers);
    for (const [key, value] of Object.entries(extra)) {
      headers.set(key, value);
    }
    if (init.body && !headers.has("content-type")) {
      headers.set("content-type", "application/json");
    }

    const res = await fetchImpl(joinUrl(baseUrl, path), {
      ...init,
      credentials,
      headers,
    });

    const data = (await res.json()) as
      | T
      | { error?: { code?: string; message?: string } };

    if (!res.ok) {
      const err = data as { error?: { code?: string; message?: string } };
      const message =
        err.error?.message ?? `Doc number request failed (${res.status})`;
      const error = new Error(message) as Error & { code?: string; status?: number };
      error.code = err.error?.code;
      error.status = res.status;
      throw error;
    }

    return data as T;
  }

  return {
    async listFormats(entityKey, query) {
      const qs = serializeQuery(
        createDataGrid(formatDataGridSchema).parse(query),
      );
      qs.set("entityKey", entityKey);
      const data = await request<{
        items: FormatBody[];
        pageInfo: DataGridResult<FormatBody>["pageInfo"];
        query: DataGridResult<FormatBody>["query"];
      }>(`${formatsPath}?${qs}`);
      return {
        items: data.items,
        pageInfo: data.pageInfo,
        query: data.query,
      };
    },

    async getActiveFormat(entityKey) {
      const qs = new URLSearchParams({ entityKey });
      const data = await request<{ format: FormatBody | null }>(
        `${activeFormatPath}?${qs}`,
      );
      return data.format;
    },

    async getFormatById(id) {
      const data = await request<{ format: FormatBody }>(formatByIdPath(id));
      return data.format;
    },

    async createFormat(input) {
      const data = await request<{ format: FormatBody }>(formatsPath, {
        method: "POST",
        body: JSON.stringify(input),
      });
      return data.format;
    },

    async updateFormat(id, input) {
      const data = await request<{ format: FormatBody }>(formatByIdPath(id), {
        method: "PATCH",
        body: JSON.stringify(input),
      });
      return data.format;
    },

    async preview(input) {
      const data = await request<{ value: string }>(previewPath, {
        method: "POST",
        body: JSON.stringify(input),
      });
      return data.value;
    },
  };
}
