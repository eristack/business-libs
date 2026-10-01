import { beforeEach, describe, expect, it, vi } from "vitest";

const capturedInputs: unknown[] = [];

vi.mock("@aws-sdk/s3-request-presigner", () => ({
  getSignedUrl: vi.fn(async (_client: unknown, command: { input: unknown }) => {
    capturedInputs.push(command.input);
    return "https://signed.example/get";
  }),
}));

import { createS3StorageDriver } from "../src/s3/create-s3-driver.js";

describe("createS3StorageDriver presignGet", () => {
  beforeEach(() => {
    capturedInputs.length = 0;
  });

  it("omits ResponseContentDisposition without downloadFilename", async () => {
    const driver = createS3StorageDriver({ bucket: "b", region: "us-east-1" });
    await driver.presignGet({ key: "objects/photo.png" });
    const input = capturedInputs[0] as { ResponseContentDisposition?: string };
    expect(input.ResponseContentDisposition).toBeUndefined();
  });

  it("sets attachment when downloadFilename is provided", async () => {
    const driver = createS3StorageDriver({ bucket: "b", region: "us-east-1" });
    await driver.presignGet({
      key: "objects/photo.png",
      options: { downloadFilename: "photo.png" },
    });
    const input = capturedInputs[0] as { ResponseContentDisposition?: string };
    expect(input.ResponseContentDisposition).toBe('attachment; filename="photo.png"');
  });
});
