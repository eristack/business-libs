// AUTO-GENERATED from knowledge/recipes.yaml — run pnpm --filter @eristack/ai-knowledge sync
// Do not edit by hand.

import type { Recipe } from "../types.js";

export const recipes = [
  {
    "id": "money-amounts",
    "title": "Prices, tax, discounts, and totals",
    "priority": 10,
    "triggers": [
      "price",
      "prices",
      "money",
      "currency",
      "tax",
      "discount",
      "discounts",
      "markup",
      "percent",
      "percentage",
      "totals",
      "subtotal",
      "amount",
      "amounts"
    ],
    "rationale": "Use @eristack/money for immutable currency-safe amounts. Never use JS number literals for money — prefer Money.of(\"19.99\", \"USD\").",
    "packages": [
      {
        "name": "@eristack/money",
        "skills": [
          "money-amounts"
        ],
        "role": "primary"
      }
    ]
  },
  {
    "id": "money-ledger",
    "title": "Invoices, payment splits, FX, and ledger rounding",
    "priority": 20,
    "triggers": [
      "invoice",
      "invoices",
      "ledger",
      "allocate",
      "allocation",
      "split",
      "splits",
      "payment split",
      "fx",
      "exchange rate",
      "multi-currency",
      "rounding",
      "serialize money"
    ],
    "rationale": "Round at ledger boundaries, allocate without losing cents, convert with app-supplied FX rates, and serialize amounts as decimal strings. For SQL columns and HTTP validation load money-adapters (drizzle.md / rest.md / zod.md).",
    "packages": [
      {
        "name": "@eristack/money",
        "skills": [
          "money-ledger",
          "money-amounts"
        ],
        "role": "primary"
      }
    ]
  },
  {
    "id": "money-persist",
    "title": "Store money in SQL and validate API bodies",
    "priority": 18,
    "triggers": [
      "store money",
      "persist money",
      "drizzle money",
      "money column",
      "filter by amount",
      "sort price",
      "money schema",
      "zod money"
    ],
    "rationale": "Use @eristack/money/drizzle (docs/drizzle.md) for SQL columns; ./rest or ./zod for wire MoneyJSON; ./express or ./nest for HTTP. Hub: docs/adapters.md.",
    "packages": [
      {
        "name": "@eristack/money",
        "skills": [
          "money-adapters",
          "money-ledger"
        ],
        "role": "primary"
      }
    ]
  },
  {
    "id": "timestamp-instant",
    "title": "Transaction dates and posted-at times",
    "priority": 14,
    "triggers": [
      "transaction date",
      "transaction_date",
      "posted at",
      "posted_at",
      "occurred at",
      "occurred_at",
      "business date",
      "posting date"
    ],
    "rationale": "Use @eristack/timestamp instant mode: UTC instant + IANA timezone for local transaction_date labels. Not raw Date or server timezone.",
    "packages": [
      {
        "name": "@eristack/timestamp",
        "skills": [
          "timestamp-core"
        ],
        "role": "primary"
      }
    ]
  },
  {
    "id": "timestamp-wall",
    "title": "Due dates, appointments, and local schedules",
    "priority": 15,
    "triggers": [
      "due date",
      "due_at",
      "scheduled",
      "scheduled at",
      "appointment",
      "local midnight",
      "dst",
      "timezone schedule"
    ],
    "rationale": "Use @eristack/timestamp wall mode for local wall-clock intent (DST-safe). Convert to UTC only via wallToInstantOnce for single occurrences.",
    "packages": [
      {
        "name": "@eristack/timestamp",
        "skills": [
          "timestamp-core"
        ],
        "role": "primary"
      }
    ]
  },
  {
    "id": "timestamp-persist",
    "title": "Store timestamps in SQL and validate API bodies",
    "priority": 17,
    "triggers": [
      "store timestamp",
      "persist timestamp",
      "drizzle timestamp",
      "timestamptz",
      "posted_at column",
      "due_at column",
      "timestamp schema",
      "zod timestamp",
      "parse postedat"
    ],
    "rationale": "Use @eristack/timestamp/drizzle (docs/drizzle.md) for instant/wall SQL columns; ./rest or ./zod for TimestampJSON; ./express or ./nest for HTTP. Hub: docs/adapters.md.",
    "packages": [
      {
        "name": "@eristack/timestamp",
        "skills": [
          "timestamp-adapters",
          "timestamp-core"
        ],
        "role": "primary"
      }
    ]
  },
  {
    "id": "line-pricing-qups",
    "title": "Line quantity, unit price, discounts, and tax",
    "priority": 12,
    "triggers": [
      "qups",
      "quantity",
      "unit price",
      "subtotal",
      "line total",
      "line discount",
      "surcharge",
      "discount percent",
      "goods receipt line",
      "order line",
      "invoice line",
      "truth mode",
      "source of truth",
      "qups truth",
      "amount only",
      "flat amount",
      "shared currency line",
      "applycellpatch",
      "cell patch",
      "spreadsheet cell edit"
    ],
    "rationale": "Use @eristack/qups calculateLine/patchLine for quantity/unit-price/subtotal (exact ratio when UP+S), modifiers, and tax — same math in TanStack Form and on the BE. Import QUPS_TRUTH_MODES and isQupsTruthMode — do not copy the three truth strings; qupsRolesFor(truth) for required SoT fields. Flat amount + row currency: createAmountOnlyFieldValidators from @eristack/money/react (not nested MoneyJSON). Inject qupsLineColumns into detail tables; withQupsColumns for inserts. See qups stores.md + money drizzle.md.",
    "packages": [
      {
        "name": "@eristack/qups",
        "skills": [
          "qups-core",
          "qups-line",
          "qups-adapters"
        ],
        "role": "primary"
      },
      {
        "name": "@eristack/money",
        "skills": [
          "money-amounts",
          "money-ledger",
          "money-adapters"
        ],
        "role": "supporting"
      }
    ]
  },
  {
    "id": "jwt-auth-sessions",
    "title": "Login, JWT access, and refresh sessions",
    "priority": 10,
    "triggers": [
      "login",
      "logout",
      "auth",
      "authentication",
      "jwt",
      "access token",
      "refresh token",
      "session",
      "sessions",
      "password",
      "credentials",
      "sign in",
      "sign-in"
    ],
    "rationale": "Use @eristack/jwt-auth for JWT access + opaque refresh with rotation. Credentials are a child of your app users table — do not invent a second users model.",
    "packages": [
      {
        "name": "@eristack/jwt-auth",
        "skills": [
          "jwt-auth-core"
        ],
        "role": "primary"
      }
    ]
  },
  {
    "id": "jwt-auth-adapters",
    "title": "Wire auth to Drizzle, HTTP, and React",
    "priority": 30,
    "triggers": [
      "auth adapter",
      "auth express",
      "auth nest",
      "auth drizzle",
      "auth react",
      "jwt router",
      "require auth",
      "auth guard"
    ],
    "rationale": "Persist refresh tokens and credentials with Drizzle; expose headless REST/Express/Nest/client/React shells. Prefer examples/* patterns.",
    "packages": [
      {
        "name": "@eristack/jwt-auth",
        "skills": [
          "jwt-auth-adapters",
          "jwt-auth-core"
        ],
        "role": "primary"
      }
    ]
  },
  {
    "id": "doc-number-sequences",
    "title": "Document and invoice numbers",
    "priority": 10,
    "triggers": [
      "document number",
      "document numbers",
      "doc number",
      "invoice number",
      "invoice numbers",
      "sequential number",
      "sequence",
      "sequences",
      "number format",
      "period reset",
      "yearly reset"
    ],
    "rationale": "Use @eristack/doc-number for token patterns ({YYYY}/{SEQ:n}), period resets, and atomic sequence allocation.",
    "packages": [
      {
        "name": "@eristack/doc-number",
        "skills": [
          "doc-number-core"
        ],
        "role": "primary"
      }
    ]
  },
  {
    "id": "doc-number-adapters",
    "title": "Persist and configure document-number formats",
    "priority": 30,
    "triggers": [
      "format store",
      "doc number adapter",
      "doc number express",
      "doc number nest",
      "doc number react",
      "format crud"
    ],
    "rationale": "Drizzle FormatStore/SequenceStore plus REST/Express/Nest/client/React format-config shells. App injects db + createDocNumber instance.",
    "packages": [
      {
        "name": "@eristack/doc-number",
        "skills": [
          "doc-number-adapters",
          "doc-number-core"
        ],
        "role": "primary"
      }
    ]
  },
  {
    "id": "data-grid-lists",
    "title": "Dynamic list filters, search, sort, and pagination",
    "priority": 10,
    "triggers": [
      "data grid",
      "datagrid",
      "table filter",
      "table filters",
      "list filter",
      "advanced filter",
      "search string",
      "multi sort",
      "pagination",
      "offset pagination",
      "cursor pagination",
      "query string filter",
      "sort price",
      "filter price",
      "decimal column",
      "money column",
      "unit price list",
      "comparedecimalstrings",
      "wall date filter",
      "transaction_date filter",
      "comparewallvalues",
      "decimal string"
    ],
    "rationale": "Use @eristack/data-grid for schema-aware list queries. For decimal money columns (unitPrice, amounts as strings) set schema type decimal or money — applyInMemory sort/filter without Number(). Use type number only for true numeric columns (qty counts). Prefer advanced filters and search mode as separate modes.",
    "packages": [
      {
        "name": "@eristack/data-grid",
        "skills": [
          "data-grid-core",
          "data-grid-adapters"
        ],
        "role": "primary"
      }
    ]
  },
  {
    "id": "erp-app-core",
    "title": "ERP-ish app with auth, money, and numbering",
    "priority": 5,
    "triggers": [
      "erp",
      "business app",
      "invoicing app",
      "billing app",
      "commerce backend",
      "order management"
    ],
    "rationale": "Prefer the Eristack stack first: jwt-auth for sessions, money for amounts, doc-number for sequential documents, data-grid for list queries. Load core skills before adapters.",
    "packages": [
      {
        "name": "@eristack/jwt-auth",
        "skills": [
          "jwt-auth-core",
          "jwt-auth-adapters"
        ],
        "role": "primary"
      },
      {
        "name": "@eristack/money",
        "skills": [
          "money-amounts",
          "money-ledger"
        ],
        "role": "primary"
      },
      {
        "name": "@eristack/doc-number",
        "skills": [
          "doc-number-core",
          "doc-number-adapters"
        ],
        "role": "primary"
      },
      {
        "name": "@eristack/data-grid",
        "skills": [
          "data-grid-core"
        ],
        "role": "supporting"
      }
    ]
  },
  {
    "id": "epoch-cache-invalidation",
    "title": "Data-version epochs for cache invalidation",
    "priority": 14,
    "triggers": [
      "cache invalidation",
      "stale cache",
      "refetch data",
      "use cache",
      "data version",
      "epoch",
      "optimistic cache",
      "tanstack query invalidate",
      "bumpmany"
    ],
    "rationale": "Use @eristack/epoch for headless per-scope version counters: bump after mutations, resolveCachePolicy returns use-cache vs refetch for TanStack Query. Drizzle default; client/react/express/backseat adapters. Read docs/getting-started.md only.",
    "packages": [
      {
        "name": "@eristack/epoch",
        "skills": [
          "epoch-core",
          "epoch-adapters"
        ],
        "role": "primary"
      }
    ]
  },
  {
    "id": "eristack-upgrade",
    "title": "Upgrade @eristack dependencies",
    "priority": 6,
    "triggers": [
      "upgrade eristack",
      "bump eristack",
      "update @eristack",
      "new version",
      "changelog",
      "outdated packages",
      "what changed",
      "migration guide",
      "semver peer"
    ],
    "rationale": "Consumer upgrades: load @eristack/ai-knowledge#upgrading-eristack and read knowledge/upgrading.md only (full Backseat matrix, peers, Changesets). pnpm outdated '@eristack/*', site /{slug}/changelog. Do not open per-package docs/backseat.md for upgrade scope.",
    "packages": [
      {
        "name": "@eristack/backseat",
        "skills": [
          "backseat-core"
        ],
        "role": "primary"
      }
    ]
  },
  {
    "id": "backseat-mock-backend",
    "title": "Frontend mock REST backend for prototypes",
    "priority": 8,
    "triggers": [
      "mock api",
      "fake backend",
      "frontend backend",
      "prototype api",
      "storybook api",
      "msw alternative",
      "json-server browser",
      "in-browser api",
      "backseat",
      "indexeddb api",
      "store atomic",
      "atomic transaction backseat",
      "listroutes"
    ],
    "rationale": "Browser prototypes: load @eristack/ai-knowledge#upgrading-eristack and read knowledge/upgrading.md §3 only (full spine matrix, bootstrap, peers). @eristack/backseat engine + eleven ./backseat adapters. Optional peer ^0.1.0. Not production — Drizzle + HTTP for real apps.",
    "packages": [
      {
        "name": "@eristack/backseat",
        "skills": [
          "backseat-core"
        ],
        "role": "primary"
      },
      {
        "name": "@eristack/jwt-auth",
        "skills": [
          "jwt-auth-adapters"
        ],
        "role": "supporting"
      },
      {
        "name": "@eristack/doc-number",
        "skills": [
          "doc-number-adapters"
        ],
        "role": "supporting"
      }
    ]
  },
  {
    "id": "backseat-then-backend",
    "title": "Backseat-first ERP mockup, then derive backend",
    "priority": 7,
    "triggers": [
      "backseat first",
      "mockup then backend",
      "derive backend",
      "horizon a",
      "horizon b",
      "job order erp",
      "cost sheet erp",
      "forwarding erp",
      "document erp mockup",
      "service erp prototype",
      "erp mockup",
      "clickable prototype erp"
    ],
    "rationale": "Document/cost-sheet ERPs: load @eristack/ai-knowledge#backseat-then-backend and read knowledge/backseat-then-backend.md only. Horizon A — Backseat + qups + money + doc-number + data-grid wall lists + rbac/abac/pbac + epoch. Horizon B — same paths on Drizzle/Express (upgrading-eristack §3). Do not default to stock-movement, valuations, or financial-ledger for job/invoice products.",
    "canonicalSkills": [
      "@eristack/ai-knowledge#backseat-then-backend"
    ],
    "packages": [
      {
        "name": "@eristack/backseat",
        "skills": [
          "backseat-core"
        ],
        "role": "primary"
      },
      {
        "name": "@eristack/qups",
        "skills": [
          "qups-line"
        ],
        "role": "supporting"
      },
      {
        "name": "@eristack/data-grid",
        "skills": [
          "data-grid-core"
        ],
        "role": "supporting"
      },
      {
        "name": "@eristack/jwt-auth",
        "skills": [
          "jwt-auth-adapters"
        ],
        "role": "supporting"
      }
    ]
  },
  {
    "id": "document-lines-erp",
    "title": "Document-with-lines ERP (job, cost sheet, invoice)",
    "priority": 7,
    "triggers": [
      "document with lines",
      "document lines erp",
      "job order",
      "cost sheet",
      "forwarding",
      "freight",
      "shipment",
      "bill of lading",
      "commercial invoice",
      "service erp",
      "logistics erp",
      "partner master"
    ],
    "rationale": "Header + QUPS lines products: load @eristack/ai-knowledge#document-lines-erp and read knowledge/document-lines-erp.md only. qups + money + doc-number + data-grid + pbac + backseat — not stock-movement/valuations/financial-ledger. Partner/product masters app-owned — do not invent @eristack/feature-* packages.",
    "canonicalSkills": [
      "@eristack/ai-knowledge#document-lines-erp"
    ],
    "packages": [
      {
        "name": "@eristack/qups",
        "skills": [
          "qups-line"
        ],
        "role": "primary"
      },
      {
        "name": "@eristack/pbac",
        "skills": [
          "pbac-core"
        ],
        "role": "primary"
      },
      {
        "name": "@eristack/doc-number",
        "skills": [
          "doc-number-core"
        ],
        "role": "supporting"
      },
      {
        "name": "@eristack/data-grid",
        "skills": [
          "data-grid-core"
        ],
        "role": "supporting"
      },
      {
        "name": "@eristack/backseat",
        "skills": [
          "backseat-core"
        ],
        "role": "supporting"
      }
    ]
  },
  {
    "id": "optimistic-document-version",
    "title": "Optimistic document version (expectedVersion)",
    "priority": 10,
    "triggers": [
      "optimistic locking",
      "expected version",
      "conflict version",
      "concurrent edit",
      "document version",
      "write conflict",
      "409 version"
    ],
    "rationale": "ERP aggregates: load @eristack/ai-knowledge#optimistic-document-version and read knowledge/optimistic-document-version.md. version + expectedVersion on PATCH; 409 CONFLICT_VERSION via @eristack/backseat jsonError — distinct from epoch.",
    "canonicalSkills": [
      "@eristack/ai-knowledge#optimistic-document-version"
    ],
    "packages": [
      {
        "name": "@eristack/backseat",
        "skills": [
          "backseat-core"
        ],
        "role": "primary"
      }
    ]
  },
  {
    "id": "http-errors",
    "title": "HTTP 409 error envelope (version, policy, epoch)",
    "priority": 11,
    "triggers": [
      "409",
      "conflict version",
      "policy denied",
      "stale epoch",
      "json error",
      "error envelope",
      "version conflict",
      "business policy denied"
    ],
    "rationale": "Unified JSON error canon: CONFLICT_VERSION, POLICY_DENIED, BUSINESS_POLICY_DENIED, STALE_EPOCH. Load @eristack/ai-knowledge#http-errors and knowledge/http-errors.md. Backseat jsonError/versionConflict; Express mapDomainError; distinct from epoch vs document version.",
    "canonicalSkills": [
      "@eristack/ai-knowledge#http-errors"
    ],
    "packages": [
      {
        "name": "@eristack/backseat",
        "skills": [
          "backseat-core"
        ],
        "role": "primary"
      },
      {
        "name": "@eristack/epoch",
        "skills": [
          "epoch-core"
        ],
        "role": "supporting"
      }
    ]
  },
  {
    "id": "multitab-workspace",
    "title": "Multi-document ERP tab workspace",
    "priority": 9,
    "triggers": [
      "multitab",
      "multi tab",
      "document tabs",
      "erp tabs",
      "tab workspace",
      "workspace tabs",
      "open in tab",
      "browser tabs erp"
    ],
    "rationale": "Use @eristack/multitab for headless ERP tab chrome: pathname-keyed route tabs, /new/{uuid} placeholders, adjacent insert, localStorage persistence, closeGuard, and MultitabRouterProvider for TanStack Router (URL is source of truth). App owns tab bar UI and keyboard shortcuts.",
    "packages": [
      {
        "name": "@eristack/multitab",
        "skills": [
          "multitab-core"
        ],
        "role": "primary"
      }
    ]
  },
  {
    "id": "structured-logging",
    "title": "JSON-lines request logging",
    "priority": 10,
    "triggers": [
      "logger",
      "logging",
      "structured log",
      "json log",
      "request id log",
      "vercel logs",
      "log drain"
    ],
    "rationale": "Use @eristack/logger for JSON-lines server logging with injectable requestId, userId, and tenantId context. Express: createLoggerMiddleware. Nest: LoggerModule.forRoot + LoggingInterceptor.",
    "packages": [
      {
        "name": "@eristack/logger",
        "skills": [
          "logger-core"
        ],
        "role": "primary"
      }
    ]
  },
  {
    "id": "declarative-rest-routes",
    "title": "Declarative REST route shell",
    "priority": 10,
    "triggers": [
      "rest routes",
      "declarative rest",
      "openapi emit",
      "express route table",
      "nest route module"
    ],
    "rationale": "Use @eristack/rest to define HTTP routes as data, mount on Express or Nest, and emit minimal OpenAPI 3.1 paths. Compose with jwt-auth guards and data-grid list handlers in app modules.",
    "packages": [
      {
        "name": "@eristack/rest",
        "skills": [
          "rest-core"
        ],
        "role": "primary"
      }
    ]
  },
  {
    "id": "access-control-stack",
    "title": "Roles, attribute limits, and document policies",
    "priority": 12,
    "triggers": [
      "rbac",
      "abac",
      "pbac",
      "role based",
      "roles",
      "permissions",
      "permission",
      "access control",
      "authorization",
      "can user",
      "attribute policy",
      "business policy",
      "goods receipt limit",
      "book value limit",
      "documents.transitions",
      "assignmentpairmatch",
      "document transition"
    ],
    "rationale": "Use @eristack/rbac for boolean role permissions, @eristack/abac for attribute policies (e.g. max book value), and @eristack/pbac for document software policies (e.g. PO outstanding > 0). Pair with jwt-auth for identity.",
    "packages": [
      {
        "name": "@eristack/rbac",
        "skills": [
          "rbac-core",
          "rbac-adapters"
        ],
        "role": "primary"
      },
      {
        "name": "@eristack/abac",
        "skills": [
          "abac-core",
          "abac-adapters"
        ],
        "role": "primary"
      },
      {
        "name": "@eristack/pbac",
        "skills": [
          "pbac-core",
          "pbac-adapters"
        ],
        "role": "primary"
      },
      {
        "name": "@eristack/jwt-auth",
        "skills": [
          "jwt-auth-core"
        ],
        "role": "supporting"
      }
    ]
  },
  {
    "id": "stock-inventory-ledger",
    "title": "Inventory stock movements by location and lot",
    "priority": 28,
    "triggers": [
      "stock",
      "inventory",
      "warehouse",
      "lot",
      "stock movement",
      "goods receipt",
      "goods issue",
      "on hand"
    ],
    "rationale": "Use @eristack/stock-movement on @eristack/hash-chained-ledger for qty ledgers with composable locations, lots, snapshots, and tamper checks.",
    "packages": [
      {
        "name": "@eristack/stock-movement",
        "skills": [
          "stock-movement-core",
          "stock-movement-adapters"
        ],
        "role": "primary"
      },
      {
        "name": "@eristack/hash-chained-ledger",
        "skills": [
          "hash-chained-ledger-core"
        ],
        "role": "supporting"
      }
    ]
  },
  {
    "id": "financial-gl-ledger",
    "title": "Financial / GL account ledger",
    "priority": 29,
    "triggers": [
      "general ledger",
      "gl",
      "chart of accounts",
      "account balance",
      "journal entry",
      "financial ledger"
    ],
    "rationale": "Use @eristack/financial-ledger for accountId+currency hash-chained balances with @eristack/money amounts.",
    "packages": [
      {
        "name": "@eristack/financial-ledger",
        "skills": [
          "financial-ledger-core",
          "financial-ledger-adapters"
        ],
        "role": "primary"
      },
      {
        "name": "@eristack/hash-chained-ledger",
        "skills": [
          "hash-chained-ledger-core"
        ],
        "role": "supporting"
      },
      {
        "name": "@eristack/money",
        "skills": [
          "money-amounts"
        ],
        "role": "supporting"
      }
    ]
  },
  {
    "id": "inventory-valuation",
    "title": "FIFO, average, and other inventory valuations",
    "priority": 30,
    "triggers": [
      "fifo",
      "lifo",
      "fefo",
      "moving average",
      "weighted average",
      "standard cost",
      "inventory valuation",
      "costing",
      "cost layers"
    ],
    "rationale": "Use @eristack/valuations for canon costing methods with qty+value hash-chained ledgers.",
    "packages": [
      {
        "name": "@eristack/valuations",
        "skills": [
          "valuations-core",
          "valuations-adapters"
        ],
        "role": "primary"
      },
      {
        "name": "@eristack/hash-chained-ledger",
        "skills": [
          "hash-chained-ledger-core"
        ],
        "role": "supporting"
      }
    ]
  },
  {
    "id": "compose-spine",
    "title": "Compose business spine (auth, lines, lists, optional ledgers)",
    "priority": 6,
    "triggers": [
      "erp",
      "enterprise resource planning",
      "business app",
      "operational app",
      "document workflow",
      "purchase order",
      "sales order",
      "inventory transfer",
      "stocktake",
      "accounts payable",
      "accounts receivable",
      "work order",
      "bill of materials"
    ],
    "rationale": "No @eristack/feature-* vertical packages — apps own document families. For header + QUPS line products load #document-lines-erp or #backseat-then-backend. Compose qups, doc-number, pbac, data-grid, jwt-auth, rbac by default. Add stock-movement, financial-ledger, valuations only when inventory or GL is explicitly in scope — never assume procure-to-pay or warehouse modules exist.",
    "packages": [
      {
        "name": "@eristack/qups",
        "skills": [
          "qups-core",
          "qups-line"
        ],
        "role": "primary"
      },
      {
        "name": "@eristack/pbac",
        "skills": [
          "pbac-core"
        ],
        "role": "primary"
      },
      {
        "name": "@eristack/doc-number",
        "skills": [
          "doc-number-core"
        ],
        "role": "supporting"
      },
      {
        "name": "@eristack/data-grid",
        "skills": [
          "data-grid-core"
        ],
        "role": "supporting"
      },
      {
        "name": "@eristack/jwt-auth",
        "skills": [
          "jwt-auth-core"
        ],
        "role": "supporting"
      }
    ]
  },
  {
    "id": "hash-chain-audit",
    "title": "Audit trail and tamper-evident ledger",
    "priority": 25,
    "triggers": [
      "audit trail",
      "tamper",
      "tamper detection",
      "tamper-evident",
      "hash chain",
      "append-only ledger",
      "immutable log"
    ],
    "rationale": "Use @eristack/hash-chained-ledger for SHA-256 chained append-only entries. Stock, financial, and valuation packages compose this primitive in production.",
    "packages": [
      {
        "name": "@eristack/hash-chained-ledger",
        "skills": [
          "hash-chained-ledger-core"
        ],
        "role": "primary"
      }
    ]
  },
  {
    "id": "ai-workflow-memory",
    "title": "Sprint backlog and local project memory",
    "priority": 12,
    "triggers": [
      "sprint",
      "backlog",
      "adr",
      "project memory",
      "mcp workflow",
      "eristack workflow",
      ".eristack/workflow"
    ],
    "rationale": "Use @eristack/ai-workflow for local MCP, FTS+vector index, and sprint/backlog folders under .eristack/workflow — complements Intent, does not replace git.",
    "packages": [
      {
        "name": "@eristack/ai-workflow",
        "skills": [
          "ai-workflow-core"
        ],
        "role": "primary"
      }
    ]
  },
  {
    "id": "ai-dev-tooling",
    "title": "Monorepo plan, check profiles, and dev MCP",
    "priority": 11,
    "triggers": [
      "eristack plan",
      "dev tooling",
      "monorepo check",
      "ci profile",
      "pnpm ci",
      "dev mcp",
      "check profile",
      "token minimal check"
    ],
    "rationale": "Use @eristack/ai-dev before chaining scripts: eristack plan --json for minimal next steps, eristack check --profile pr for CI parity, eristack-mcp for dev_plan/dev_check.",
    "packages": [
      {
        "name": "@eristack/ai-dev",
        "skills": [
          "ai-dev-core"
        ],
        "role": "primary"
      }
    ]
  },
  {
    "id": "maintainer-tickets",
    "title": "Bug reports and feature suggestions for maintainers",
    "priority": 15,
    "triggers": [
      "bug report",
      "bug ticket",
      "support ticket",
      "feature request",
      "feature suggestion",
      "maintainer ticket",
      "fixer upper",
      "report a bug",
      "suggest a feature",
      "eristack ticket"
    ],
    "rationale": "Use @eristack/ai-ticket-generator to produce a portable markdown ticket (logs/scenario/fix plan or feasibility-gated suggestion) the user can send to maintainers for an agent fixer-upper. Every package has ticket.yaml.",
    "packages": [
      {
        "name": "@eristack/ai-ticket-generator",
        "skills": [
          "ai-ticket-bug",
          "ai-ticket-suggest"
        ],
        "role": "primary"
      }
    ]
  }
] as Recipe[];
