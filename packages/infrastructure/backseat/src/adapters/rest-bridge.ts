import type {
  Backseat,
  BackseatHandlerContext,
  BackseatResponse,
  HttpMethod,
} from "../core/types.js";

export type RestLikeRequest = {
  method?: string;
  headers: { get(name: string): string | null | undefined };
  cookies?: { get(name: string): string | undefined };
  body?: unknown;
  params?: Record<string, string | undefined>;
  query?: Record<string, string | string[] | undefined>;
};

export type RestLikeSetCookie = {
  name: string;
  value: string;
  httpOnly?: boolean;
  secure?: boolean;
  sameSite?: "strict" | "lax" | "none";
  path?: string;
  expires?: Date;
};

export type RestLikeResponse<T = unknown> = {
  status: number;
  body: T;
  headers?: Record<string, string>;
  cookies?: RestLikeSetCookie[];
  clearCookies?: string[];
};

function parseCookieHeader(header: string | null | undefined): Map<string, string> {
  const map = new Map<string, string>();
  if (!header) return map;
  for (const part of header.split(";")) {
    const trimmed = part.trim();
    if (!trimmed) continue;
    const eq = trimmed.indexOf("=");
    if (eq <= 0) continue;
    map.set(trimmed.slice(0, eq), trimmed.slice(eq + 1));
  }
  return map;
}

export function toRestLikeRequest(ctx: BackseatHandlerContext): RestLikeRequest {
  const headers = ctx.req.headers ?? {};
  const cookieHeader =
    headers.cookie ?? headers.Cookie ?? null;
  const cookies = parseCookieHeader(cookieHeader);

  return {
    method: ctx.req.method,
    headers: {
      get: (name) => {
        const direct =
          headers[name] ??
          headers[name.toLowerCase()] ??
          headers[name.toUpperCase()];
        return direct ?? null;
      },
    },
    cookies: {
      get: (name) => cookies.get(name),
    },
    body: ctx.req.body,
    params: ctx.params,
    query: ctx.req.query,
  };
}

function serializeSetCookie(cookie: RestLikeSetCookie): string {
  const parts = [`${cookie.name}=${cookie.value}`];
  if (cookie.httpOnly) parts.push("HttpOnly");
  if (cookie.secure) parts.push("Secure");
  if (cookie.sameSite) parts.push(`SameSite=${cookie.sameSite}`);
  if (cookie.path) parts.push(`Path=${cookie.path}`);
  if (cookie.expires) parts.push(`Expires=${cookie.expires.toUTCString()}`);
  return parts.join("; ");
}

export function toBackseatResponse(res: RestLikeResponse): BackseatResponse {
  const headers = { ...(res.headers ?? {}) };
  const setCookies: string[] = [];
  if (res.cookies) {
    for (const cookie of res.cookies) {
      setCookies.push(serializeSetCookie(cookie));
    }
  }
  if (res.clearCookies) {
    for (const name of res.clearCookies) {
      setCookies.push(`${name}=; Path=/; Max-Age=0`);
    }
  }
  if (setCookies.length) {
    headers["Set-Cookie"] = setCookies.join(", ");
  }
  return { status: res.status, body: res.body, headers };
}

export type RestLikeRoute = {
  method: HttpMethod;
  path: string;
  name?: string;
  handler: (req: RestLikeRequest) => Promise<RestLikeResponse>;
};

/** Wire headless REST action handlers onto a Backseat engine. */
export function registerRestLikeRoutes(
  api: Backseat,
  routes: RestLikeRoute[],
): void {
  for (const route of routes) {
    api.registerRoute({
      method: route.method,
      path: route.path,
      name: route.name,
      handler: async (ctx) =>
        toBackseatResponse(await route.handler(toRestLikeRequest(ctx))),
    });
  }
}
