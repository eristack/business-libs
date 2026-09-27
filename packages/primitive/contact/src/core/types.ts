export type ContactRole =
  | "general"
  | "billing"
  | "shipping"
  | "technical"
  | "sales"
  | "other";

export const CONTACT_ROLES: readonly ContactRole[] = [
  "general",
  "billing",
  "shipping",
  "technical",
  "sales",
  "other",
] as const;

export type ContactChannel = {
  role: ContactRole;
  /** FK to app persons table — opaque string. */
  personId?: string;
  /** Normalized E.164 from @eristack/phone at boundary. */
  phone?: string;
  /** Normalized local@domain from @eristack/email-address at boundary. */
  email?: string;
  isPrimary?: boolean;
};

export type ContactList = {
  channels: ContactChannel[];
};
