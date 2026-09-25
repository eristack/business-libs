import { describe, expect, it, vi } from "vitest";
import { PolicyDeniedError } from "../../../service/abac/src/core/errors.js";
import { BusinessPolicyDeniedError } from "../../../service/pbac/src/core/errors.js";
import { ForbiddenError } from "../../../service/rbac/src/core/errors.js";
import { BackseatVersionConflictError } from "../src/core/errors.js";
import {
  createAsyncHandler,
  createMapDomainError,
  resolveDomainError,
} from "../src/express/index.js";

function mockRes() {
  const res = {
    headersSent: false,
    statusCode: 200,
    body: undefined as unknown,
    status(code: number) {
      this.statusCode = code;
      return this;
    },
    json(payload: unknown) {
      this.body = payload;
      return this;
    },
    setHeader: vi.fn(),
  };
  return res;
}

describe("resolveDomainError", () => {
  it("maps RBAC forbidden to 403", () => {
    const err = new ForbiddenError("jobs.read", "user-1");
    const mapped = resolveDomainError(err);
    expect(mapped?.status).toBe(403);
    expect(mapped?.body.error.code).toBe(err.code);
  });

  it("maps PBAC and ABAC to 409", () => {
    const pbac = new BusinessPolicyDeniedError("job.post", "not draft");
    const abac = new PolicyDeniedError("job.in-scope", "branch mismatch");
    expect(resolveDomainError(pbac)?.body.error.code).toBe(
      "BUSINESS_POLICY_DENIED",
    );
    expect(resolveDomainError(abac)?.body.error.code).toBe("POLICY_DENIED");
  });

  it("maps BackseatVersionConflictError", () => {
    const mapped = resolveDomainError(new BackseatVersionConflictError());
    expect(mapped?.status).toBe(409);
    expect(mapped?.body.error.code).toBe("CONFLICT_VERSION");
  });

  it("honors custom map hook", () => {
    const mapped = resolveDomainError(new Error("app"), {
      map: () => ({
        status: 418,
        code: "TEAPOT",
        message: "custom",
      }),
    });
    expect(mapped?.status).toBe(418);
  });
});

describe("createMapDomainError", () => {
  it("writes JSON envelope to response", () => {
    const map = createMapDomainError();
    const res = mockRes();
    map(new BackseatVersionConflictError("stale"), res as never);
    expect(res.statusCode).toBe(409);
    expect(res.body).toEqual({
      error: { code: "CONFLICT_VERSION", message: "stale" },
    });
  });
});

describe("createAsyncHandler", () => {
  it("maps async handler errors", async () => {
    const handler = createAsyncHandler();
    const res = mockRes();
    const next = vi.fn();
    const wrapped = handler(async () => {
      throw new BackseatVersionConflictError();
    });
    await wrapped({} as never, res as never, next);
    expect(res.statusCode).toBe(409);
    expect(next).not.toHaveBeenCalled();
  });
});
