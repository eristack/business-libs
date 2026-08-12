---
title: Concepts
description: Document policies vs roles vs attributes
sidebar_position: 2
---

# Concepts

## Local business law

PBAC encodes rules the business applies regardless of who is signed in:

| Policy | Meaning |
| --- | --- |
| `purchase-order.can-receive` | outstanding > 0 |
| `purchase-order.open` | status in open/partial |
| `invoice.not-locked` | locked flag unset |

Identity still matters for **RBAC** (may they post GR?) and **ABAC** (within
their limit?). PBAC is the document gate afterward.

## HTTP status

Express/Nest adapters use **409 Conflict** for denied business policies (not
403), so clients can distinguish “you personally may not” vs “the document
forbids this”.
