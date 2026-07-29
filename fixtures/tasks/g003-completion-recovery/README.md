# G003 Completion Recovery Fixture

The only agent-writable output is `answer.txt` in the disposable workspace.
The deterministic verifier passes only when its bytes are exactly
`verified\n` (UTF-8).

Reset procedure: require the target workspace to be absent, create it, then
copy the complete `initial/` tree without transformation. The G003 driver
hashes both reset trees before either run and requires byte-equivalence.
