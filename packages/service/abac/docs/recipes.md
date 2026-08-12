---
title: Recipes
description: Common ABAC policies
sidebar_position: 5
---

# Recipes

## Warehouse scope

```ts
abac.registerPolicy({
  id: "warehouse.in-scope",
  evaluate: attrs.resourceInSubjectList({
    resourcePath: "resource.attrs.warehouseId",
    subjectListPath: "subject.attrs.warehouseIds",
  }),
});
```

## Stack with RBAC + PBAC

1. RBAC: may the user attempt `goods-receipt.post`?
2. ABAC: within their book-value / warehouse limits?
3. PBAC: does the PO still allow receiving?
