import { createIndexedDbBackseatStore } from "@eristack/backseat/store";

export type CreateIndexedDbAbacContextOptions = {
  dbName?: string;
};

export function createIndexedDbAbacContext(
  options: CreateIndexedDbAbacContextOptions = {},
): {
  backseatStore: ReturnType<typeof createIndexedDbBackseatStore>;
} {
  return {
    backseatStore: createIndexedDbBackseatStore({
      dbName: options.dbName,
    }),
  };
}

export { registerAbacBackseat } from "../register.js";
export type { RegisterAbacBackseatOptions } from "../register.js";
