# Manual sideload checklist (AC-0.1 — &lt; 1 minute)

Target: install → toggle ASL assist overlay on a captioned YouTube watch page in under one minute.

1. `cd` to the repo working tree; `npm install && npm run build` (first time only; rebuild after pulls).
2. Chrome/Edge → Extensions → Developer mode → **Load unpacked** → `apps/extension/dist`.
3. Open any **captioned** YouTube `/watch` URL; enable CC if needed.
4. Click the extension icon → enable **Show ASL assist overlay**.
5. Confirm within ~1 minute from step 2:
   - Badge / claim: **ASL assist / partial**
   - Disclaimer mentions lexical/fingerspell and **clip pack pending** (no interpreter / no %)
   - Gloss or fingerspell **cues** appear synced to caption windows when text tracks exist
   - YouTube captions remain visible; drag **Move** if overlay covers CC
6. Optional: open a title with “medical/legal/safety” keywords → gate stub should block unsupervised assist and disclose keyword heuristic.

**Not required for this checklist:** approved HF clip pack playback (held pending coordinator pick).
