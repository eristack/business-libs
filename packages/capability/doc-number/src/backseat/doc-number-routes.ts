import {
  joinRoutePath,
  normalizeBasePath,
  registerRestLikeRoutes,
} from "@eristack/backseat/adapters";
import type { Backseat } from "@eristack/backseat";
import { createRestActions } from "../rest/index.js";

export function registerDocNumberRestRoutes(
  api: Backseat,
  base: string,
  paths: {
    formats: string;
    activeFormat: string;
    formatById: string;
    preview: string;
  },
  actions: ReturnType<typeof createRestActions>,
): void {
  registerRestLikeRoutes(api, [
    {
      method: "GET",
      path: joinRoutePath(base, paths.formats),
      name: "doc-number.list-formats",
      handler: (req) => actions.listFormats(req),
    },
    {
      method: "GET",
      path: joinRoutePath(base, paths.activeFormat),
      name: "doc-number.active-format",
      handler: (req) => actions.getActiveFormat(req),
    },
    {
      method: "GET",
      path: joinRoutePath(base, paths.formatById),
      name: "doc-number.get-format",
      handler: (req) => actions.getFormatById(req),
    },
    {
      method: "POST",
      path: joinRoutePath(base, paths.formats),
      name: "doc-number.create-format",
      handler: (req) => actions.createFormat(req),
    },
    {
      method: "PATCH",
      path: joinRoutePath(base, paths.formatById),
      name: "doc-number.update-format",
      handler: (req) => actions.updateFormat(req),
    },
    {
      method: "POST",
      path: joinRoutePath(base, paths.preview),
      name: "doc-number.preview",
      handler: (req) => actions.preview(req),
    },
  ]);
}
