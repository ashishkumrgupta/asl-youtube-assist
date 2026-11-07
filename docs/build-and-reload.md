# Build and reload (Chrome)

Two ways to test the same overlay. **YouTube is the primary product path.** Local theater is the offline/demo path on `http://127.0.0.1:4173/` only (not `localhost`).

## Fresh build

From your clone:

```bash
git pull
npm install
npm run build
```

Built extension: `apps/extension/dist`

### Load or reload in Chrome

**First time**

1. Open `chrome://extensions`
2. Enable **Developer mode**
3. **Load unpacked** → select `apps/extension/dist`
4. Confirm site access is ON for YouTube **and** `http://127.0.0.1:4173` (Details → Site access)

**After each rebuild**

1. `chrome://extensions` → **ASL YouTube Assist** → **Reload**
2. Hard-refresh the tab you are testing (Cmd+R / Ctrl+R)

---

## Test on YouTube

Primary product path — real captioned videos.

1. Complete **Fresh build** and load/reload the extension (above)
2. Open a **captioned** YouTube `/watch` URL
3. Turn **CC** on
4. Click the extension icon → enable **Show ASL assist overlay**
5. Confirm: honesty line (**ASL assist / partial** · pack pending), gloss/fingerspell cues advance with captions, YouTube captions stay on
6. Drag **Move** (or arrow keys) so the overlay does not cover captions

---

## Test on local theater

Offline path — same extension overlay on demo MP4s + VTT. **Not** a YouTube replacement. Still assist/partial only; pack pending; not signing video.

1. Complete **Fresh build** and load/reload the extension (above)
2. In a terminal (leave it open — the server must keep running):

   ```bash
   npm run demo
   ```

   You should see `Local theater (open this URL): http://127.0.0.1:4173/` and the process stays running until you press Ctrl+C.

3. Open **only** `http://127.0.0.1:4173/` in Chrome  
   Do **not** use `http://localhost:4173/` — Chrome treats that as a different origin and the extension will not inject.
4. Pick a clip from the library (watch page = HTML5 video + English captions)
5. Enable **Show ASL assist overlay** → cues should advance with captions
6. Drag **Move** so the overlay does not cover captions

Host permission is pinned: `http://127.0.0.1:4173/*` only. See [`permissions.md`](permissions.md).

---

Both paths use the same content-script overlay. Prefer **YouTube** for real-world validation; prefer **local theater** for quick offline loops (owner, agents, CI, Deaf-user UAT).
