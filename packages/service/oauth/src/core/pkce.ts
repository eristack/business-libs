import { createHash, randomBytes } from "node:crypto";

export function generateCodeVerifier(byteLength = 32): string {
  return randomBytes(byteLength).toString("base64url");
}

export function codeChallengeS256(codeVerifier: string): string {
  return createHash("sha256").update(codeVerifier).digest("base64url");
}

export function generatePkcePair(): { codeVerifier: string; codeChallenge: string } {
  const codeVerifier = generateCodeVerifier();
  return { codeVerifier, codeChallenge: codeChallengeS256(codeVerifier) };
}
