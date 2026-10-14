"use client";

import { useEffect, useRef } from "react";
import {
  useQuery,
  useQueryClient,
  type QueryKey,
  type UseQueryOptions,
  type UseQueryResult,
} from "@tanstack/react-query";
import type {
  CachePolicyResult,
  EpochScope,
  EpochValue,
} from "../core/types.js";
import type { EpochClient } from "../client/index.js";
import { shouldInvalidateOnEpochChange } from "./invalidation.js";

export function epochCurrentQueryKey(scope: EpochScope): QueryKey {
  return ["epoch", "current", scope] as const;
}

export function epochCachePolicyQueryKey(
  scope: EpochScope,
  clientEpoch: EpochValue,
): QueryKey {
  return ["epoch", "cache-policy", scope, clientEpoch] as const;
}

export function useEpochCurrent(
  client: EpochClient,
  scope: EpochScope,
  options?: Omit<
    UseQueryOptions<EpochValue, Error, EpochValue, QueryKey>,
    "queryKey" | "queryFn"
  >,
): UseQueryResult<EpochValue, Error> {
  return useQuery({
    queryKey: epochCurrentQueryKey(scope),
    queryFn: () => client.current(scope),
    ...options,
  });
}

/** Ask the server whether TanStack Query (or any cache) should refetch for this scope. */
export function useEpochCachePolicy(
  client: EpochClient,
  scope: EpochScope,
  clientEpoch: EpochValue,
  options?: Omit<
    UseQueryOptions<CachePolicyResult, Error, CachePolicyResult, QueryKey>,
    "queryKey" | "queryFn"
  >,
): UseQueryResult<CachePolicyResult, Error> {
  return useQuery({
    queryKey: epochCachePolicyQueryKey(scope, clientEpoch),
    queryFn: () => client.resolveCachePolicy(scope, clientEpoch),
    ...options,
  });
}

export type UseEpochInvalidationOptions = {
  /**
   * When true (default), invalidate only queries whose key matches exactly — not prefix children.
   * Use `false` for list/register keys that should refetch all detail queries under a prefix.
   */
  exact?: boolean;
} & Omit<
  UseQueryOptions<EpochValue, Error, EpochValue, QueryKey>,
  "queryKey" | "queryFn"
>;

/**
 * Subscribes to the server epoch for `scope` and invalidates TanStack Query when it bumps.
 * Pair with a detail `queryKey` and default `exact: true` so list epoch bumps do not overwrite open edits.
 */
export function useEpochInvalidation(
  client: EpochClient,
  scope: EpochScope,
  queryKey: QueryKey,
  options?: UseEpochInvalidationOptions,
): UseQueryResult<EpochValue, Error> {
  const { exact = true, ...queryOptions } = options ?? {};
  const queryClient = useQueryClient();
  const previousEpochRef = useRef<EpochValue | undefined>(undefined);

  const result = useEpochCurrent(client, scope, queryOptions);

  useEffect(() => {
    const current = result.data;
    if (
      shouldInvalidateOnEpochChange(previousEpochRef.current, current)
    ) {
      void queryClient.invalidateQueries({ queryKey, exact });
    }
    if (current !== undefined) {
      previousEpochRef.current = current;
    }
  }, [result.data, queryClient, queryKey, exact]);

  return result;
}

export { shouldInvalidateOnEpochChange } from "./invalidation.js";
export { compareEpochs } from "../core/compare.js";
