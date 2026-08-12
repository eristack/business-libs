import { describe, expect, it } from "vitest";
import { reciprocalRankFusion } from "../src/index/rrf.js";

describe("reciprocalRankFusion", () => {
  it("prefers items high in multiple lists", () => {
    const fused = reciprocalRankFusion(
      [
        [
          { id: "a", rank: 1 },
          { id: "b", rank: 2 },
        ],
        [
          { id: "b", rank: 1 },
          { id: "c", rank: 2 },
        ],
      ],
      { limit: 3 },
    );
    expect(fused[0]?.id).toBe("b");
    expect(fused.map((item) => item.id).sort()).toEqual(["a", "b", "c"]);
  });
});
