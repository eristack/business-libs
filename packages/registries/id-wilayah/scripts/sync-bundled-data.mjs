#!/usr/bin/env node
/**
 * Build official numeric admin codes from hanifabd/wilayah-indonesia-area IndoArea zip.
 * Run from repo root: node packages/registries/id-wilayah/scripts/sync-bundled-data.mjs
 *
 * Source: https://github.com/hanifabd/wilayah-indonesia-area (April 2024 snapshot).
 * Re-run when refreshing the npm bundle from a newer national snapshot.
 */
import { createWriteStream } from "node:fs";
import { mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { pipeline } from "node:stream/promises";
import { createGunzip, createGzip } from "node:zlib";
import { createReadStream } from "node:fs";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const __dirname = dirname(fileURLToPath(import.meta.url));
const pkgRoot = join(__dirname, "..");
const outDir = join(pkgRoot, "src", "bundled");
const tmpDir = join(pkgRoot, ".sync-tmp");

const ZIP_URL =
  "https://raw.githubusercontent.com/hanifabd/wilayah-indonesia-area/master/data/IndoArea-19-04-2024.zip";

/** @typedef {{ c: string; n: string; k: string; p: string | null }} Row */

function inferRegencyKind(name) {
  const u = name.toUpperCase();
  if (u.includes("KOTA ADM")) return "administrative_city";
  if (u.startsWith("KOTA ") || u.startsWith("KOTA.")) return "city";
  if (u.includes("EX ") && u.includes("RESID")) return "former_residency";
  return "regency";
}

function pad3(seg) {
  return seg.padStart(3, "0");
}

/** @param {Record<string, string>} obj */
function entries(obj) {
  return Object.entries(obj).sort(([a], [b]) => a.localeCompare(b, undefined, { numeric: true }));
}

async function downloadZip(dest) {
  const res = await fetch(ZIP_URL);
  if (!res.ok) throw new Error(`Download failed ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  await writeFile(dest, buf);
}

async function unzip(zipPath, dest) {
  await mkdir(dest, { recursive: true });
  await execFileAsync("unzip", ["-qo", zipPath, "-d", dest]);
}

/**
 * @returns {Promise<Row[]>}
 */
async function buildRows(extractRoot) {
  /** @type {Row[]} */
  const rows = [];
  const provPath = join(extractRoot, "provinsi", "provinsi.json");
  const prov = JSON.parse(await readFile(provPath, "utf8"));

  for (const [pp, name] of entries(prov)) {
    const code = pp.padStart(2, "0");
    rows.push({ c: code, n: name.trim(), k: "province", p: null });
  }

  const kabDir = join(extractRoot, "kabupaten_kota");
  for (const file of await readdir(kabDir)) {
    if (!file.startsWith("kab-") || !file.endsWith(".json")) continue;
    const pp = file.slice(4, -5);
    const provCode = pp.padStart(2, "0");
    const kab = JSON.parse(await readFile(join(kabDir, file), "utf8"));
    for (const [rr, name] of entries(kab)) {
      const code = provCode + rr.padStart(2, "0");
      rows.push({
        c: code,
        n: name.trim(),
        k: inferRegencyKind(name),
        p: provCode,
      });
    }
  }

  const kecDir = join(extractRoot, "kecamatan");
  for (const file of await readdir(kecDir)) {
    if (!file.startsWith("kec-") || !file.endsWith(".json")) continue;
    const parts = file.slice(4, -5).split("-");
    if (parts.length !== 2) continue;
    const [pp, rr] = parts;
    const regCode = pp.padStart(2, "0") + rr.padStart(2, "0");
    const kec = JSON.parse(await readFile(join(kecDir, file), "utf8"));
    for (const [kkk, name] of entries(kec)) {
      const code = regCode + pad3(kkk);
      rows.push({ c: code, n: name.trim(), k: "district", p: regCode });
    }
  }

  const desaDir = join(extractRoot, "kelurahan_desa");
  for (const file of await readdir(desaDir)) {
    if (!file.startsWith("keldesa-") || !file.endsWith(".json")) continue;
    const parts = file.slice(8, -5).split("-");
    if (parts.length !== 3) continue;
    const [pp, rr, kkk] = parts;
    const distCode =
      pp.padStart(2, "0") + rr.padStart(2, "0") + pad3(kkk);
    const desa = JSON.parse(await readFile(join(desaDir, file), "utf8"));
    for (const [vvv, name] of entries(desa)) {
      const code = distCode + pad3(vvv);
      const u = name.toUpperCase();
      const kind =
        u.startsWith("KEL.") || u.startsWith("KELURAHAN") ? "urban_village" : "rural_village";
      rows.push({ c: code, n: name.trim(), k: kind, p: distCode });
    }
  }

  return rows;
}

async function main() {
  await rm(tmpDir, { recursive: true, force: true });
  await mkdir(tmpDir, { recursive: true });
  const zipPath = join(tmpDir, "area.zip");
  console.log("Downloading", ZIP_URL);
  await downloadZip(zipPath);
  const extractRoot = join(tmpDir, "extract");
  await unzip(zipPath, extractRoot);
  const rows = await buildRows(extractRoot);
  await mkdir(outDir, { recursive: true });
  const jsonPath = join(outDir, "official-registry-2024.json");
  await writeFile(jsonPath, JSON.stringify(rows));
  const gzPath = join(outDir, "official-registry-2024.json.gz");
  await pipeline(createReadStream(jsonPath), createGzip(), createWriteStream(gzPath));
  const stats = {
    rows: rows.length,
    provinces: rows.filter((r) => r.k === "province").length,
    regencies: rows.filter((r) =>
      ["regency", "city", "administrative_city", "former_residency"].includes(r.k),
    ).length,
    districts: rows.filter((r) => r.k === "district").length,
    villages: rows.filter((r) =>
      ["urban_village", "rural_village"].includes(r.k),
    ).length,
  };
  console.log(JSON.stringify(stats, null, 2));
  await rm(tmpDir, { recursive: true, force: true });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
