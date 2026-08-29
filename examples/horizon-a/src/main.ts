import { createHorizonBackseat } from "./backseat/register.js";
import { registerOrderRoutes } from "./routes/orders.js";
import { createHorizonEpochClient } from "./lib/epoch-client.js";
import { loadHorizonASeedV1 } from "@eristack/backseat/seeds";
import { ConfigurationError, UsernameTakenError } from "@eristack/jwt-auth";

async function main(): Promise<void> {
  const { api, pbac, epoch, jwtAuth } = createHorizonBackseat();
  registerOrderRoutes(api, { pbac, epoch });
  await api.store.importSnapshot(loadHorizonASeedV1());

  try {
    await jwtAuth.registerCredentials({
      subject: "user-1",
      username: "demo",
      password: "password123",
    });
  } catch (error) {
    if (
      !(error instanceof UsernameTakenError) &&
      !(
        error instanceof ConfigurationError &&
        error.message.includes("credentials already exist")
      )
    ) {
      throw error;
    }
  }

  console.log("Horizon A example — routes registered:");
  for (const route of api.listRoutes()) {
    if (route.path.includes("order") || route.path.includes("qups")) {
      console.log(`  ${route.method} ${route.fullPath ?? route.path}`);
    }
  }

  const list = await api.handle({ method: "GET", path: "/api/orders" });
  console.log("\nGET /api/orders →", list.status, list.body);

  const epochClient = createHorizonEpochClient(api);
  const listEpoch = await epochClient.current("orders");
  const cacheBefore = await epochClient.resolveCachePolicy("orders", listEpoch);
  console.log("\nepoch cache-policy (fresh) →", cacheBefore);

  const submit = await api.handle({
    method: "PATCH",
    path: "/api/orders/ord_demo",
    body: { expectedVersion: 1, action: "submit" },
  });
  console.log("\nPATCH submit (v1) →", submit.status, submit.body);

  const cacheAfter = await epochClient.resolveCachePolicy("orders", listEpoch);
  console.log("\nepoch cache-policy (stale clientEpoch) →", cacheAfter);

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
  console.log(
    "\nGET /api/orders-grid →",
    grid.status,
    (grid.body as { items?: unknown[] })?.items?.length ?? grid.body,
  );

  const login = await api.handle({
    method: "POST",
    path: "/api/auth/login",
    body: { username: "demo", password: "password123" },
  });
  console.log("\nPOST /api/auth/login →", login.status, login.status === 200 ? "ok" : login.body);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
