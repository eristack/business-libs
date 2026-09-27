export type GenderIdentity =
  | "unknown"
  | "woman"
  | "man"
  | "non_binary"
  | "prefer_not_to_say"
  | "other";

export const GENDER_IDENTITIES: readonly GenderIdentity[] = [
  "unknown",
  "woman",
  "man",
  "non_binary",
  "prefer_not_to_say",
  "other",
] as const;

export type PersonName = {
  given: string;
  family: string;
  middle?: string;
  prefix?: string;
  suffix?: string;
};

export type Person = {
  name: PersonName;
  gender?: GenderIdentity;
  /** Free text when `gender` is `other`. */
  genderOther?: string;
};

export type PersonFormatOptions = {
  /** List/sort as "Family, Given" (default false = display order). */
  familyFirst?: boolean;
};
