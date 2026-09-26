import type { PresignedUploadSession, StoredFile } from "../core/types.js";

export type FileManagerClientConfig = {
  baseUrl: string;
  fetch?: typeof fetch;
};

export type FileManagerClient = ReturnType<typeof createFileManagerClient>;

export function createFileManagerClient(config: FileManagerClientConfig) {
  const fetchFn = config.fetch ?? fetch;
  const base = config.baseUrl.replace(/\/$/, "");

  async function request<T>(
    path: string,
    init?: RequestInit,
  ): Promise<{ ok: true; data: T } | { ok: false; status: number; body: unknown }> {
    const res = await fetchFn(`${base}${path}`, {
      ...init,
      headers: {
        "content-type": "application/json",
        ...(init?.headers ?? {}),
      },
    });
    if (res.status === 204) {
      return { ok: true, data: undefined as T };
    }
    const body = (await res.json().catch(() => null)) as unknown;
    if (!res.ok) return { ok: false, status: res.status, body };
    return { ok: true, data: body as T };
  }

  return {
    presignUpload(input: {
      originalName: string;
      mimeType: string;
      sizeBytes: number;
      namespace?: string;
      ownerId?: string;
    }) {
      return request<PresignedUploadSession>("/uploads/presign", {
        method: "POST",
        body: JSON.stringify(input),
      });
    },
    completeUpload(input: { fileId: string; checksumSha256?: string }) {
      return request<StoredFile>("/uploads/complete", {
        method: "POST",
        body: JSON.stringify(input),
      });
    },
    listFiles(query?: { namespace?: string; status?: string }) {
      const params = new URLSearchParams();
      if (query?.namespace) params.set("namespace", query.namespace);
      if (query?.status) params.set("status", query.status);
      const qs = params.toString();
      return request<{ items: StoredFile[] }>(qs ? `/?${qs}` : "/");
    },
    getDownloadUrl(fileId: string) {
      return request<{ url: string; expiresAt: string }>(`/${fileId}/download-url`);
    },
    deleteFile(fileId: string) {
      return request<void>(`/${fileId}`, { method: "DELETE" });
    },
  };
}
