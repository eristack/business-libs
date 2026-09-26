import { describe, expect, it, vi } from "vitest";
import { createFileManagerClient } from "../src/client/create-client.js";
import { uploadViaPresign } from "../src/client/upload-via-presign.js";

describe("uploadViaPresign", () => {
  it("runs presign → PUT → complete", async () => {
    const calls: string[] = [];
    const fetchMock = vi.fn(async (input: RequestInfo, init?: RequestInit) => {
      const url = String(input);
      if (url.includes("/uploads/presign")) {
        calls.push("presign");
        return new Response(
          JSON.stringify({
            fileId: "f1",
            uploadUrl: "memory://backseat/key?method=PUT",
            uploadMethod: "PUT",
            expiresAt: new Date().toISOString(),
            ref: {},
          }),
          { status: 201 },
        );
      }
      if (url.includes("memory://")) {
        calls.push("put");
        return new Response(null, { status: 200 });
      }
      if (url.includes("/uploads/complete")) {
        calls.push("complete");
        return new Response(
          JSON.stringify({
            id: "f1",
            status: "ready",
            namespace: "default",
            ref: {},
            createdAt: "",
            updatedAt: "",
          }),
          { status: 200 },
        );
      }
      return new Response("unexpected", { status: 500 });
    });

    const client = createFileManagerClient({
      baseUrl: "https://api.test/files",
      fetch: fetchMock as typeof fetch,
    });

    const file = new File(["abc"], "demo.txt", { type: "text/plain" });
    const stored = await uploadViaPresign({
      client,
      file,
      fetch: fetchMock as typeof fetch,
    });

    expect(stored.id).toBe("f1");
    expect(calls).toEqual(["presign", "put", "complete"]);
  });
});
