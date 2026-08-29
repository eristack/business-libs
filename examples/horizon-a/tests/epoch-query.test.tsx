/**
 * @vitest-environment jsdom
 */
import { describe, expect, it } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { loadHorizonASeedV1 } from "@eristack/backseat/seeds";
import { useEpochCachePolicy } from "@eristack/epoch/react";
import { createHorizonBackseat } from "../src/backseat/register.js";
import { registerOrderRoutes } from "../src/routes/orders.js";
import { createHorizonEpochClient } from "../src/lib/epoch-client.js";

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return function Provider({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  };
}

describe("useEpochCachePolicy (Horizon A)", () => {
  it("reports refetch when list epoch is stale after order PATCH", async () => {
    const { api, pbac, epoch } = createHorizonBackseat();
    registerOrderRoutes(api, { pbac, epoch });
    await api.store.importSnapshot(loadHorizonASeedV1());

    const epochClient = createHorizonEpochClient(api);
    const listEpoch = await epochClient.current("orders");

    await api.handle({
      method: "PATCH",
      path: "/api/orders/ord_demo",
      body: { expectedVersion: 1, action: "submit" },
    });

    const { result } = renderHook(
      () => useEpochCachePolicy(epochClient, "orders", listEpoch),
      { wrapper: createWrapper() },
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.policy).toBe("refetch");
    expect(result.current.data?.current).toBeGreaterThan(listEpoch);
  });
});
