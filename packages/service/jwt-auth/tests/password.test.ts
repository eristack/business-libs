import { scrypt as nodeScryptCallback } from "node:crypto";
import { promisify } from "node:util";
import { describe, expect, it } from "vitest";
import { scrypt } from "@noble/hashes/scrypt";
import { hashPassword, verifyPassword } from "../src/core/password.js";
import { base64UrlToBytes, randomBytes, utf8ToBytes } from "../src/core/bytes.js";

const nodeScrypt = promisify(nodeScryptCallback) as (
  password: string | Buffer,
  salt: string | Buffer,
  keylen: number,
  options: { N: number; r: number; p: number },
) => Promise<Buffer>;

describe("hashPassword / verifyPassword", () => {
  it("round-trips a password hash", async () => {
    const encoded = await hashPassword("password123");
    expect(encoded.startsWith("scrypt$")).toBe(true);
    expect(await verifyPassword("password123", encoded)).toBe(true);
    expect(await verifyPassword("wrong", encoded)).toBe(false);
  });

  it("matches Node crypto.scrypt output for the same parameters", async () => {
    const password = "password123";
    const salt = randomBytes(16);
    const options = { N: 16_384, r: 8, p: 1 };
    const keylen = 64;

    const noble = scrypt(utf8ToBytes(password), salt, {
      ...options,
      dkLen: keylen,
    });
    const node = await nodeScrypt(password, Buffer.from(salt), keylen, options);

    expect(Buffer.from(noble)).toEqual(node);
  });

  it("verifies hashes produced before the isomorphic crypto migration", async () => {
    const password = "password123";
    const salt = randomBytes(16);
    const options = { N: 16_384, r: 8, p: 1 };
    const derived = await nodeScrypt(password, Buffer.from(salt), 64, options);
    const legacy = [
      "scrypt",
      "16384",
      "8",
      "1",
      Buffer.from(salt).toString("base64url"),
      derived.toString("base64url"),
    ].join("$");

    expect(await verifyPassword(password, legacy)).toBe(true);
    expect(await verifyPassword("wrong", legacy)).toBe(false);
  });

  it("rejects malformed encoded hashes", async () => {
    expect(await verifyPassword("pw", "not-a-hash")).toBe(false);
    expect(await verifyPassword("pw", "")).toBe(false);
    expect(
      await verifyPassword(
        "pw",
        "scrypt$16384$8$1$$",
      ),
    ).toBe(false);
    expect(
      await verifyPassword(
        "pw",
        `scrypt$16384$8$1$${Buffer.from("salt").toString("base64url")}$`,
      ),
    ).toBe(false);
  });
});

describe("base64url helpers", () => {
  it("round-trips random bytes", () => {
    const bytes = randomBytes(16);
    const encoded = Buffer.from(bytes).toString("base64url");
    expect(base64UrlToBytes(encoded)).toEqual(bytes);
  });
});
