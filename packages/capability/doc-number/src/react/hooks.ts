import {
  useMutation,
  useQuery,
  useQueryClient,
  type QueryKey,
} from "@tanstack/react-query";
import type { DataGridQueryInput } from "@eristack/data-grid";
import { createDataGrid, serializeQuery } from "@eristack/data-grid";
import { formatDataGridSchema } from "../core/format-grid.js";
import type {
  CreateFormatBody,
  FormatBody,
  PreviewBody,
  UpdateFormatBody,
} from "../rest/types.js";
import { useDocNumberContext } from "./context.js";

/** Bound client methods — no server-state cache. Prefer Query hooks for lists. */
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

export function docNumberFormatsQueryKey(
  entityKey: string,
  queryInput?: DataGridQueryInput,
): QueryKey {
  const qs = serializeQuery(
    createDataGrid(formatDataGridSchema).parse(queryInput),
  ).toString();
  return ["eristack", "doc-number", "formats", entityKey, qs];
}

export function docNumberActiveFormatQueryKey(entityKey: string): QueryKey {
  return ["eristack", "doc-number", "formats", "active", entityKey];
}

export type FormatsStatus = "idle" | "loading" | "ready" | "error";

/**
 * TanStack Query list + active format for an entity.
 * Requires app-owned `QueryClientProvider`. Mutations invalidate format keys.
 */
export function useDocNumberFormats(
  entityKey: string,
  gridQuery?: DataGridQueryInput,
) {
  const { client } = useDocNumberContext();
  const queryClient = useQueryClient();

  const listQuery = useQuery({
    queryKey: docNumberFormatsQueryKey(entityKey, gridQuery),
    queryFn: () => client.listFormats(entityKey, gridQuery),
    enabled: Boolean(entityKey),
  });

  const activeQuery = useQuery({
    queryKey: docNumberActiveFormatQueryKey(entityKey),
    queryFn: () => client.getActiveFormat(entityKey),
    enabled: Boolean(entityKey),
  });

  const invalidate = async () => {
    await queryClient.invalidateQueries({
      queryKey: ["eristack", "doc-number", "formats", entityKey],
    });
  };

  const createMutation = useMutation({
    mutationFn: (
      input: Omit<CreateFormatBody, "entityKey"> & { entityKey?: string },
    ) =>
      client.createFormat({
        ...input,
        entityKey: input.entityKey ?? entityKey,
      }),
    onSuccess: () => invalidate(),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateFormatBody }) =>
      client.updateFormat(id, input),
    onSuccess: () => invalidate(),
  });

  const previewMutation = useMutation({
    mutationFn: (input: PreviewBody) => client.preview(input),
  });

  const status: FormatsStatus = !entityKey
    ? "idle"
    : listQuery.isError || activeQuery.isError
      ? "error"
      : listQuery.isPending || activeQuery.isPending
        ? "loading"
        : listQuery.isSuccess
          ? "ready"
          : "idle";

  const error =
    listQuery.error?.message ?? activeQuery.error?.message ?? null;

  return {
    formats: listQuery.data?.items ?? [],
    pageInfo: listQuery.data?.pageInfo ?? null,
    query: listQuery.data?.query ?? null,
    active: activeQuery.data ?? null,
    status,
    error,
    listQuery,
    activeQuery,
    refresh: invalidate,
    createFormat: (
      input: Omit<CreateFormatBody, "entityKey"> & { entityKey?: string },
    ) => createMutation.mutateAsync(input),
    updateFormat: (id: string, input: UpdateFormatBody) =>
      updateMutation.mutateAsync({ id, input }),
    preview: (input: PreviewBody) => previewMutation.mutateAsync(input),
    createMutation,
    updateMutation,
    previewMutation,
  };
}

export function useDocNumberFormat(id: string) {
  const { client } = useDocNumberContext();
  return useQuery({
    queryKey: ["eristack", "doc-number", "format", id],
    queryFn: () => client.getFormatById(id),
    enabled: Boolean(id),
  });
}

/** Headless TanStack Form options for create-format — no UI. */
export function createFormatFormOptions(options: {
  entityKey: string;
  onSubmit: (value: CreateFormatBody) => Promise<FormatBody | void>;
  defaultValues?: Partial<CreateFormatBody>;
}) {
  return {
    defaultValues: {
      entityKey: options.entityKey,
      pattern: "",
      reset: "never" as const,
      active: true,
      ...options.defaultValues,
    },
    onSubmit: async ({ value }: { value: CreateFormatBody }) => {
      await options.onSubmit(value);
    },
  };
}
