import { joinRoutePath, type RestLikeRequest } from "@eristack/backseat/adapters";
import type { createRestFileManagerActions } from "../rest/actions.js";
import type { RestRequest } from "../rest/types.js";

type FileManagerActions = ReturnType<typeof createRestFileManagerActions>;

function toRestRequest(req: RestLikeRequest): RestRequest {
  return {
    method: req.method ?? "GET",
    headers: {
      get(name: string) {
        const value = req.headers.get(name);
        return value ?? null;
      },
    },
    body: req.body,
    params: req.params as Record<string, string | undefined>,
    query: req.query as Record<string, string | string[] | undefined>,
  };
}

export function createFileManagerRestRoutes(
  base: string,
  actions: FileManagerActions,
) {
  return [
    {
      method: "POST" as const,
      path: joinRoutePath(base, "/uploads/presign"),
      name: "file-manager.presign-upload",
      handler: (req: RestLikeRequest) => actions.presignUpload(toRestRequest(req)),
    },
    {
      method: "POST" as const,
      path: joinRoutePath(base, "/uploads/complete"),
      name: "file-manager.complete-upload",
      handler: (req: RestLikeRequest) => actions.completeUpload(toRestRequest(req)),
    },
    {
      method: "GET" as const,
      path: joinRoutePath(base, "/"),
      name: "file-manager.list",
      handler: (req: RestLikeRequest) => actions.listFiles(toRestRequest(req)),
    },
    {
      method: "GET" as const,
      path: joinRoutePath(base, "/:id/download-url"),
      name: "file-manager.download-url",
      handler: (req: RestLikeRequest) => actions.getDownloadUrl(toRestRequest(req)),
    },
    {
      method: "GET" as const,
      path: joinRoutePath(base, "/:id"),
      name: "file-manager.get",
      handler: (req: RestLikeRequest) => actions.getFile(toRestRequest(req)),
    },
    {
      method: "DELETE" as const,
      path: joinRoutePath(base, "/:id"),
      name: "file-manager.delete",
      handler: (req: RestLikeRequest) => actions.deleteFile(toRestRequest(req)),
    },
  ];
}
