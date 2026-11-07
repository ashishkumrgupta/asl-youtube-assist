# Local demo videos (no live YouTube)

Tiny **generated** clips + matching WebVTT for **agents/CI** and **Deaf-user UAT** offline.
They prove **overlay / cue sync**, not signing video (clip pack still **pending**).

**Not a substitute for the owner’s real YouTube sideload.** The extension content-script on YouTube `/watch` remains the owner path; keep that working. Use this harness when live YouTube is unavailable or for automated/UAT workflows.

## Contents

| Id           | Media            | Captions         | Focus                    |
| ------------ | ---------------- | ---------------- | ------------------------ |
| `01-hello`   | `01-hello.mp4`   | `01-hello.vtt`   | Lexical hits + advance   |
| `02-welcome` | `02-welcome.mp4` | `02-welcome.vtt` | Multi-cue advance        |
| `03-oov`     | `03-oov.mp4`     | `03-oov.vtt`     | OOV → fingerspell        |
| `04-wh-time` | `04-wh-time.mp4` | `04-wh-time.vtt` | WH / TIME gloss          |
| `05-gaps`    | `05-gaps.mp4`    | `05-gaps.vtt`    | Idle between cue windows |

Provenance: ffmpeg `lavfi` color fields + drawtext titles. Captions authored here.
**Not** Deaf-produced signing. **Not** gold clips. **Not** an interpreter demo.

## Run locally

```sh
# From repo root
npm test                 # includes e2e/demo-videos sync tests
npm run demo:player      # serve apps/demo-player (see that README)
```

Open the demo player, pick a clip, enable assist chrome — gloss cues should track VTT times.

## Regenerate

```sh
# Only when intentionally refreshing fixtures
ffmpeg -f lavfi -i color=c=0x0e2a32:s=640x360:d=8:r=24 \
  -f lavfi -i anullsrc=r=44100:cl=mono -shortest \
  -c:v libx264 -pix_fmt yuv420p -c:a aac fixtures/demo-videos/01-hello.mp4
```

Keep matching `.vtt` in sync when durations change.
