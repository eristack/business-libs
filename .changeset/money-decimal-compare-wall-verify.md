---
"@eristack/money": patch
"@eristack/timestamp": patch
"@eristack/data-grid": patch
"@eristack/hash-chained-ledger": patch
---

Export `compareDecimalStrings` and `parseDecimalFilter` from money; add `rejectJsonNumberMoneyBody` Express middleware; add `compareWallDates` and `sortWallClocks`; hash-chain verify warnings include entry index and hash prefix; data-grid delegates decimal compare to money.
