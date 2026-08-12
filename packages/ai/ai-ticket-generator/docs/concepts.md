---
title: Concepts
description: Portable files, feasibility gates, and agent handoff
sidebar_position: 2
---

# Concepts

## Portable over portals

Tickets are **markdown files**, not a hosted issue tracker. Anyone can email,
Slack, or attach them. Maintainers paste the file into an agent session and
work.

## Draft vs send

Generators (CLI or Intent skills) should:

1. Collect facts from the user (do not invent stack traces).
2. Structure them into the ticket schema.
3. Write `.eristack/tickets/<id>.md`.
4. Tell the user the path — **they** decide when to send it.

## Feasibility is a gate, not a veto forever

`assessFeasibility` is a **first pass**. Maintainers can override. Agents must
not implement `unlikely` / `needs-decision` tickets unless a human says so.

## Subscription is the contract

`ticket.yaml` is how a package opts into (and stays in) the support loop:

- `scope` / `outOfScope` steer feasibility
- `skills` tell agents what to load
- `maintainers` show who receives files
