export type RankedId = { id: string; rank: number };

/** Reciprocal Rank Fusion — stable hybrid of lexical + vector lists. */
export function reciprocalRankFusion(
  lists: RankedId[][],
  options: { k?: number; limit?: number } = {},
): Array<{ id: string; score: number }> {
  const k = options.k ?? 60;
  const limit = options.limit ?? 8;
  const scores = new Map<string, number>();

  for (const list of lists) {
    for (const item of list) {
      const add = 1 / (k + item.rank);
      scores.set(item.id, (scores.get(item.id) ?? 0) + add);
    }
  }

  return [...scores.entries()]
    .map(([id, score]) => ({ id, score }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}
