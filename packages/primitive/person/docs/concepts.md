# Concepts

## Gender identity

`GENDER_IDENTITIES` documents the v0 enum: `unknown`, `woman`, `man`, `non_binary`, `prefer_not_to_say`, `other`. Apps may show localized labels; storage uses canonical snake_case strings.

## Name fields

Western-default **display** order: prefix, given, middle, family, suffix. Use `formatPersonSortable` for directory lists (family first).
