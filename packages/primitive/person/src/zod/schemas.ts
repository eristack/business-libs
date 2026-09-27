import { z } from "zod";

import { normalizePerson } from "../core/person.js";
import { GENDER_IDENTITIES } from "../core/types.js";

const personNameSchema = z.object({
  given: z.string(),
  family: z.string(),
  middle: z.string().optional(),
  prefix: z.string().optional(),
  suffix: z.string().optional(),
});

export const personSchema = z
  .object({
    name: personNameSchema,
    gender: z
      .enum([...GENDER_IDENTITIES] as [
        (typeof GENDER_IDENTITIES)[number],
        ...(typeof GENDER_IDENTITIES)[number][],
      ])
      .optional(),
    genderOther: z.string().optional(),
  })
  .transform((value) => normalizePerson(value));
