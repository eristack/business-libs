import { createGunzip } from "node:zlib";
import { createReadStream } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { pipeline } from "node:stream/promises";
import { Writable } from "node:stream";
import {
  createAdminDivisionRegistry,
  type AdminDivisionRegistry,
} from "../core/registry.js";
import type { BundledAdminDivisionRow } from "../core/types.js";

const GZ_NAME = "official-registry-2024.json.gz";

declare const __dirname: string | undefined;

function bundledAssetDir(): string {
  if (typeof __dirname !== "undefined") {
    return __dirname;
  }
  return dirname(fileURLToPath(import.meta.url));
}

let cachedRegistry: AdminDivisionRegistry | null = null;
let cachedRows: BundledAdminDivisionRow[] | null = null;

async function readGzJson(): Promise<BundledAdminDivisionRow[]> {
  if (cachedRows) return cachedRows;
  const gzPath = join(bundledAssetDir(), GZ_NAME);
  const chunks: Buffer[] = [];
  const collector = new Writable({
    write(chunk: Buffer | string, _enc, cb) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
      cb();
    },
  });
  await pipeline(createReadStream(gzPath), createGunzip(), collector);
  const text = Buffer.concat(chunks).toString("utf8");
  cachedRows = JSON.parse(text) as BundledAdminDivisionRow[];
  return cachedRows;
}

/** Load the bundled Apr 2024 national snapshot (~84k villages). Node only. */
export async function loadBundledAdminDivisionRegistry(): Promise<AdminDivisionRegistry> {
  if (cachedRegistry) return cachedRegistry;
  const rows = await readGzJson();
  cachedRegistry = createAdminDivisionRegistry(rows);
  return cachedRegistry;
}

/** Raw bundled rows (custom registries or tree-shaken subsets). Node only. */
export async function loadBundledAdminDivisionRows(): Promise<BundledAdminDivisionRow[]> {
  return readGzJson();
}

export const BUNDLED_ADMIN_DIVISION_SNAPSHOT = "official-registry-2024" as const;
