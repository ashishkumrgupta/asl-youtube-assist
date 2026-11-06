# ADR 0002 — Client-local scale + security-by-design

- **Status:** Accepted (2026-11-06)
- **Context:** Business `internal/business/scale-security-scope.md` SC/SEC bars; habit shell has no Project backend.

## Decision

1. **Scale (SC-1):** Treat the MV3 extension as **per-client scale-out**. Document capacity as independent browsers; do not invent a backend for “many users.”
2. **Perf (SC-4):** Cap overlay work at ~10 Hz; rebuild playlists on cue change only; debounce SPA observers; slow ticks when hidden.
3. **Security (SEC-1…7):** Least-privilege manifest + CSP; validate IPC; session settings only; local captions; CI `security-check` + `npm audit`.

## Consequences

- Many users do not increase our server load (there is none).
- Clip CDN / accounts / sync are a **separate CapEx phase** with a new threat model.
- GTM may say “runs locally / many independent users”; must not say “millions / enterprise SaaS scale.”
