// AUTO-GENERATED — run pnpm --filter @eristack/ai-knowledge sync
// Do not edit by hand.

import type { KnowledgeCatalog } from "../types.js";

export const catalog = {
  "generatedAt": "2026-08-12T02:27:39.200Z",
  "packages": [
    {
      "name": "@eristack/doc-number",
      "version": "0.1.0",
      "description": "Document number format, parse, and sequence primitives for Eristack",
      "slug": "doc-number",
      "adapters": [
        "client",
        "drizzle",
        "express",
        "nest",
        "react",
        "rest"
      ],
      "skills": [
        {
          "id": "doc-number-adapters",
          "name": "doc-number-adapters",
          "packageName": "@eristack/doc-number",
          "description": "@eristack/doc-number adapters: drizzle FormatStore + SequenceStore (doc_number_formats / doc_number_sequences), rest format CRUD + preview, express createDocNumberRouter, nest DocNumberModule, client createDocNumberClient, react DocNumberProvider / useDocNumberFormats. Use when persisting formats or wiring format-configuration HTTP/frontend shells; app injects db + docNumber.",
          "type": "adapter",
          "loadCommand": "pnpm dlx @tanstack/intent@latest load @eristack/doc-number#doc-number-adapters"
        },
        {
          "id": "doc-number-core",
          "name": "doc-number-core",
          "packageName": "@eristack/doc-number",
          "description": "Pure @eristack/doc-number: token patterns ({YYYY}/{YY}/{MM}/{DD}/{SEQ:n}), formatDocumentNumber, parseDocumentNumber, createDocNumber, registerFormat, updateFormat, listFormats, getFormatById, next, peekNext, preview, ResetPeriod, FormatStore, SequenceStore, Incrementer, memory stores. Use for document numbers without HTTP or Drizzle.",
          "type": "core",
          "loadCommand": "pnpm dlx @tanstack/intent@latest load @eristack/doc-number#doc-number-core"
        }
      ]
    },
    {
      "name": "@eristack/jwt-auth",
      "version": "0.2.0",
      "description": "Canonical JWT access + refresh-token auth primitives for Eristack",
      "slug": "jwt-auth",
      "adapters": [
        "client",
        "drizzle",
        "express",
        "nest",
        "react",
        "rest"
      ],
      "skills": [
        {
          "id": "jwt-auth-adapters",
          "name": "jwt-auth-adapters",
          "packageName": "@eristack/jwt-auth",
          "description": "@eristack/jwt-auth adapters: drizzle pgsql/mysql/sqlite RefreshTokenStore + CredentialStore (jwt_auth_credentials child of users), headless rest login/ sessions, express createJwtAuthRouter, nest JwtAuthModule JwtAuthGuard, client createJwtAuthClient login, react JwtAuthProvider useJwtAuth. Use when wiring persistence or HTTP/frontend shells.",
          "type": "core",
          "loadCommand": "pnpm dlx @tanstack/intent@latest load @eristack/jwt-auth#jwt-auth-adapters"
        },
        {
          "id": "jwt-auth-core",
          "name": "jwt-auth-core",
          "packageName": "@eristack/jwt-auth",
          "description": "Pure @eristack/jwt-auth token + credentials lifecycle: createJwtAuth, registerCredentials, login, changePassword, issueTokens, verifyAccessToken, refresh rotation, revoke, CredentialStore, RefreshTokenStore, opaque refresh hashes, family reuse detection. Use when implementing JWT access + refresh and optional username/password without HTTP/DB frameworks.",
          "type": "core",
          "loadCommand": "pnpm dlx @tanstack/intent@latest load @eristack/jwt-auth#jwt-auth-core"
        }
      ]
    },
    {
      "name": "@eristack/money",
      "version": "0.2.0",
      "description": "Money primitives for Eristack",
      "slug": "money",
      "adapters": [],
      "skills": [
        {
          "id": "money-amounts",
          "name": "money-amounts",
          "packageName": "@eristack/money",
          "description": "Construct Money with strings or minor units, run same-currency arithmetic, totals (Money.sum/min/max/average), percentages (percentOf/plusPercent/minusPercent), ratios, Discount/Markup/Tax/Percent operators, and compare amounts in @eristack/money. Use when creating prices, taxes, discounts, totals, or when an agent reaches for JS number literals for money.",
          "type": "core",
          "loadCommand": "pnpm dlx @tanstack/intent@latest load @eristack/money#money-amounts"
        },
        {
          "id": "money-ledger",
          "name": "money-ledger",
          "packageName": "@eristack/money",
          "description": "Round at ledger boundaries, allocate without losing cents, convert with app-supplied FX rates, and serialize Money as JSON decimal strings in @eristack/money. Use for invoices, payment splits, multi-currency reporting, Rounding.currencyDefault, allocate, Conversion.of, moneyToJSON.",
          "type": "core",
          "loadCommand": "pnpm dlx @tanstack/intent@latest load @eristack/money#money-ledger"
        }
      ]
    }
  ]
} as KnowledgeCatalog;
