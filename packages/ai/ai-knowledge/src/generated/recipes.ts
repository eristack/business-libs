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
    "rationale": "Round at ledger boundaries, allocate without losing cents, convert with app-supplied FX rates, and serialize amounts as decimal strings.",
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
      "invoice line"
    ],
    "rationale": "Use @eristack/qups calculateLine/patchLine for quantity/unit-price/subtotal (exact ratio when UP+S), modifiers, and tax — same math in TanStack Form and on the BE. Inject qupsLineColumns into detail tables when persisting. Do not invent float qty = subtotal/unitPrice in the UI.",
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
          "money-ledger"
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
      "query string filter"
    ],
    "rationale": "Use @eristack/data-grid for schema-aware list queries. Prefer advanced filters and search mode as separate modes; jwt-auth sessions and doc-number formats already return DataGridResult.",
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
      "backseat"
    ],
    "rationale": "Use @eristack/backseat for frontend-first prototypes: flexible registerRoute controllers, registerAction for complex Query logic, IndexedDB store (memory for tests), and BackseatDevtools for insert/reset/re-seed. Not production persistence. When the real backend is built later, agents peek at Backseat handlers/snapshots — no shared route contract required now.",
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
      "book value limit"
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
    "id": "erp-modules",
    "title": "ERP modules (PO, SO, product, inventory, finance)",
    "priority": 6,
    "triggers": [
      "erp",
      "enterprise resource planning",
      "purchase order",
      "sales order",
      "goods receipt",
      "product master",
      "item master",
      "procurement",
      "order to cash",
      "procure to pay",
      "inventory transfer",
      "stocktake",
      "accounts payable",
      "accounts receivable",
      "work order",
      "bill of materials"
    ],
    "rationale": "@eristack/feature-* ERP packages are coming soon — full backlog in roadmap/erp.md (reprioritize there). Until they ship, compose the spine: qups lines, stock-movement, financial-ledger, valuations, pbac, doc-number, data-grid, jwt-auth, rbac. Partner/product masters stay app-owned until feature-partner and feature-product land.",
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
        "name": "@eristack/stock-movement",
        "skills": [
          "stock-movement-core"
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
        "name": "@eristack/financial-ledger",
        "skills": [
          "financial-ledger-core"
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
