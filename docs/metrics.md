# Metrics

Repory is deterministic and never fabricates unavailable values. Complexity is a
simple, language-neutral cyclomatic proxy (one point per conditional token plus
one per file). Maintainability combines complexity, documentation, tests, and
whether history is available. Architecture uses detected manifests and layout.
Security is an indicator only: obvious secret patterns and tracked `.env` files
make the score unavailable (`N/A`), not a vulnerability claim.
