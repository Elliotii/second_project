# Repair `parseDuration`

Repair `src/parse-duration.ts` so the public tests pass. The parser must accept only a complete unsigned base-10 integer followed by `ms`, `s`, or `m`; reject malformed or trailing characters; and reject input integers or conversions that are not safe integers. Modify only `src/parse-duration.ts`, run the declared `test` command, and then report completion.
