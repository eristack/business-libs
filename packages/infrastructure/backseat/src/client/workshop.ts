export type WorkshopClientMode = "backseat" | "express";

export type CreateWorkshopClientOptions = {
  /** `backseat` — relative paths on the Vite/dev origin; `express` — absolute API base. */
  mode: WorkshopClientMode;
  /** Required for `express` (e.g. `http://localhost:3001`). Ignored for backseat. */
  baseUrl?: string;
  credentials?: RequestCredentials;
};

function normalizeBaseUrl(baseUrl: string): string {
  return baseUrl.replace(/\/$/, "");
}

function resolveWorkshopUrl(
  mode: WorkshopClientMode,
  baseUrl: string | undefined,
  path: string,
): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  if (mode === "backseat") {
    return normalizedPath;
  }
  const root = normalizeBaseUrl(baseUrl ?? "");
  if (!root) {
    throw new Error(
      "createWorkshopClient({ mode: 'express' }) requires baseUrl",
    );
  }
  return `${root}${normalizedPath}`;
}

/**
 * Thin fetch wrapper for dual-target ERP apps (Backseat in-browser vs Express mirror).
 * Does not replace TanStack Query — transport only.
 */
export function createWorkshopClient(options: CreateWorkshopClientOptions) {
  const defaultCredentials: RequestCredentials =
    options.credentials ??
    (options.mode === "express" ? "include" : "same-origin");

  return {
    mode: options.mode,
    fetch(path: string, init?: RequestInit): Promise<Response> {
      const url = resolveWorkshopUrl(options.mode, options.baseUrl, path);
      return fetch(url, {
        ...init,
        credentials: init?.credentials ?? defaultCredentials,
      });
    },
  };
}
