import type { QupsLineColumnOptions } from "./line-columns.js";
import { qupsLineColumns } from "./line-columns.js";
import type { DrizzleDialect } from "./types.js";

export type QupsProfileColumnHints = {
  /** Profile stores line ordering separately. */
  trackPosition?: boolean;
  /** Profile row includes created/updated timestamps. */
  trackTimestamps?: boolean;
  /** Detail rows reference profile_id. */
  linkProfile?: boolean;
};

const DEFAULT_HINTS: Required<QupsProfileColumnHints> = {
  trackPosition: false,
  trackTimestamps: false,
  linkProfile: true,
};

/** Map profile storage hints to qupsLineColumns options. */
export function qupsLineColumnOptionsFromProfile(
  hints: QupsProfileColumnHints = {},
): QupsLineColumnOptions {
  const merged = { ...DEFAULT_HINTS, ...hints };
  return {
    includeProfileId: merged.linkProfile,
    includePosition: merged.trackPosition,
    includeTimestamps: merged.trackTimestamps,
  };
}

/** Drizzle column bundle from profile hints — Q5 generator entrypoint. */
export function qupsLineColumnsFromProfile(
  dialect: DrizzleDialect,
  hints?: QupsProfileColumnHints,
) {
  const options = qupsLineColumnOptionsFromProfile(hints);
  switch (dialect) {
    case "pgsql":
      return qupsLineColumns("pgsql", options);
    case "mysql":
      return qupsLineColumns("mysql", options);
    case "sqlite":
      return qupsLineColumns("sqlite", options);
    default: {
      const _exhaustive: never = dialect;
      throw new Error(`Unsupported dialect: ${String(_exhaustive)}`);
    }
  }
}
