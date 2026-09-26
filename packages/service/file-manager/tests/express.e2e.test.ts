import request from "supertest";
import { describe, expect, it } from "vitest";
import {
  createTestFileManagerApp,
  uploadTestFileViaPresign,
} from "./helpers.js";

describe("express file-manager E2E", () => {
  it("presign → upload → complete → download-url → delete", async () => {
    const { app, driver } = createTestFileManagerApp();
    const body = "hello-file-content";

    const presign = await request(app)
      .post("/files/uploads/presign")
      .send({
        originalName: "note.txt",
        mimeType: "text/plain",
        sizeBytes: body.length,
        namespace: "attachments",
      });

    expect(presign.status).toBe(201);
    const session = presign.body as {
      fileId: string;
      uploadUrl: string;
      uploadHeaders?: Record<string, string>;
    };

    await uploadTestFileViaPresign(driver, session, body);

    const complete = await request(app)
      .post("/files/uploads/complete")
      .send({ fileId: session.fileId });

    expect(complete.status).toBe(200);
    expect(complete.body.status).toBe("ready");

    const list = await request(app).get("/files?namespace=attachments");
    expect(list.status).toBe(200);
    expect((list.body as { items: unknown[] }).items).toHaveLength(1);

    const download = await request(app).get(
      `/files/${session.fileId}/download-url`,
    );
    expect(download.status).toBe(200);
    expect((download.body as { url: string }).url).toContain("memory://");

    const del = await request(app).delete(`/files/${session.fileId}`);
    expect(del.status).toBe(204);

    const gone = await request(app).get(`/files/${session.fileId}`);
    expect(gone.status).toBe(404);
  });

  it("complete fails when object missing", async () => {
    const { app } = createTestFileManagerApp();
    const presign = await request(app)
      .post("/files/uploads/presign")
      .send({
        originalName: "x.txt",
        mimeType: "text/plain",
        sizeBytes: 1,
      });
    const fileId = (presign.body as { fileId: string }).fileId;

    const complete = await request(app)
      .post("/files/uploads/complete")
      .send({ fileId });

    expect(complete.status).toBe(409);
  });

  it("download-url rejects pending upload", async () => {
    const { app } = createTestFileManagerApp();
    const presign = await request(app)
      .post("/files/uploads/presign")
      .send({
        originalName: "pending.txt",
        mimeType: "text/plain",
        sizeBytes: 3,
      });
    const fileId = (presign.body as { fileId: string }).fileId;

    const download = await request(app).get(`/files/${fileId}/download-url`);
    expect(download.status).toBe(409);
  });
});
