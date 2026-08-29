import type { RestRouteDef } from "./types.js";

export type CompiledRoute = RestRouteDef & {
  keys: string[];
  pattern: RegExp;
};

export function compileRoute(def: RestRouteDef): CompiledRoute {
  const keys: string[] = [];
  const patternSource = def.path.replace(/\//g, "\\/").replace(
    /:([A-Za-z0-9_]+)/g,
    (_, key: string) => {
      keys.push(key);
      return "([^/]+)";
    },
  );
  return {
    ...def,
    keys,
    pattern: new RegExp(`^${patternSource}$`),
  };
}

export function matchPath(
  compiled: CompiledRoute,
  path: string,
): Record<string, string> | null {
  const match = compiled.pattern.exec(path);
  if (!match) return null;
  const params: Record<string, string> = {};
  for (let i = 0; i < compiled.keys.length; i += 1) {
    params[compiled.keys[i]!] = decodeURIComponent(match[i + 1] ?? "");
  }
  return params;
}
