import { normalizeBasePath } from "@eristack/backseat/adapters";
import type { Backseat } from "@eristack/backseat";
import { createRestActions, type RestDocNumberConfig } from "../rest/index.js";
import { registerDocNumberRestRoutes } from "./doc-number-routes.js";

export type RegisterDocNumberBackseatOptions = RestDocNumberConfig & {
  basePath?: string;
  paths?: {
    formats?: string;
    activeFormat?: string;
    formatById?: string;
    preview?: string;
  };
};

export function registerDocNumberBackseat(
  api: Backseat,
  options: RegisterDocNumberBackseatOptions,
): void {
  const actions = createRestActions(options);
  const base = normalizeBasePath(options.basePath ?? "/doc-number");
  const paths = {
    formats: options.paths?.formats ?? "/formats",
    activeFormat: options.paths?.activeFormat ?? "/formats/active",
    formatById: options.paths?.formatById ?? "/formats/:id",
    preview: options.paths?.preview ?? "/preview",
  };

  registerDocNumberRestRoutes(api, base, paths, actions);
}

export { createBackseatFormatStore } from "./format-store.js";
export { createBackseatSequenceStore } from "./sequence-store.js";
export { DOC_NUMBER_COLLECTIONS, sequenceDocId } from "./collections.js";
