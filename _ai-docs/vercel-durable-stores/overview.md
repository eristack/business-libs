# Deployment preference: Vercel + durable stores

## Decision

Prefer **Vercel** for shipping web/API when it fits. Treat `createMemory*Store`
as **tests/demos only**. Production persistence is **Drizzle + hosted Postgres**
(Neon / Supabase / Vercel Postgres / …).

## Why

Serverless instances do not share process memory. Memory stores break jwt
refresh, doc-number sequences, and RBAC grants across cold starts / replicas.

## Where documented

- `packages/ai/ai-knowledge/knowledge/stack-defaults.md`
- `packages/ai/ai-knowledge/knowledge/architecture.md`
- Package getting-started callouts (rbac, jwt-auth, doc-number)
- RBAC overview sample uses Drizzle
