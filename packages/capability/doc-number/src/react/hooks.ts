import { useCallback, useEffect, useState } from "react";
import type {
  CreateFormatBody,
  FormatBody,
  PreviewBody,
  UpdateFormatBody,
} from "../rest/types.js";
import { useDocNumberContext } from "./context.js";

/** Bound client methods for format configuration. */
export function useDocNumber() {
  const { client } = useDocNumberContext();
  return {
    client,
    listFormats: client.listFormats.bind(client),
    getActiveFormat: client.getActiveFormat.bind(client),
    getFormatById: client.getFormatById.bind(client),
    createFormat: client.createFormat.bind(client),
    updateFormat: client.updateFormat.bind(client),
    preview: client.preview.bind(client),
  };
}

export type FormatsStatus = "idle" | "loading" | "ready" | "error";

/**
 * Headless hook for an entity's format list + active format.
 * Apps render their own settings UI; this only loads/mutates data.
 */
export function useDocNumberFormats(entityKey: string) {
  const { client } = useDocNumberContext();
  const [formats, setFormats] = useState<FormatBody[]>([]);
  const [active, setActive] = useState<FormatBody | null>(null);
  const [status, setStatus] = useState<FormatsStatus>("idle");
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!entityKey) return;
    setStatus("loading");
    setError(null);
    try {
      const [list, current] = await Promise.all([
        client.listFormats(entityKey),
        client.getActiveFormat(entityKey),
      ]);
      setFormats(list);
      setActive(current);
      setStatus("ready");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Failed to load formats");
    }
  }, [client, entityKey]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const createFormat = useCallback(
    async (input: Omit<CreateFormatBody, "entityKey"> & { entityKey?: string }) => {
      const created = await client.createFormat({
        ...input,
        entityKey: input.entityKey ?? entityKey,
      });
      await refresh();
      return created;
    },
    [client, entityKey, refresh],
  );

  const updateFormat = useCallback(
    async (id: string, input: UpdateFormatBody) => {
      const updated = await client.updateFormat(id, input);
      await refresh();
      return updated;
    },
    [client, refresh],
  );

  const preview = useCallback(
    (input: PreviewBody) => client.preview(input),
    [client],
  );

  return {
    formats,
    active,
    status,
    error,
    refresh,
    createFormat,
    updateFormat,
    preview,
  };
}
