import type { BackseatSnapshot } from "../core/types.js";

/** Demo ERP seed — partners, products, open purchase orders. */
export const erpDemoSnapshot: BackseatSnapshot = {
  partners: [
    {
      id: "partner-acme",
      code: "ACME",
      name: "Acme Supplies",
      role: "supplier",
      currency: "USD",
    },
    {
      id: "partner-globex",
      code: "GLOBEX",
      name: "Globex Retail",
      role: "customer",
      currency: "USD",
    },
  ],
  products: [
    {
      id: "prod-desk",
      sku: "DESK-01",
      name: "Standing desk",
      type: "stock",
      unitPrice: "499.00",
      currency: "USD",
    },
    {
      id: "prod-chair",
      sku: "CHAIR-01",
      name: "Ergonomic chair",
      type: "stock",
      unitPrice: "249.00",
      currency: "USD",
    },
    {
      id: "prod-setup",
      sku: "SVC-SETUP",
      name: "On-site setup",
      type: "service",
      unitPrice: "150.00",
      currency: "USD",
    },
  ],
  purchaseOrders: [
    {
      id: "po-1001",
      docNumber: "PO-1001",
      status: "approved",
      partnerId: "partner-acme",
      currency: "USD",
      lines: [
        {
          itemId: "prod-desk",
          quantity: "2",
          unitPrice: "499.00",
        },
        {
          itemId: "prod-chair",
          quantity: "4",
          unitPrice: "249.00",
        },
      ],
    },
  ],
};

export function createErpDemoSnapshot(): BackseatSnapshot {
  return structuredClone(erpDemoSnapshot);
}
