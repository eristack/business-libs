# Recipes

## Partner create / update

```ts
import { normalizeAddress } from "@eristack/address";
import { postalAddressSchema } from "@eristack/address/zod";

async function savePartnerAddress(partnerId: string, raw: unknown) {
  const parsed = postalAddressSchema.parse(raw);
  const address = normalizeAddress(parsed);
  await db.insert(partnerAddresses).values({ partnerId, ...address });
  return address;
}
```

## Invoice PDF ship-to block

```ts
import { formatAddressLines } from "@eristack/address";

function shipToBlock(shipTo: PostalAddress): string {
  return formatAddressLines(shipTo).join("\n");
}
```

## Shipping label one line

```ts
import { formatAddressOneLine } from "@eristack/address";

const label = formatAddressOneLine(shipTo, { separator: ", " });
```

## Domestic vs export tax

```ts
import { isSameCountry } from "@eristack/address";

function taxRule(billTo: PostalAddress, shipTo: PostalAddress) {
  if (isSameCountry(billTo, shipTo)) {
    return applyDomesticVat();
  }
  return applyExportRule();
}
```

## List partners by country

Normalize filter code once:

```ts
import { normalizeCountryCode } from "@eristack/address";

const cc = normalizeCountryCode(req.query.country);
await db.select().from(partners).where(eq(partners.countryCode, cc));
```

Store uppercase in DB via normalize on write so equality indexes work.

## API validation pipeline

```ts
const body = postalAddressSchema.parse(req.body);
const address = normalizeAddress(body);
await db.update(customers).set({ billTo: address }).where(eq(customers.id, id));
```

## Duplicate detection (app layer)

```ts
function addressKey(a: PostalAddress): string {
  return JSON.stringify(normalizeAddress(a));
}
```

Use in unique constraint or pre-insert check — not provided by core.

## Form default country

Pre-fill `countryCode` from company legal entity; still run through `normalizeCountryCode` on submit.
