import { describe, expect, it } from "vitest";
import { loginBodySchema } from "../src/zod/schemas.js";

describe("jwt-auth zod", () => {
  it("loginBodySchema requires username and password", () => {
    expect(loginBodySchema.safeParse({ username: "a", password: "b" }).success).toBe(
      true,
    );
    expect(loginBodySchema.safeParse({ username: "a" }).success).toBe(false);
  });
});
