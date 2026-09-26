# Concepts

## Assigned vs format-only

| Check | `@eristack/address` | `@eristack/iso-3166` |
| --- | --- | --- |
| Two letters | yes | yes |
| In ISO assigned alpha-2 set | no | yes |
| Alpha-3 conversion | no | yes |
| Subdivision `CC-XXX` | optional string on address | normalize + prefix match |

## Data shipped in-package

- `ISO_3166_1_ALPHA2_CODES` / `ISO_3166_1_ALPHA2_SET` — assigned alpha-2 (includes commonly used `XK`)
- `ISO_3166_1_ALPHA3_TO_ALPHA2` — alpha-3 mapping

Dataset updates ship as **patch/minor package releases**; bulk exports belong in `@eristack/reference-data` later.

## Errors

`CountryCodeError` — invalid format, unassigned code, subdivision prefix mismatch.
