import { createHorizonBackseat } from "./backseat/register.js";
import { registerOrderRoutes } from "./routes/orders.js";
import { loadHorizonASeedV1 } from "@eristack/backseat/seeds";

async function main(): Promise<void> {
  const { api, pbac, epoch } = createHorizonBackseat();
  registerOrderRoutes(api, { pbac, epoch });
  await api.store.importSnapshot(loadHorizonASeedV1());

  console.log("Horizon A example — routes registered:");
  for (const route of api.listRoutes()) {
    if (route.path.includes("order") || route.path.includes("qups")) {
      console.log(`  ${route.method} ${route.fullPath ?? route.path}`);
    }
  }

  const list = await api.handle({ method: "GET", path: "/api/orders" });
  console.log("\nGET /api/orders →", list.status, list.body);

  const submit = await api.handle({
    method: "PATCH",
    path: "/api/orders/ord_demo",
    body: { expectedVersion: 1, action: "submit" },
  });
  console.log("\nPATCH submit (v1) →", submit.status, submit.body);

  const stale = await api.handle({
    method: "PATCH",
    path: "/api/orders/ord_demo",
    body: { expectedVersion: 1, action: "approve" },
  });
  console.log("\nPATCH stale version →", stale.status, stale.body);

  const grid = await api.handle({
    method: "GET",
    path: "/api/orders-grid",
    query: { mode: "advanced", page: "1", pageSize: "10" },
  });
  console.log("\nGET /api/orders-grid →", grid.status, (grid.body as { items?: unknown[] })?.items?.length ?? grid.body);

  const epochBefore = await api.handle({ method: "GET", path: "/api/epoch/orders" });
  console.log("\nGET /api/epoch/orders →", epochBefore.status, epochBefore.body);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
