import type { HttpMethod, RouteDefinition } from "./types.js";

type Segment =
  | { kind: "literal"; value: string }
  | { kind: "param"; name: string }
  | { kind: "splat"; name: string };

type CompiledRoute = RouteDefinition & {
  segments: Segment[];
  splat: boolean;
};

function compilePath(path: string): { segments: Segment[]; splat: boolean } {
  const trimmed = path.startsWith("/") ? path.slice(1) : path;
  if (!trimmed) return { segments: [], splat: false };

  const raw = trimmed.split("/");
  const splat = raw.at(-1) === "*";
  const limit = splat ? raw.length - 1 : raw.length;
  const segments: Segment[] = [];

  for (let i = 0; i < limit; i += 1) {
    const part = raw[i]!;
    if (part.startsWith(":")) {
      segments.push({ kind: "param", name: part.slice(1) });
    } else {
      segments.push({ kind: "literal", value: part });
    }
  }

  if (splat) {
    segments.push({ kind: "splat", name: "_splat" });
  }

  return { segments, splat };
}

function matchSegments(
  segments: Segment[],
  requestSegments: string[],
): Record<string, string> | null {
  const params: Record<string, string> = {};
  let index = 0;

  for (const segment of segments) {
    if (segment.kind === "splat") {
      params[segment.name] = requestSegments.slice(index).join("/");
      return params;
    }

    const current = requestSegments[index];
    if (current === undefined) return null;

    if (segment.kind === "literal") {
      if (current !== segment.value) return null;
      index += 1;
      continue;
    }

    params[segment.name] = current;
    index += 1;
  }

  if (index !== requestSegments.length) return null;
  return params;
}

export class BackseatRouter {
  private routes: CompiledRoute[] = [];

  register(route: RouteDefinition): void {
    const compiled = compilePath(route.path);
    this.routes.push({ ...route, ...compiled });
    this.routes.sort((left, right) => {
      if (left.splat !== right.splat) return left.splat ? 1 : -1;
      return right.segments.length - left.segments.length;
    });
  }

  match(
    method: HttpMethod,
    path: string,
  ): { route: RouteDefinition; params: Record<string, string> } | null {
    const normalized = path.startsWith("/") ? path : `/${path}`;
    const requestSegments = normalized.split("/").filter(Boolean);

    for (const route of this.routes) {
      if (route.method !== method) continue;
      const params = matchSegments(route.segments, requestSegments);
      if (!params) continue;
      return { route, params };
    }

    return null;
  }

  list(): RouteDefinition[] {
    return this.routes.map(({ method, path, handler, collection, name }) => ({
      method,
      path,
      handler,
      collection,
      name,
    }));
  }
}

export function normalizeApiPath(baseUrl: string, path: string): string | null {
  const base = baseUrl.startsWith("/") ? baseUrl : `/${baseUrl}`;
  const normalized = path.startsWith("/") ? path : `/${path}`;
  if (!normalized.startsWith(base)) return null;
  const rest = normalized.slice(base.length);
  return rest.length > 0 ? rest : "/";
}
