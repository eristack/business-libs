import type { SimpleIcon } from "simple-icons";

/** Minimal SimpleIcon-shaped marks when simple-icons has no brand (or we use a generic tile). */
function placeholder(
  slug: string,
  title: string,
  hex: string,
  path: string,
): SimpleIcon {
  return {
    title,
    slug,
    hex,
    path,
    source: "https://eristack.dev",
    svg: `<svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="${path}"/></svg>`,
  } as SimpleIcon;
}

/** Microsoft four-square mark (brand blue). */
export const placeholderMicrosoft = placeholder(
  "microsoft",
  "Microsoft",
  "0078D4",
  "M0 0h11v11H0V0zm13 0h11v11H13V0zM0 13h11v11H0V13zm13 0h11v11H13V13z",
);

/** AWS-style cloud (S3 / SDK — orange). */
export const placeholderAmazonS3 = placeholder(
  "amazons3",
  "Amazon S3",
  "FF9900",
  "M19.35 10.04A7.49 7.49 0 0012 4C9.11 4 6.6 5.64 5.35 8.04A5.994 5.994 0 000 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z",
);

/** Twilio-inspired twin circles. */
export const placeholderTwilio = placeholder(
  "twilio",
  "Twilio",
  "F22F46",
  "M12 2a5 5 0 100 10 5 5 0 000-10zm-7 12a5 5 0 100 10 5 5 0 000-10zm14 0a5 5 0 100 10 5 5 0 000-10z",
);

/** SendGrid-inspired grid. */
export const placeholderSendGrid = placeholder(
  "sendgrid",
  "SendGrid",
  "1A82E2",
  "M2 2h9v9H2V2zm11 0h9v9h-9V2zM2 13h9v9H2v-9zm11 0h9v9h-9v-9z",
);

/** Postmark-inspired stamp. */
export const placeholderPostmark = placeholder(
  "postmark",
  "Postmark",
  "FFDE00",
  "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15v-4H7l5-7v4h4l-5 7z",
);

/** ISO / standards (globe meridian). */
export const placeholderIso = placeholder(
  "iso",
  "ISO",
  "003366",
  "M12 2a10 10 0 100 20 10 10 0 000-20zm0 2c1.5 3.5 1.5 14.5 0 18-1.5-3.5-1.5-14.5 0-18zm-8 8c3.5-1.5 14.5-1.5 18 0-3.5 1.5-14.5 1.5-18 0z",
);

/** UN trade / locode (anchor). */
export const placeholderUnlocode = placeholder(
  "unlocode",
  "UN/LOCODE",
  "009EDB",
  "M12 2l-1 4H7l3.5 3-1.5 5L12 11l3 3-1.5-5L17 6h-4L12 2zm0 14a3 3 0 110 6 3 3 0 010-6z",
);

/** Eristack docs / package tiles (monogram E). */
export const placeholderEristack = placeholder(
  "eristack",
  "Eristack",
  "0A7C59",
  "M4 4h16v4H10v3h8v4H10v5H4V4z",
);

/** Neutral tile when no vendor mark is available. */
export const placeholderGeneric = placeholder(
  "generic",
  "Integration",
  "64748B",
  "M4 4h7v7H4V4zm9 0h7v7h-7V4zM4 13h7v7H4v-7zm9 3h7v4h-7v-4z",
);
