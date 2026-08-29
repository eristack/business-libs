import { z } from "zod";

export const countryCodeSchema = z.string().regex(/^[A-Za-z]{2}$/);

export const postalAddressSchema = z.object({
  line1: z.string().min(1),
  line2: z.string().optional(),
  locality: z.string().min(1),
  region: z.string().optional(),
  postalCode: z.string().optional(),
  countryCode: countryCodeSchema,
});

export type PostalAddressJson = z.infer<typeof postalAddressSchema>;
