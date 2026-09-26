/** Sample assigned UN/LOCODE values for tests and demos — not the full UN dataset. */
export const UNLOCODE_SAMPLE_LOCODES = [
  "IDJKT",
  "IDSUB",
  "SGSIN",
  "MYPKG",
  "USNYC",
  "USLAX",
  "USCHI",
  "NLRTM",
  "DEHAM",
  "BEANR",
  "GBFXT",
  "CNSHA",
  "CNPVG",
  "HKHKG",
  "JPTYO",
  "KRPUS",
  "AEDXB",
  "AUMEL",
  "BRSSZ",
  "INMAA",
] as const;

export const UNLOCODE_SAMPLE_SET: ReadonlySet<string> = new Set(UNLOCODE_SAMPLE_LOCODES);
