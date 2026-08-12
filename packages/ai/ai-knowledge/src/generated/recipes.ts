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
  }
] as Recipe[];
