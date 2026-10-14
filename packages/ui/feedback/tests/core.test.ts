import { describe, expect, it } from "vitest";
import { createBusy, runFeedbackSequence } from "../src/index.js";

describe("@eristack/feedback core", () => {
  it("createBusy tracks nested runs and clears label at zero depth", async () => {
    const busy = createBusy();
    expect(busy.isBusy()).toBe(false);

    await busy.run(async () => {
      expect(busy.isBusy()).toBe(true);
      expect(busy.getState().label).toBe("save");
      await busy.run(async () => {
        expect(busy.getState().depth).toBe(2);
      });
      expect(busy.getState().depth).toBe(1);
    }, "save");

    expect(busy.isBusy()).toBe(false);
    expect(busy.getState().label).toBeUndefined();
  });

  it("runFeedbackSequence skips work when confirm returns false", async () => {
    const busy = createBusy();
    let ran = false;
    const result = await runFeedbackSequence({
      busy,
      confirm: () => false,
      work: async () => {
        ran = true;
        return 1;
      },
    });
    expect(result).toBeUndefined();
    expect(ran).toBe(false);
  });

  it("runFeedbackSequence calls onError without rethrowing", async () => {
    const busy = createBusy();
    const errors: unknown[] = [];
    await runFeedbackSequence({
      busy,
      work: async () => {
        throw new Error("fail");
      },
      onError: (err) => errors.push(err),
    });
    expect(errors).toHaveLength(1);
    expect(busy.isBusy()).toBe(false);
  });
});
