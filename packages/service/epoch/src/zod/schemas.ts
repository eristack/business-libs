import { z } from "zod";

export const epochScopeSchema = z.string().min(1);

export const bumpEpochBodySchema = z.object({
  expected: z.number().int().nonnegative().optional(),
  by: z.number().int().positive().optional(),
});

export const resolveCachePolicyQuerySchema = z.object({
  scope: epochScopeSchema,
  clientEpoch: z.coerce.number().int().nonnegative(),
});

export const cachePolicyManyBodySchema = z.record(
  epochScopeSchema,
  z.number().int().nonnegative(),
);

export type BumpEpochBody = z.infer<typeof bumpEpochBodySchema>;
export type ResolveCachePolicyQuery = z.infer<
  typeof resolveCachePolicyQuerySchema
>;
