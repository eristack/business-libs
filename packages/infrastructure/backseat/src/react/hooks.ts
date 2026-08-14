"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationOptions,
  type UseQueryOptions,
} from "@tanstack/react-query";
import type {
  BackseatCollectionFilter,
  BackseatDocument,
} from "../core/types.js";
import { useBackseat } from "./context.js";
import {
  backseatDetailQueryKey,
  backseatListQueryKey,
} from "./keys.js";

export function useBackseatList<T extends BackseatDocument = BackseatDocument>(
  collection: string,
  filter?: BackseatCollectionFilter,
  options?: Omit<
    UseQueryOptions<T[], Error, T[], ReturnType<typeof backseatListQueryKey>>,
    "queryKey" | "queryFn"
  >,
) {
  const backseat = useBackseat();
  const handlers = backseat.handlers[collection];
  if (!handlers) {
    throw new Error(`Backseat collection not registered: ${collection}`);
  }

  return useQuery({
    queryKey: backseatListQueryKey(collection, filter),
    queryFn: () => handlers.list(filter) as Promise<T[]>,
    ...options,
  });
}

export function useBackseatGet<T extends BackseatDocument = BackseatDocument>(
  collection: string,
  id: string | undefined,
  options?: Omit<
    UseQueryOptions<T, Error, T, ReturnType<typeof backseatDetailQueryKey>>,
    "queryKey" | "queryFn" | "enabled"
  >,
) {
  const backseat = useBackseat();
  const handlers = backseat.handlers[collection];
  if (!handlers) {
    throw new Error(`Backseat collection not registered: ${collection}`);
  }

  return useQuery({
    queryKey: backseatDetailQueryKey(collection, id ?? ""),
    queryFn: () => handlers.get(id!) as Promise<T>,
    enabled: Boolean(id),
    ...options,
  });
}

export function useBackseatCreate<T extends BackseatDocument = BackseatDocument>(
  collection: string,
  options?: UseMutationOptions<T, Error, BackseatDocument>,
) {
  const backseat = useBackseat();
  const queryClient = useQueryClient();
  const handlers = backseat.handlers[collection];
  if (!handlers) {
    throw new Error(`Backseat collection not registered: ${collection}`);
  }

  return useMutation({
    mutationFn: (body) => handlers.create(body) as Promise<T>,
    onSuccess: (...args) => {
      void queryClient.invalidateQueries({
        queryKey: backseatListQueryKey(collection),
      });
      options?.onSuccess?.(...args);
    },
    ...options,
  });
}

export function useBackseatPatch<T extends BackseatDocument = BackseatDocument>(
  collection: string,
  options?: UseMutationOptions<
    T,
    Error,
    { id: string; body: BackseatDocument }
  >,
) {
  const backseat = useBackseat();
  const queryClient = useQueryClient();
  const handlers = backseat.handlers[collection];
  if (!handlers) {
    throw new Error(`Backseat collection not registered: ${collection}`);
  }

  return useMutation({
    mutationFn: ({ id, body }) => handlers.patch(id, body) as Promise<T>,
    onSuccess: (data, variables, ...rest) => {
      void queryClient.invalidateQueries({
        queryKey: backseatListQueryKey(collection),
      });
      void queryClient.invalidateQueries({
        queryKey: backseatDetailQueryKey(collection, variables.id),
      });
      options?.onSuccess?.(data, variables, ...rest);
    },
    ...options,
  });
}

export function useBackseatDelete(
  collection: string,
  options?: UseMutationOptions<void, Error, string>,
) {
  const backseat = useBackseat();
  const queryClient = useQueryClient();
  const handlers = backseat.handlers[collection];
  if (!handlers) {
    throw new Error(`Backseat collection not registered: ${collection}`);
  }

  return useMutation({
    mutationFn: (id) => handlers.delete(id),
    onSuccess: (data, id, ...rest) => {
      void queryClient.invalidateQueries({
        queryKey: backseatListQueryKey(collection),
      });
      void queryClient.invalidateQueries({
        queryKey: backseatDetailQueryKey(collection, id),
      });
      options?.onSuccess?.(data, id, ...rest);
    },
    ...options,
  });
}

export { backseatDetailQueryKey, backseatListQueryKey, backseatQueryKey } from "./keys.js";
