# WIP — ephemeral implementation notes

**Empty is normal.** Create `wip/<topic>/` only while actively implementing something.

1. Copy [`../_template/overview.md`](../_template/overview.md) → `wip/<topic>/overview.md`
2. Fill frontmatter: `status`, `promotes-to`, `skills`, `recipes`
3. Ship in the same iteration: real package docs + skills + `recipes.yaml` + `pnpm knowledge:sync`
4. When the user says finished → promote → **delete this folder**

Do **not** use `wip/` for package naming brainstorms ([`../brainstorm/`](../brainstorm/)) or monorepo audits ([`../audit/`](../audit/)).
