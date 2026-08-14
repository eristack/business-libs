import { registerRestLikeRoutes } from "@eristack/backseat/adapters";
import type { Backseat } from "@eristack/backseat";
import { createRestActions, type RestDocNumberConfig } from "../rest/index.js";

export type RegisterDocNumberBackseatOptions = RestDocNumberConfig & {
  basePath?: string;
  paths?: {
    formats?: string;
    activeFormat?: string;
    formatById?: string;
    preview?: string;
  };
};

function joinPath(base: string, segment: string): string {
  const left = base.replace(/\/$/, "");
  const right = segment.startsWith("/") ? segment : `/${segment}`;
  return `${left}${right}` || "/";
}

export function registerDocNumberBackseat(
  api: Backseat,
  options: RegisterDocNumberBackseatOptions,
): void {
  const actions = createRestActions(options);
  const base = options.basePath ?? "/doc-number";
  const paths = {
    formats: options.paths?.formats ?? "/formats",
    activeFormat: options.paths?.activeFormat ?? "/formats/active",
    formatById: options.paths?.formatById ?? "/formats/:id",
    preview: options.paths?.preview ?? "/preview",
  };

  registerRestLikeRoutes(api, [
    {
      method: "GET",
      path: joinPath(base, paths.formats),
      name: "doc-number.list-formats",
      handler: (req) => actions.listFormats(req),
    },
    {
      method: "GET",
      path: joinPath(base, paths.activeFormat),
      name: "doc-number.active-format",
      handler: (req) => actions.getActiveFormat(req),
    },
    {
      method: "GET",
      path: joinPath(base, paths.formatById),
      name: "doc-number.get-format",
      handler: (req) => actions.getFormatById(req),
    },
    {
      method: "POST",
      path: joinPath(base, paths.formats),
      name: "doc-number.create-format",
      handler: (req) => actions.createFormat(req),
    },
    {
      method: "PATCH",
      path: joinPath(base, paths.formatById),
      name: "doc-number.update-format",
      handler: (req) => actions.updateFormat(req),
    },
    {
      method: "POST",
      path: joinPath(base, paths.preview),
      name: "doc-number.preview",
      handler: (req) => actions.preview(req),
    },
  ]);
}

export { createBackseatFormatStore } from "./format-store.js";
export { createBackseatSequenceStore } from "./sequence-store.js";
export { DOC_NUMBER_COLLECTIONS, sequenceDocId } from "./collections.js";
