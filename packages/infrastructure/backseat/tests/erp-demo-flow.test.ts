import { describe, expect, it } from "vitest";
import { createErpDemoBackseat } from "../src/seeds/erp-demo-backseat.js";

describe("ERP demo document flow", () => {
  it("lists → edits draft → submit → approve", async () => {
    const api = createErpDemoBackseat();
    await api.reseed();

    const approved = await api.handlers.purchaseOrders.list({
      where: { status: "approved" },
    });
    expect(approved).toHaveLength(1);
    expect(approved[0]?.id).toBe("po-1001");

    const drafts = await api.handlers.purchaseOrders.list({
      where: { status: "draft" },
    });
    expect(drafts).toHaveLength(1);

    await api.handlers.purchaseOrders.patch("po-1002", {
      lines: [{ itemId: "prod-setup", quantity: "2", unitPrice: "150.00" }],
    });

    const approveDraft = await api.handle({
      method: "POST",
      path: "/api/purchase-orders/po-1002/approve",
      body: {},
    });
    expect(approveDraft.status).toBe(409);

    const submit = await api.handle({
      method: "POST",
      path: "/api/purchase-orders/po-1002/submit",
      body: {},
    });
    expect(submit.status).toBe(200);
    expect(submit.body).toMatchObject({ status: "submitted" });

    const open = await api.invoke("purchaseOrders.openByPartner", {
      partnerId: "partner-acme",
    });
    expect(open).toHaveLength(1);

    const approve = await api.handle({
      method: "POST",
      path: "/api/purchase-orders/po-1002/approve",
      body: { note: "Looks good" },
    });
    expect(approve.status).toBe(200);
    expect(approve.body).toMatchObject({
      status: "approved",
      approvedNote: "Looks good",
    });

    const openAfter = await api.invoke("purchaseOrders.openByPartner", {
      partnerId: "partner-acme",
    });
    expect(openAfter).toEqual([]);
  });

  it("dedupes POST /purchase-orders by idempotencyKey", async () => {
    const api = createErpDemoBackseat();
    await api.reseed();

    const body = { partnerId: "partner-acme", idempotencyKey: "po-create-1" };
    const first = await api.handle({
      method: "POST",
      path: "/api/purchase-orders",
      body,
    });
    const second = await api.handle({
      method: "POST",
      path: "/api/purchase-orders",
      body,
    });
    expect(first.status).toBe(201);
    expect(second.status).toBe(200);
    expect(second.body).toMatchObject({ id: (first.body as { id: string }).id });
  });
});
