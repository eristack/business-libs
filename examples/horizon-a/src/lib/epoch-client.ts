import type { Backseat } from "@eristack/backseat";
import { createEpochClient, type EpochClient } from "@eristack/epoch/client";

/** Wire epoch HTTP client to an in-process Backseat engine (Horizon A demos/tests). */
export function createHorizonEpochClient(api: Backseat): EpochClient {
  const backseatFetch: typeof fetch = (input, init) =>
    api.fetch(typeof input === "string" ? input : input.toString(), init);

  return createEpochClient({
    baseUrl: "http://backseat.local/api",
    basePath: "/epoch",
    fetch: backseatFetch,
  });
}
