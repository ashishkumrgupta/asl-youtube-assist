# Build and reload (Chrome)

Use this after code is on `main` (or whenever you just want a fresh local build). You do not need other git branches for day-to-day testing.

## One-time: get a clean copy of main

In Terminal, from your clone folder (example `~/Downloads/asl-youtube-assist`):

```bash
cd ~/Downloads/asl-youtube-assist
git fetch origin
git checkout -f main
git reset --hard origin/main
```

(`-f` / `--hard` discards local edits so git won’t block you.)

## Every time you want a fresh build

```bash
cd ~/Downloads/asl-youtube-assist
git pull
npm install
npm run build
```

## Reload in Chrome

1. Open `chrome://extensions`
2. Find **ASL YouTube Assist** → click **Reload**
3. Confirm site access is ON for YouTube hosts **and** `http://127.0.0.1:4173` (local theater)
4. Hard-refresh the tab you are testing (Cmd+R)
5. Enable **Show ASL assist overlay** in the popup

Built files live in `apps/extension/dist` — only reload; you usually do not need to “Load unpacked” again unless you removed the extension.

---

## Test on local theater

Offline path for owner sideload checks against the same demo MP4s agents use. Captions (VTT) are always available. **Still assist/partial only** — pack pending; not signing video; not a YouTube replacement.

```bash
npm run demo
# → http://127.0.0.1:4173/
```

1. Open the library → pick a clip (watch page uses HTML5 video + English captions track)
2. Reload the extension (above)
3. Enable the overlay → gloss/fingerspell cues should advance with captions
4. Drag **Move** so the overlay does not cover captions

Host permission is least-privilege: `http://127.0.0.1:4173/*` only (documented static server). See [`permissions.md`](permissions.md).

## Test on YouTube

Live product path — keep using this for real captioned videos.

1. Build + reload (above)
2. Open a **captioned** YouTube `/watch` URL
3. Turn CC on → enable **Show ASL assist overlay**
4. Confirm cues advance; honesty line visible; captions floor intact

Local theater and YouTube both use the same content-script overlay. Prefer theater for quick offline loops; prefer YouTube for real-world validation.
