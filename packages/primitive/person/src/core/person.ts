import { PersonParseError } from "./errors.js";
import type {
  GenderIdentity,
  Person,
  PersonFormatOptions,
  PersonName,
} from "./types.js";
import { GENDER_IDENTITIES } from "./types.js";

function trimOptional(value: string | undefined): string | undefined {
  const t = value?.trim();
  return t ? t : undefined;
}

function trimRequired(value: string, field: string): string {
  const t = value.trim();
  if (!t) {
    throw new PersonParseError(`${field} is required`);
  }
  return t;
}

export function normalizePersonName(input: PersonName): PersonName {
  return {
    given: trimRequired(input.given, "name.given"),
    family: trimRequired(input.family, "name.family"),
    middle: trimOptional(input.middle),
    prefix: trimOptional(input.prefix),
    suffix: trimOptional(input.suffix),
  };
}

export function isGenderIdentity(value: string): value is GenderIdentity {
  return (GENDER_IDENTITIES as readonly string[]).includes(value);
}

export function normalizeGenderIdentity(value: string): GenderIdentity {
  const normalized = value.trim().toLowerCase().replace(/-/g, "_") as GenderIdentity;
  if (!isGenderIdentity(normalized)) {
    throw new PersonParseError(`Invalid gender identity "${value}"`);
  }
  return normalized;
}

export function normalizePerson(input: Person): Person {
  const name = normalizePersonName(input.name);
  const gender = input.gender ? normalizeGenderIdentity(input.gender) : undefined;
  const genderOther = trimOptional(input.genderOther);

  if (gender === "other" && !genderOther) {
    throw new PersonParseError("genderOther is required when gender is other");
  }
  if (gender !== "other" && genderOther) {
    throw new PersonParseError("genderOther is only allowed when gender is other");
  }

  return { name, gender, genderOther };
}

export function formatPersonDisplay(
  person: Person,
  options: PersonFormatOptions = {},
): string {
  const p = normalizePerson(person);
  if (options.familyFirst) {
    return formatPersonSortable(p);
  }
  const parts = [
    p.name.prefix,
    p.name.given,
    p.name.middle,
    p.name.family,
    p.name.suffix,
  ].filter(Boolean);
  return parts.join(" ");
}

export function formatPersonSortable(person: Person): string {
  const p = normalizePerson(person);
  const givenParts = [p.name.given, p.name.middle].filter(Boolean).join(" ");
  const family = p.name.family;
  const suffix = p.name.suffix ? ` ${p.name.suffix}` : "";
  return `${family}${suffix}, ${givenParts}`;
}
