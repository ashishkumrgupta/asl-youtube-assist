# Manual sideload checklist (AC-0.1 — &lt; 1 minute)

Target: install → toggle ASL assist overlay on a captioned YouTube watch page in under one minute.

1. `cd` to the repo working tree; `npm install && npm run build` (first time only; rebuild after pulls).
2. Chrome/Edge → Extensions → Developer mode → **Load unpacked** → `apps/extension/dist`.
3. Open any **captioned** YouTube `/watch` URL; enable CC if needed.
4. Click the extension icon → enable **Show ASL assist**.
5. Confirm within ~1 minute from step 2:
   - Badge / claim: **ASL assist** / **ASL assist / partial**
   - Always-visible honesty: **Partial · pack pending · not an interpreter** (About has depth)
   - Gloss or fingerspell **cues** advance while CC is on (DOM caption fallback if text tracks empty)
   - YouTube captions remain visible; drag **Move** if overlay covers CC
   - Popup: **Captions stay on** + short status when on
6. Optional: open a title with “medical/legal/safety” keywords → gate stub should block unsupervised assist.

**Owner path (YouTube):** this checklist is the live YouTube sideload. Do not skip it because the local theater exists.

**Owner path (local theater):** `npm run demo` → `http://127.0.0.1:4173/` → same overlay toggle; VTT always on. See [`build-and-reload.md`](build-and-reload.md). Still **not** signing video (pack pending); still **not** a substitute for real YouTube.

**Agents / CI / Deaf-user UAT offline:** theater + `fixtures/demo-videos/` — caption→gloss sync only.

**Not required for this checklist:** approved clip pack playback (held pending coordinator pick).
