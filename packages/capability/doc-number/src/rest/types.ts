import type { DocNumberApi } from "../core/create-doc-number.js";
import type { ResetPeriod } from "../core/types.js";

export interface RestHeaders {
  get(name: string): string | null | undefined;
}

export interface RestRequest {
  method?: string;
  headers: RestHeaders;
  body?: unknown;
  params?: Record<string, string | undefined>;
  query?: Record<string, string | string[] | undefined>;
}

export interface RestResponse<T = unknown> {
  status: number;
  body: T;
  headers?: Record<string, string>;
}

export interface RestErrorBody {
  error: {
    code: string;
    message: string;
  };
}

export interface RestDocNumberConfig {
  docNumber: DocNumberApi;
}

export interface FormatBody {
  id: string;
  entityKey: string;
  pattern: string;
  reset: ResetPeriod;
  prefix?: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateFormatBody {
  entityKey: string;
  pattern: string;
  reset?: ResetPeriod;
  prefix?: string;
  id?: string;
  active?: boolean;
}

export interface UpdateFormatBody {
  entityKey?: string;
  pattern?: string;
  reset?: ResetPeriod;
  prefix?: string | null;
  active?: boolean;
}

export interface PreviewBody {
  pattern: string;
  sequence: number;
  at?: string;
  prefix?: string;
}
