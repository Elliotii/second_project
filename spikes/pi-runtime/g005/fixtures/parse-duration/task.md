# Implement `parseDuration`

Edit only `src/parse-duration.ts` and make its exported `parseDuration(input)`
function satisfy this complete public contract:

- Trim leading and trailing whitespace from the input.
- The trimmed value must consist of an unsigned base-10 integer immediately
  followed by exactly one unit: `ms`, `s`, or `m`.
- Return the duration in milliseconds (`ms` = 1, `s` = 1000,
  `m` = 60000).
- Reject malformed input by throwing an error. Malformed input includes empty
  input, signed values, decimals, a missing or unknown unit, internal or
  trailing characters, and any integer or scaled millisecond result that is
  not a JavaScript safe integer.
- Do not edit `package.json` or any test file.

Use the provided tools to inspect the task and source, write the source file,
and run the public tests. Finish only when the implementation follows the full
contract, not merely the visible examples.
