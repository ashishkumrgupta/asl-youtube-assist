# ADR 0001 — Slice A local monorepo

## Status

Accepted — 2026-11-06

## Context

Phase 0 Slice A needs a thin MV3 habit skeleton with enterprise CI gates, without blocking on remote repo creation.

## Decision

- npm workspaces monorepo under Project `workspace/asl-youtube-assist`
- Pure packages for labels, flags, sync, copy-lint, critical-gate
- esbuild bundles for extension entrypoints
- Local `git init` only; remotes optional

## Consequences

- `npm test` / `npm run build` work offline
- Push tomorrow = add remote + push `main`
- Clip CDN / Tier A remain later slices
