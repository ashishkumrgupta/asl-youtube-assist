# Local demo player (no live YouTube)

Static page that plays `fixtures/demo-videos/*` with WebVTT and drives the same
**caption → gloss assist-frame** used by the extension overlay.

**Audience:** agents/CI and Deaf-user UAT offline — **not** a replacement for the
owner’s real YouTube content-script testing. Sideload the extension on YouTube
separately for that path.

**Does not** prove signing video. Clip pack remains **pending**. Use this to
verify cue sync / overlay state offline.

## Run

```sh
# From repo root
npm run demo:player
# → http://127.0.0.1:4173/
```

Or:

```sh
npx serve apps/demo-player/dist -l 4173
```

Build first (also runs via `npm run build` workspace script if wired):

```sh
npm run build -w @asl/demo-player
```

## What you should see

1. Pick a demo clip.
2. Enable **ASL assist**.
3. As captions play, gloss / fingerspell cues advance.
4. Honesty chrome: **ASL assist** + `Partial · pack pending · not an interpreter`.
5. Between cues (demo `05-gaps`), status returns to waiting — not stuck forever when captions are present.

Sideload the Chrome extension separately for YouTube; this player is the **offline** path for agents/CI.
