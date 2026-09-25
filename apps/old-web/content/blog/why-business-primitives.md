---
title: Why business primitives
description: Node teams keep re-implementing money and sessions. Here’s why Eristack exists.
date: 2026-08-01
author: Eristack
---

Enterprise stacks in Java and C# grew up with shared libraries for money, identity, and document numbers. TypeScript teams still rebuild those pieces — often with subtle incompatibilities between services.

Eristack is a bet that **small, honest packages** beat yet another opinionated platform.

## What we mean by primitive

A primitive is a library that:

1. Owns one domain concept end-to-end
2. Refuses to own your database connection, UI, or env loader
3. Documents the contract as carefully as the code

`@eristack/money` is a good example: string-first amounts, same-currency arithmetic, allocation that always adds up. It does not ship an invoicing product.

## What comes next

We’ll keep publishing the building blocks we actually use in Erista products — auth sessions, credentials as a child of users, and more — with the same injection rules and release discipline.
