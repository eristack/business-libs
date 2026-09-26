import { CommsSendFailedError } from "../core/errors.js";

export async function postJson(
  url: string,
  init: RequestInit & { fetch?: typeof fetch },
): Promise<Response> {
  const fetchFn = init.fetch ?? fetch;
  const { fetch: _f, ...rest } = init;
  return fetchFn(url, rest);
}

export async function readJsonOrThrow(res: Response, label: string): Promise<Record<string, unknown>> {
  const text = await res.text();
  let json: Record<string, unknown> = {};
  if (text) {
    try {
      json = JSON.parse(text) as Record<string, unknown>;
    } catch {
      json = { raw: text };
    }
  }
  if (!res.ok) {
    const msg =
      typeof json.message === "string"
        ? json.message
        : typeof json.error === "string"
          ? json.error
          : text || `${label} HTTP ${res.status}`;
    throw new CommsSendFailedError(msg);
  }
  return json;
}
