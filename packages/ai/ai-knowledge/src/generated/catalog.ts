// AUTO-GENERATED — run pnpm --filter @eristack/ai-knowledge sync
// Do not edit by hand.

import type { KnowledgeCatalog } from "../types.js";

export const catalog = {
  "generatedAt": "2026-08-29T08:46:59.416Z",
  "packages": [
    {
      "name": "@eristack/abac",
      "version": "0.2.2",
      "description": "Attribute-based access control for Eristack: policy functions over subject/resource/environment attributes",
      "slug": "abac",
      "adapters": [
        "backseat",
        "backseat/store",
        "express",
        "nest",
        "react",
        "testing"
      ],
      "skills": [
        {
          "id": "abac-adapters",
          "name": "abac-adapters",
          "packageName": "@eristack/abac",
          "description": "@eristack/abac adapters: express createRequirePolicy, nest AbacModule + AbacGuard + RequirePolicy + AbacContextFactory, react usePolicy. Use when wiring attribute policy checks into HTTP/UI shells.",
          "type": "adapter",
          "loadCommand": "pnpm dlx @tanstack/intent@latest load @eristack/abac#abac-adapters"
        },
        {
          "id": "abac-core",
          "name": "abac-core",
          "packageName": "@eristack/abac",
          "description": "Pure @eristack/abac: createAbac, registerPolicy, evaluate/authorize, attrs helpers — attribute-based policies (algorithms with arguments → boolean). Use for per-user limits and scopes (e.g. max book value) beyond boolean RBAC.",
          "type": "core",
          "loadCommand": "pnpm dlx @tanstack/intent@latest load @eristack/abac#abac-core"
        }
      ]
    },
    {
      "name": "@eristack/ai-dev",
      "version": "0.1.1",
      "description": "Unified agent-first dev tooling for Eristack monorepos: plan (token-minimal), check profiles, sync, compact JSON + MCP",
      "slug": "ai-dev",
      "adapters": [
        "repo"
      ],
      "skills": [
        {
          "id": "ai-dev-core",
          "name": "ai-dev-core",
          "packageName": "@eristack/ai-dev",
          "description": "@eristack/ai-dev unified monorepo tooling: eristack plan (token-minimal), eristack check profiles (catalog/pr/full = CI), sync docs/knowledge, MCP dev_plan/dev_check. Use before ad-hoc pnpm script chains or reading every check doc.",
          "type": "core",
          "loadCommand": "pnpm dlx @tanstack/intent@latest load @eristack/ai-dev#ai-dev-core"
        }
      ]
    },
    {
      "name": "@eristack/ai-ticket-generator",
      "version": "0.1.1",
      "description": "Generate portable maintainer tickets (bugs + suggestions) for every @eristack package — logs, scenario, fix plan, and agent-ready handoff files",
      "slug": "ai-ticket-generator",
      "adapters": [],
      "skills": [
        {
          "id": "ai-ticket-bug",
          "name": "ai-ticket-bug",
          "packageName": "@eristack/ai-ticket-generator",
          "description": "Generate a portable @eristack bug ticket (logs, scenario, repro, fix plan, agent handoff) as a markdown file the user can send to maintainers. Use when a consumer hits a package bug or wants a fixer-upper file for support.",
          "type": "core",
          "loadCommand": "pnpm dlx @tanstack/intent@latest load @eristack/ai-ticket-generator#ai-ticket-bug"
        },
        {
          "id": "ai-ticket-suggest",
          "name": "ai-ticket-suggest",
          "packageName": "@eristack/ai-ticket-generator",
          "description": "Turn a user feature idea into a portable @eristack suggestion ticket with feasibility (possible/partial/unlikely/needs-decision) and an implementation sketch for maintainers/agents. Use when a consumer proposes a change.",
          "type": "core",
          "loadCommand": "pnpm dlx @tanstack/intent@latest load @eristack/ai-ticket-generator#ai-ticket-suggest"
        }
      ]
    },
    {
      "name": "@eristack/ai-workflow",
      "version": "0.1.1",
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
      "name": "@eristack/backseat",
      "version": "0.1.5",
      "description": "Frontend mock backend engine: in-browser REST server with pluggable store, controllers, and TanStack Query hooks",
      "slug": "backseat",
      "adapters": [
        "adapters",
        "react",
        "seeds",
        "store",
        "testing"
      ],
      "skills": [
        {
          "id": "backseat-core",
          "name": "backseat-core",
          "packageName": "@eristack/backseat",
          "description": "@eristack/backseat: frontend-first in-browser REST engine — flexible registerRoute controllers, registerAction, splat paths, IndexedDB store, BackseatDevtools. Memory store for tests only. Agents peek at handlers/snapshots when backend is built later.",
          "type": "core",
          "loadCommand": "pnpm dlx @tanstack/intent@latest load @eristack/backseat#backseat-core"
        }
      ]
    },
    {
      "name": "@eristack/data-grid",
      "version": "0.2.4",
      "description": "Dynamic list query primitives: multi-field filters, search mode, multi-sort, offset/cursor pagination for Eristack services and capabilities",
      "slug": "data-grid",
      "adapters": [
        "backseat",
        "backseat/store",
        "client",
        "drizzle",
        "express",
        "nest",
        "react",
        "rest",
        "testing",
        "zod"
      ],
      "skills": [
        {
          "id": "data-grid-adapters",
          "name": "data-grid-adapters",
          "packageName": "@eristack/data-grid",
          "description": "@eristack/data-grid adapters: drizzle executeDrizzleList + columnsFromSource (app owns joins/aggregates; library runs filter/sort/count/page), buildDrizzleQuery, rest createDataGridListAction + {items,pageInfo,query}, express middleware, nest DataGridModule + ParseDataGridPipe, client createDataGridClient, react useDataGridController (draft/commit filter rows) + useDataGridList. Use when wiring list HTTP/SQL/UI shells.",
          "type": "adapter",
          "loadCommand": "pnpm dlx @tanstack/intent@latest load @eristack/data-grid#data-grid-adapters"
        },
        {
          "id": "data-grid-core",
          "name": "data-grid-core",
          "packageName": "@eristack/data-grid",
          "description": "Pure @eristack/data-grid: createDataGrid, parse/serialize JSON search params (TanStack Router–aligned filters/sorts), decimal/money field types for string amount sort/filter without Number(), toSearch/fromSearch, advanced vs search modes, filter ops, multi-sort, offset/cursor pagination, applyInMemory. Use for dynamic list queries without HTTP or Drizzle.",
          "type": "core",
          "loadCommand": "pnpm dlx @tanstack/intent@latest load @eristack/data-grid#data-grid-core"
        }
      ]
    },
    {
      "name": "@eristack/doc-number",
      "version": "0.3.4",
      "description": "Document number format, parse, and sequence primitives for Eristack",
      "slug": "doc-number",
      "adapters": [
        "backseat",
        "backseat/store",
        "client",
        "drizzle",
        "express",
        "nest",
        "react",
        "rest",
        "testing",
        "zod"
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
      "name": "@eristack/doc-transitions",
      "version": "0.1.0",
      "description": "Preset ERP document status graphs for @eristack/pbac documents.transitions()",
      "slug": "doc-transitions",
      "adapters": [],
      "skills": [
        {
          "id": "doc-transitions-core",
          "name": "doc-transitions-core",
          "packageName": "@eristack/doc-transitions",
          "description": "@eristack/doc-transitions preset status graphs (publication, decision, journal, lock, outstanding) for pbac documents.transitions(). Use instead of copy-paste status tables when wiring ERP document PATCH actions.",
          "type": "core",
          "loadCommand": "pnpm dlx @tanstack/intent@latest load @eristack/doc-transitions#doc-transitions-core"
        }
      ]
    },
    {
      "name": "@eristack/epoch",
      "version": "0.1.2",
      "description": "Headless data-version epochs for cache invalidation: compare client epoch vs server, bump on mutation, Drizzle default",
      "slug": "epoch",
      "adapters": [
        "backseat",
        "backseat/store",
        "client",
        "drizzle",
        "express",
        "logger",
        "nest",
        "react",
        "rest",
        "testing",
        "zod"
      ],
      "skills": [
        {
          "id": "epoch-adapters",
          "name": "epoch-adapters",
          "packageName": "@eristack/epoch",
          "description": "Wire @eristack/epoch: Drizzle createEpochTables/createDrizzleEpochStore, Express createEpochRouter, Nest EpochModule, createEpochClient, useEpochCachePolicy React hook, registerEpochBackseat for prototypes.",
          "type": "adapters",
          "loadCommand": "pnpm dlx @tanstack/intent@latest load @eristack/epoch#epoch-adapters"
        },
        {
          "id": "epoch-core",
          "name": "epoch-core",
          "packageName": "@eristack/epoch",
          "description": "@eristack/epoch headless data-version counters: current/bump per scope, compareEpochs use-cache vs refetch, resolveCachePolicy, StaleEpochError. Drizzle default; memory store tests only.",
          "type": "core",
          "loadCommand": "pnpm dlx @tanstack/intent@latest load @eristack/epoch#epoch-core"
        }
      ]
    },
    {
      "name": "@eristack/financial-ledger",
      "version": "0.2.3",
      "description": "Accounting ledger on hash-chained-ledger keyed by accountId, amounts via @eristack/money",
      "slug": "financial-ledger",
      "adapters": [
        "backseat",
        "backseat/store",
        "drizzle",
        "testing"
      ],
      "skills": [
        {
          "id": "financial-ledger-adapters",
          "name": "financial-ledger-adapters",
          "packageName": "@eristack/financial-ledger",
          "description": "@eristack/financial-ledger/drizzle: createHashChainedLedgerTables + createDrizzleLedgerStore for durable GL chains on Postgres (Vercel).",
          "type": "adapter",
          "loadCommand": "pnpm dlx @tanstack/intent@latest load @eristack/financial-ledger#financial-ledger-adapters"
        },
        {
          "id": "financial-ledger-core",
          "name": "financial-ledger-core",
          "packageName": "@eristack/financial-ledger",
          "description": "@eristack/financial-ledger: createFinancialLedger post/list/snapshot/verify by accountId+currency with @eristack/money. Default store is Drizzle — memory is tests only.",
          "type": "core",
          "loadCommand": "pnpm dlx @tanstack/intent@latest load @eristack/financial-ledger#financial-ledger-core"
        }
      ]
    },
    {
      "name": "@eristack/hash-chained-ledger",
      "version": "0.1.2",
      "description": "Append-only hash-chained ledger primitive: opening/in/out/adjustment/closing, type refs, chain verify and tamper detection",
      "slug": "hash-chained-ledger",
      "adapters": [
        "backseat",
        "backseat/store",
        "drizzle",
        "testing"
      ],
      "skills": [
        {
          "id": "hash-chained-ledger-adapters",
          "name": "hash-chained-ledger-adapters",
          "packageName": "@eristack/hash-chained-ledger",
          "description": "@eristack/hash-chained-ledger/drizzle: createHashChainedLedgerTables + createDrizzleLedgerStore. Use for durable chains on Postgres (Vercel).",
          "type": "adapter",
          "loadCommand": "pnpm dlx @tanstack/intent@latest load @eristack/hash-chained-ledger#hash-chained-ledger-adapters"
        },
        {
          "id": "hash-chained-ledger-core",
          "name": "hash-chained-ledger-core",
          "packageName": "@eristack/hash-chained-ledger",
          "description": "Pure @eristack/hash-chained-ledger: createHashChainedLedger with Drizzle store by default, append/snapshot/verify, balance equation, SHA-256 chain. Memory store is unit tests only.",
          "type": "core",
          "loadCommand": "pnpm dlx @tanstack/intent@latest load @eristack/hash-chained-ledger#hash-chained-ledger-core"
        }
      ]
    },
    {
      "name": "@eristack/jwt-auth",
      "version": "0.4.4",
      "description": "Canonical JWT access + refresh-token auth primitives for Eristack",
      "slug": "jwt-auth",
      "adapters": [
        "backseat",
        "backseat/store",
        "client",
        "drizzle",
        "express",
        "nest",
        "react",
        "rest",
        "testing",
        "zod"
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
      "name": "@eristack/logger",
      "version": "0.1.1",
      "description": "JSON-lines structured logger with request context and Express/Nest adapters",
      "slug": "logger",
      "adapters": [
        "express",
        "nest"
      ],
      "skills": [
        {
          "id": "logger-core",
          "name": "logger-core",
          "packageName": "@eristack/logger",
          "description": "@eristack/logger: JSON-lines structured logging with requestId/userId/tenantId context, debug/info/warn/error levels, Express middleware and Nest interceptor.",
          "type": "core",
          "loadCommand": "pnpm dlx @tanstack/intent@latest load @eristack/logger#logger-core"
        }
      ]
    },
    {
      "name": "@eristack/money",
      "version": "0.3.2",
      "description": "Money primitives for Eristack",
      "slug": "money",
      "adapters": [
        "client",
        "drizzle",
        "express",
        "nest",
        "react",
        "rest",
        "zod"
      ],
      "skills": [
        {
          "id": "money-adapters",
          "name": "money-adapters",
          "packageName": "@eristack/money",
          "description": "Persist and wire @eristack/money: Drizzle SQL columns, REST wire codec, Zod 4 schemas, Express/Nest HTTP, client revive, React form helpers including createAmountOnlyFieldValidators for flat amount strings + shared row currency (QUPS lines). Use when storing prices in SQL, validating API bodies, or mapping flat DB columns vs MoneyJSON.",
          "type": "adapter",
          "loadCommand": "pnpm dlx @tanstack/intent@latest load @eristack/money#money-adapters"
        },
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
    },
    {
      "name": "@eristack/multitab",
      "version": "0.2.2",
      "description": "Headless multi-tab workspace for React ERP screens — document tabs, state preservation, Router sync",
      "slug": "multitab",
      "adapters": [
        "react",
        "react/tanstack"
      ],
      "skills": [
        {
          "id": "multitab-core",
          "name": "multitab-core",
          "packageName": "@eristack/multitab",
          "description": "@eristack/multitab: headless multi-tab workspace for React ERP screens — tab model, closeGuard, TanStack Router sync. UI chrome stays in the app.",
          "type": "core",
          "loadCommand": "pnpm dlx @tanstack/intent@latest load @eristack/multitab#multitab-core"
        }
      ]
    },
    {
      "name": "@eristack/opinion",
      "version": "0.1.0",
      "description": "Opinionated ERP HTTP route table: document CRUD + PATCH /:id/:action transitions",
      "slug": "opinion",
      "adapters": [
        "express",
        "nest",
        "openapi"
      ],
      "skills": [
        {
          "id": "opinion-core",
          "name": "opinion-core",
          "packageName": "@eristack/opinion",
          "description": "@eristack/opinion ERP HTTP route table on @eristack/rest: options, data-grid, CRUD, PATCH /:id/:action for pbac/doc-transitions. Use when scaffolding document APIs instead of inventing paths per app.",
          "type": "core",
          "loadCommand": "pnpm dlx @tanstack/intent@latest load @eristack/opinion#opinion-core"
        }
      ]
    },
    {
      "name": "@eristack/pbac",
      "version": "0.2.2",
      "description": "Policy-based (software) access control for Eristack: business document rules that return true or false",
      "slug": "pbac",
      "adapters": [
        "backseat",
        "backseat/store",
        "express",
        "nest",
        "react",
        "testing"
      ],
      "skills": [
        {
          "id": "pbac-adapters",
          "name": "pbac-adapters",
          "packageName": "@eristack/pbac",
          "description": "@eristack/pbac adapters: express createRequireBusinessPolicy (409 on deny), nest PbacModule + PbacGuard + RequireBusinessPolicy, react useBusinessPolicy. Use when wiring document software policies into HTTP/UI shells.",
          "type": "adapter",
          "loadCommand": "pnpm dlx @tanstack/intent@latest load @eristack/pbac#pbac-adapters"
        },
        {
          "id": "pbac-core",
          "name": "pbac-core",
          "packageName": "@eristack/pbac",
          "description": "Pure @eristack/pbac: createPbac, registerPolicy, check/authorize, documents helpers — software/business policies over document state (usually not per-user). Use for rules like PO outstanding must be > 0 before goods receipt.",
          "type": "core",
          "loadCommand": "pnpm dlx @tanstack/intent@latest load @eristack/pbac#pbac-core"
        }
      ]
    },
    {
      "name": "@eristack/qups",
      "version": "0.3.3",
      "description": "Quantity / unit price / subtotal (QUPS) with 2-of-3 sources of truth, plus modifiers and tax — business line pricing on @eristack/money",
      "slug": "qups",
      "adapters": [
        "backseat",
        "backseat/store",
        "drizzle",
        "testing"
      ],
      "skills": [
        {
          "id": "qups-adapters",
          "name": "qups-adapters",
          "packageName": "@eristack/qups",
          "description": "Optional @eristack/qups/drizzle: qupsLineColumns injected into app detail tables; withQupsColumns from calculateLine for inserts. Profile/line stores only if you need a field catalog — everyday form/BE math uses calculateLine.",
          "type": "adapter",
          "loadCommand": "pnpm dlx @tanstack/intent@latest load @eristack/qups#qups-adapters"
        },
        {
          "id": "qups-core",
          "name": "qups-core",
          "packageName": "@eristack/qups",
          "description": "Pure @eristack/qups business calculator: calculateLine / patchLine (plain strings for TanStack Form + BE), Qups 2-of-3 SoT, QUPS_TRUTH_MODES, isQupsTruthMode, PricingLine, modifiers, tax. Prefer calculateLine over inventing float qty/price math in UI or SQL.",
          "type": "core",
          "loadCommand": "pnpm dlx @tanstack/intent@latest load @eristack/qups#qups-core"
        },
        {
          "id": "qups-line",
          "name": "qups-line",
          "packageName": "@eristack/qups",
          "description": "@eristack/qups calculateLine/patchLine/withQupsColumns for form recalculation and BE insert; PricingLine when you already have Money. Use for invoice/order lines in the business layer — not float math in React.",
          "type": "core",
          "loadCommand": "pnpm dlx @tanstack/intent@latest load @eristack/qups#qups-line"
        }
      ]
    },
    {
      "name": "@eristack/rbac",
      "version": "0.2.2",
      "description": "Role-based access control for Eristack: subjects, roles, and boolean permissions",
      "slug": "rbac",
      "adapters": [
        "backseat",
        "backseat/store",
        "drizzle",
        "express",
        "nest",
        "react",
        "testing"
      ],
      "skills": [
        {
          "id": "rbac-adapters",
          "name": "rbac-adapters",
          "packageName": "@eristack/rbac",
          "description": "@eristack/rbac adapters: drizzle createRbacTables + createDrizzleRbacStore (pgsql/mysql/sqlite), express createRequirePermission, nest RbacModule + RbacGuard + RequirePermission, react useCan. Use when wiring RBAC persistence or HTTP/UI shells.",
          "type": "adapter",
          "loadCommand": "pnpm dlx @tanstack/intent@latest load @eristack/rbac#rbac-adapters"
        },
        {
          "id": "rbac-core",
          "name": "rbac-core",
          "packageName": "@eristack/rbac",
          "description": "Pure @eristack/rbac: createRbac, definePermission, defineRole, assignRole, grantPermission, can/canAny/canAll/authorize — boolean role-based permissions hanging off app subjects. Use for who-can-do-what without attributes or document policies.",
          "type": "core",
          "loadCommand": "pnpm dlx @tanstack/intent@latest load @eristack/rbac#rbac-core"
        }
      ]
    },
    {
      "name": "@eristack/rest",
      "version": "0.1.1",
      "description": "Declarative REST route definitions with Express and Nest mounting and OpenAPI 3.1 emit",
      "slug": "rest",
      "adapters": [
        "express",
        "nest"
      ],
      "skills": [
        {
          "id": "rest-core",
          "name": "rest-core",
          "packageName": "@eristack/rest",
          "description": "@eristack/rest: declarative REST route definitions, Express/Nest mounting, minimal OpenAPI 3.1 emit. Pair with jwt-auth and data-grid in apps.",
          "type": "core",
          "loadCommand": "pnpm dlx @tanstack/intent@latest load @eristack/rest#rest-core"
        }
      ]
    },
    {
      "name": "@eristack/stock-movement",
      "version": "0.1.2",
      "description": "Inventory quantity ledger on hash-chained-ledger: locationId, lotId, composable locations, snapshots, tamper checks",
      "slug": "stock-movement",
      "adapters": [
        "backseat",
        "backseat/store",
        "drizzle",
        "testing"
      ],
      "skills": [
        {
          "id": "stock-movement-adapters",
          "name": "stock-movement-adapters",
          "packageName": "@eristack/stock-movement",
          "description": "@eristack/stock-movement/drizzle: re-exports createHashChainedLedgerTables + createDrizzleLedgerStore for Postgres on Vercel. Use as the app default store.",
          "type": "adapter",
          "loadCommand": "pnpm dlx @tanstack/intent@latest load @eristack/stock-movement#stock-movement-adapters"
        },
        {
          "id": "stock-movement-core",
          "name": "stock-movement-core",
          "packageName": "@eristack/stock-movement",
          "description": "@eristack/stock-movement: locationIdFromParts, createStockMovement append/snapshot/verify on hash-chained qty ledger (lotId, optional ownerId). Default store is Drizzle — never createMemoryLedgerStore in apps.",
          "type": "core",
          "loadCommand": "pnpm dlx @tanstack/intent@latest load @eristack/stock-movement#stock-movement-core"
        }
      ]
    },
    {
      "name": "@eristack/timestamp",
      "version": "0.1.1",
      "description": "Business timestamps: UTC instants for facts, wall-clock for schedules (DST-safe)",
      "slug": "timestamp",
      "adapters": [
        "client",
        "drizzle",
        "express",
        "nest",
        "react",
        "rest",
        "zod"
      ],
      "skills": [
        {
          "id": "timestamp-adapters",
          "name": "timestamp-adapters",
          "packageName": "@eristack/timestamp",
          "description": "@eristack/timestamp adapters (mirror money): Drizzle SQL columns, REST wire codec, Zod 4, Express/Nest HTTP, client revive, React form helpers. Use when persisting instants or wall times in SQL or validating API bodies.",
          "type": "adapter",
          "loadCommand": "pnpm dlx @tanstack/intent@latest load @eristack/timestamp#timestamp-adapters"
        },
        {
          "id": "timestamp-core",
          "name": "timestamp-core",
          "packageName": "@eristack/timestamp",
          "description": "Business timestamps with @eristack/timestamp: instant mode (UTC facts + IANA zone for local dates) and wall mode (local intent, DST-safe schedules). Use for transaction_date, posted_at, due_at, appointments — not raw Date timezone math.",
          "type": "core",
          "loadCommand": "pnpm dlx @tanstack/intent@latest load @eristack/timestamp#timestamp-core"
        }
      ]
    },
    {
      "name": "@eristack/valuations",
      "version": "0.2.3",
      "description": "Product/lot cost valuation: FIFO, LIFO, FEFO, moving/weighted average, standard cost, specific ID, HIFO/LOFO — with hash-chained cost ledger",
      "slug": "valuations",
      "adapters": [
        "backseat",
        "backseat/store",
        "drizzle",
        "testing"
      ],
      "skills": [
        {
          "id": "valuations-adapters",
          "name": "valuations-adapters",
          "packageName": "@eristack/valuations",
          "description": "@eristack/valuations/drizzle: createHashChainedLedgerTables + createDrizzleLedgerStore + createValuationLayerTables + createDrizzleLayerStore. Both stores required for production engines on Postgres (Vercel).",
          "type": "adapter",
          "loadCommand": "pnpm dlx @tanstack/intent@latest load @eristack/valuations#valuations-adapters"
        },
        {
          "id": "valuations-core",
          "name": "valuations-core",
          "packageName": "@eristack/valuations",
          "description": "@eristack/valuations: FIFO/LIFO/FEFO/HIFO/LOFO/movingAverage/weightedAverage/ standardCost/specificIdentification with dual qty/value hash chains. Default stores are Drizzle ledger + Drizzle layers — memory is tests only.",
          "type": "core",
          "loadCommand": "pnpm dlx @tanstack/intent@latest load @eristack/valuations#valuations-core"
        }
      ]
    }
  ]
} as KnowledgeCatalog;
