// AUTO-GENERATED — run pnpm --filter @eristack/ai-knowledge sync
// Do not edit by hand.

import type { KnowledgeCatalog } from "../types.js";

export const catalog = {
  "generatedAt": "2026-08-12T07:44:42.308Z",
  "packages": [
    {
      "name": "@eristack/ai-workflow",
      "version": "0.0.0",
      "description": "Local-first AI workflow for Eristack projects: MCP server, FTS+vector index, backlog/sprint/ADR artifacts — low-token agent tools that do not replace existing editors or Intent",
      "slug": "ai-workflow",
      "adapters": [],
      "skills": [
        {
          "id": "ai-workflow-core",
          "name": "ai-workflow-core",
          "packageName": "@eristack/ai-workflow",
          "description": "Local-first @eristack/ai-workflow: .eristack/workflow backlog/sprints/ADR/summary, FTS+vector index, low-token search discipline. Use when scaffolding AI-native project memory or sprint cadence without replacing Intent, git, or editors.",
          "type": "core",
          "loadCommand": "pnpm dlx @tanstack/intent@latest load @eristack/ai-workflow#ai-workflow-core"
        },
        {
          "id": "ai-workflow-mcp",
          "name": "ai-workflow-mcp",
          "packageName": "@eristack/ai-workflow",
          "description": "Install and use the eristack-workflow MCP server alongside existing MCP tools. Covers Cursor/Claude config, tool inventory, and when to search vs read_chunk. Use when wiring @eristack/ai-workflow into a consumer project.",
          "type": "core",
          "loadCommand": "pnpm dlx @tanstack/intent@latest load @eristack/ai-workflow#ai-workflow-mcp"
        }
      ]
    },
    {
      "name": "@eristack/data-grid",
      "version": "0.1.0",
      "description": "Dynamic list query primitives: multi-field filters, search mode, multi-sort, offset/cursor pagination for Eristack services and capabilities",
      "slug": "data-grid",
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
          "id": "data-grid-adapters",
          "name": "data-grid-adapters",
          "packageName": "@eristack/data-grid",
          "description": "@eristack/data-grid adapters: drizzle executeDrizzleList + columnsFromSource (app owns joins/aggregates; library runs filter/sort/count/page), buildDrizzleQuery, rest createDataGridListAction + {items,pageInfo,query}, express middleware, nest DataGridModule + ParseDataGridPipe, client createDataGridClient, react useDataGridQuery/useDataGridList. Use when wiring list HTTP/SQL/UI shells.",
          "type": "adapter",
          "loadCommand": "pnpm dlx @tanstack/intent@latest load @eristack/data-grid#data-grid-adapters"
        },
        {
          "id": "data-grid-core",
          "name": "data-grid-core",
          "packageName": "@eristack/data-grid",
          "description": "Pure @eristack/data-grid: createDataGrid, parse/serialize JSON search params (TanStack Router–aligned filters/sorts), toSearch/fromSearch, advanced vs search modes, filter ops (eq/contains/in/between/gte/…), multi-sort, offset/cursor pagination, applyInMemory. Use for dynamic list queries without HTTP or Drizzle.",
          "type": "core",
          "loadCommand": "pnpm dlx @tanstack/intent@latest load @eristack/data-grid#data-grid-core"
        }
      ]
    },
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
