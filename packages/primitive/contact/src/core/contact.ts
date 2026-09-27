import { ContactParseError } from "./errors.js";
import type { ContactChannel, ContactList, ContactRole } from "./types.js";
import { CONTACT_ROLES } from "./types.js";

function trimOptional(value: string | undefined): string | undefined {
  const t = value?.trim();
  return t ? t : undefined;
}

function normalizeRole(role: ContactRole): ContactRole {
  const r = String(role).trim().toLowerCase().replace(/-/g, "_") as ContactRole;
  if (!(CONTACT_ROLES as readonly string[]).includes(r)) {
    throw new ContactParseError(`Invalid contact role "${role}"`);
  }
  return r;
}

function normalizeChannel(channel: ContactChannel): ContactChannel {
  const role = normalizeRole(channel.role);
  const personId = trimOptional(channel.personId);
  const phone = trimOptional(channel.phone);
  const email = trimOptional(channel.email);
  if (!personId && !phone && !email) {
    throw new ContactParseError(
      "Contact channel requires at least one of personId, phone, or email",
    );
  }
  return {
    role,
    personId,
    phone,
    email,
    isPrimary: channel.isPrimary === true,
  };
}

export function normalizeContactList(input: ContactList): ContactList {
  if (!input.channels?.length) {
    throw new ContactParseError("At least one contact channel is required");
  }
  const channels = input.channels.map(normalizeChannel);
  const primaryCount = channels.filter((c) => c.isPrimary).length;
  if (primaryCount > 1) {
    throw new ContactParseError("At most one contact channel may be isPrimary");
  }
  return { channels };
}

export function primaryContact(list: ContactList): ContactChannel | undefined {
  const normalized = normalizeContactList(list);
  return (
    normalized.channels.find((c) => c.isPrimary) ?? normalized.channels[0]
  );
}
