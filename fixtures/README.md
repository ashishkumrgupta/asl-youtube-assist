# Fixtures

Versioned caption samples + **local demo videos** for sync + overlay verification (no live YouTube).

## Captions only

| File                                 | Role                                 |
| ------------------------------------ | ------------------------------------ |
| `captions/sample.vtt`                | Legacy simple VTT                    |
| `captions/phase0-hello.vtt`          | Named Phase 0 sync fixture           |
| `captions/phase0-oov.vtt`            | OOV → fingerspell path               |
| `captions/phase0-sync-expected.json` | Expected cue times + playlist checks |

## Local demo videos (MP4 + VTT)

See [`demo-videos/README.md`](demo-videos/README.md) — generated short clips for **agents/CI** and **Deaf-user UAT** offline.
Automated: `e2e/demo-videos/local-demo-sync.test.ts`. Visual: `npm run demo:player`.

**Split:** local harness ≠ owner YouTube testing. Extension content-script on live YouTube remains the owner path.

**Honesty:** demos prove caption→gloss UI sync only. Clip pack still **pending**. Not signing-video proof. Not an interpreter.

Provenance: synthetic demo captions / lavfi color fields — not production content. Regenerate intentionally only.
