"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { FileManagerClient } from "../client/create-client.js";
import { uploadViaPresign } from "../client/upload-via-presign.js";

export function fileManagerQueryKeys(baseUrl: string) {
  return {
    all: ["file-manager", baseUrl] as const,
    list: (namespace?: string) =>
      [...fileManagerQueryKeys(baseUrl).all, "list", namespace ?? ""] as const,
  };
}

export function useFileList(options: {
  client: FileManagerClient;
  baseUrl: string;
  namespace?: string;
}) {
  return useQuery({
    queryKey: fileManagerQueryKeys(options.baseUrl).list(options.namespace),
    queryFn: async () => {
      const result = await options.client.listFiles({
        namespace: options.namespace,
        status: "ready",
      });
      if (!result.ok) throw new Error(`List failed (${result.status})`);
      return result.data.items;
    },
  });
}

export function usePresignedUpload(options: {
  client: FileManagerClient;
  baseUrl: string;
  namespace?: string;
}) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (file: File) =>
      uploadViaPresign({
        client: options.client,
        file,
        namespace: options.namespace,
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: fileManagerQueryKeys(options.baseUrl).all,
      });
    },
  });
}

export function useFileDownloadUrl(options: {
  client: FileManagerClient;
  fileId: string | null;
}) {
  return useQuery({
    queryKey: ["file-manager", "download", options.fileId],
    enabled: Boolean(options.fileId),
    queryFn: async () => {
      if (!options.fileId) return null;
      const result = await options.client.getDownloadUrl(options.fileId);
      if (!result.ok) throw new Error(`Download URL failed (${result.status})`);
      return result.data;
    },
  });
}
