# Package hero demos (site)

## Status

| Item | State |
| --- | --- |
| Hero code | Full-width footer; taller padding; no vertical clip |
| QUPS | Multi-line invoice pipeline |
| RBAC | Permission matrix + live `can()` |
| ABAC | Dual attribute rails + f(a)→bool |
| PBAC | Document state machine + stacked rules |
| Data grid | Query chips → dim/highlight table |
| Hash-chained ledger | Append → chain links → tamper/verify |
| Stock movement | locationIdFromParts → receipt/issue balance |
| Financial ledger | Dual account posts + Money amounts |
| Valuations | FIFO receive/issue + layer drain |
| AI knowledge | Scored recipes + package chips |
| AI workflow | Backlog/sprint/ADR board |
| AI ticket | Markdown ticket assembling |

## Convention

Browser heroes may use memory stores (no Postgres in the client) with explicit
copy: **Demo store — apps use Drizzle.** Landing sample code and package docs
always lead with Drizzle.

## Docs depth (this pass)

- qups: expanded qups/modifiers/tax/stores + gotchas
- rbac/pbac: edge-cases pages
- ai-ticket-generator: ticket-schema
- abac: _meta includes choosing-access-control + edge-cases
- ledger family: deeper concepts/recipes/methods; skills Drizzle-first
