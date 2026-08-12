---
title: QUPS
description: Quantity, unit price, subtotal modes
sidebar_position: 3
---

# QUPS

| `truth` | Derived |
| --- | --- |
| `quantity+unitPrice` | `subtotal = qty × unitPrice` |
| `quantity+subtotal` | `unitPrice = subtotal ÷ qty` |
| `unitPrice+subtotal` | `quantity = subtotal ÷ unitPrice` (stored as ratio) |

```ts
import { Money } from "@eristack/money";
import { Qups } from "@eristack/qups";

const line = Qups.of({
  truth: "unitPrice+subtotal",
  unitPrice: Money.of("3", "USD"),
  subtotal: Money.of("10", "USD"),
});

line.quantityRatio; // { numerator: "10", denominator: "3" }
line.product(); // Money 10 USD — uses SoT, never drifts

// Form edit: change qty → recompute subtotal
line.edit({ quantity: "4" });
```
