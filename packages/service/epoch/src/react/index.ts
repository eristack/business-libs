"use client";

import {
  useQuery,
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

export { compareEpochs } from "../core/compare.js";
