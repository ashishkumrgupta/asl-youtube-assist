# Extension E2E

## Automated (Phase 0 + local demos)

`fixture-smoke.test.ts` — Vitest smoke using named caption fixtures (no live YouTube):

- Assist labeling constants + copy lint
- Clip pack **pending** (no AI-persona / third-party lock-in)
- Caption sync + lexical/fingerspell playlist
- Critical-domain hard gate

Also:

- `e2e/demo-videos/local-demo-sync.test.ts` — assist-frame / overlay state against `fixtures/demo-videos/`
- `e2e/demo-videos/theater-smoke.test.ts` — theater pages build + VTT cues parse

Still no live YouTube; **not** signing-video proof.

Run via root `npm test`.

## Manual paths

| Path                                       | Command / doc                                                                                            |
| ------------------------------------------ | -------------------------------------------------------------------------------------------------------- |
| **Local theater** (owner offline sideload) | `npm run demo` → `http://127.0.0.1:4173/` · [`docs/build-and-reload.md`](../../docs/build-and-reload.md) |
| **YouTube** (owner live)                   | [`docs/sideload-checklist.md`](../../docs/sideload-checklist.md)                                         |

Same content script on both. Theater host permission: `http://127.0.0.1:4173/*` only.

Live YouTube Playwright automation is still deferred until QA owns browser fixtures.
