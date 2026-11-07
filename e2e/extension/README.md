# Extension E2E

## Automated (Phase 0 + local demos)

`fixture-smoke.test.ts` — Vitest smoke using named caption fixtures (no live YouTube):

- Assist labeling constants + copy lint
- Clip pack **pending** (no AI-persona / third-party lock-in)
- Caption sync + lexical/fingerspell playlist
- Critical-domain hard gate

Also: `e2e/demo-videos/local-demo-sync.test.ts` drives assist-frame / overlay state against `fixtures/demo-videos/` MP4+VTT for **agents/CI** (and supports Deaf-user UAT offline). Still no live YouTube; **not** signing-video proof; **not** a replacement for owner YouTube sideload.

Run via root `npm test` (included in Vitest include paths).

Offline visual (agent/UAT): `npm run demo:player` → `apps/demo-player`.

## Manual (owner YouTube path)

See [`docs/sideload-checklist.md`](../../docs/sideload-checklist.md) for AC-0.1 (&lt;1 min sideload → toggle on real YouTube). Keep the content-script path working; local demos do not replace it.

Live YouTube Playwright automation is still deferred until QA owns browser fixtures; local demos cover offline caption→gloss sync for CI/UAT.
