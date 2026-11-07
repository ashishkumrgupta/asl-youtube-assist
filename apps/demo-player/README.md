# Local theater (YouTube-like demos)

Polished **library + watch** pages that serve `fixtures/demo-videos/*` with
**always-available WebVTT**. Sideload the Chrome extension and use the same
assist overlay path as YouTube — content script injects on this origin.

**Audience:** owner offline extension testing; also agents/CI + Deaf-user UAT.
**Does not** replace real YouTube validation. **Does not** prove signing video.
Clip pack remains **pending**.

## Run

```sh
# From repo root — leave the terminal open (server must stay running)
npm run demo
# → Local theater (open this URL): http://127.0.0.1:4173/
```

`npm run demo:player` is an alias of the same command.

Documented origin (least-privilege host permission):

`http://127.0.0.1:4173/*`

Open **only** that URL — not `http://localhost:4173/` (different Chrome origin; extension will not inject).

Owner steps for YouTube vs theater: [`docs/build-and-reload.md`](../../docs/build-and-reload.md).

## What you should see

1. **Library** — intentional demo list (not a raw file dump).
2. Open a clip → **watch** page with HTML5 video + English captions track on.
3. Sideload / reload the extension → enable **Show ASL assist overlay**.
4. Gloss / fingerspell cues advance with caption times.
5. Honesty chrome stays assist/partial · pack pending · not an interpreter.

## Build only

```sh
npm run build -w @asl/demo-player
node scripts/serve-demo-player.mjs
# Open only http://127.0.0.1:4173/ — not localhost (different Chrome origin)
```
