import { createIndexedDbBackseatStore } from "@eristack/backseat/store";

export type CreateIndexedDbPbacContextOptions = {
  dbName?: string;
};

export function createIndexedDbPbacContext(
  options: CreateIndexedDbPbacContextOptions = {},
): {
  backseatStore: ReturnType<typeof createIndexedDbBackseatStore>;
} {
  return {
    backseatStore: createIndexedDbBackseatStore({
      dbName: options.dbName,
    }),
  };
}

export { registerPbacBackseat } from "../register.js";
export type { RegisterPbacBackseatOptions } from "../register.js";
