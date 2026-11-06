# Extension E2E

## Automated (Phase 0)

`fixture-smoke.test.ts` — Vitest smoke using named caption fixtures (no live YouTube):

- Assist labeling constants + copy lint
- Clip pack **pending** (no AI-persona / third-party lock-in)
- Caption sync + lexical/fingerspell playlist
- Critical-domain hard gate

Run via root `npm test` (included in Vitest include paths).

## Manual

See [`docs/sideload-checklist.md`](../../docs/sideload-checklist.md) for AC-0.1 (&lt;1 min sideload → toggle).

Live YouTube Playwright sideload is deferred until QA owns browser fixtures; not required to keep local Phase 0 scaffolding moving while clip pack is held.
