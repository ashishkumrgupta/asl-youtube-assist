# ASL YouTube Assist (Phase 0 · Slice A)

Chrome/Edge **Manifest V3** extension that adds an **ASL assist / partial** PiP-style overlay on YouTube watch pages.

**This is not a human interpreter.** Captions remain the reliability floor. No accuracy percentages. Placeholder signing UI is honest when no clip CDN is configured.

## Workspace paths

| Role | Path |
|---|---|
| **Project browse / mirror** | `/cursor/stores/self/workspace/asl-youtube-assist/` |
| **Git + npm working tree** | `/agent/asl-youtube-assist/` |

The Project store mount cannot host a real `.git` directory (permission / rename limits). **Local git is initialized and committed on `/agent/asl-youtube-assist`**. Source is mirrored into the Project workspace path for browsing. Prefer the `/agent` path for `git`, `npm install`, `npm test`, and `npm run build`.

Push to Origin/GitHub when ready — remotes are optional today. See `GIT_LOCATION.md` in the store mirror.

## What Slice A includes

| Feature                                              | Status                          |
| ---------------------------------------------------- | ------------------------------- |
| Sideload MV3 extension (Chrome/Edge)                 | Done                            |
| Toggle ASL assist overlay on YouTube watch           | Done                            |
| Caption floor preserved (never strips CC)            | Done                            |
| Sync to caption timestamps when text tracks exist    | Done (best-effort)              |
| Honest labels: **ASL assist / partial** only         | Done                            |
| Critical-domain hard gate stub (health/legal/safety) | Done                            |
| Placeholder signing UI (no clip CDN)                 | Done                            |
| Lint, unit tests, CI workflow                        | Done                            |
| Lexical clip CDN / HF dictionary                     | Deferred (Slice C)              |
| Tier A human catalog                                 | Deferred (Phase 1)              |
| Chrome Web Store publish                             | Out of scope                    |
| Neural avatar                                        | Out of scope (flag default off) |

## Quick start (local)

```sh
cd /cursor/stores/self/workspace/asl-youtube-assist
npm install
npm test
npm run build
```

Built unpacked extension: `apps/extension/dist/`

### Sideload (Chrome or Edge)

1. Run `npm run build`.
2. Open `chrome://extensions` (or `edge://extensions`).
3. Enable **Developer mode**.
4. **Load unpacked** → select `apps/extension/dist`.
5. Open a **captioned** YouTube watch URL.
6. Click the extension icon → enable **Show ASL assist overlay**.
7. Confirm the overlay badge says **ASL assist / partial**, and YouTube captions still work.

Permissions used (least privilege):

- `storage` — overlay toggle persistence (session)
- `host_permissions`: `https://www.youtube.com/*`, `https://youtube.com/*`

## Scripts

| Command                | Purpose                                                           |
| ---------------------- | ----------------------------------------------------------------- |
| `npm test`             | Vitest unit tests (labels, sync, flags, critical gate, copy lint) |
| `npm run build`        | Build packages + extension `dist/`                                |
| `npm run lint`         | ESLint (warnings as errors)                                       |
| `npm run typecheck`    | Strict TypeScript project references                              |
| `npm run format:check` | Prettier check                                                    |
| `npm run ci`           | Full local CI gate                                                |

## Repo layout

```
apps/extension/          MV3 background, content, popup
packages/shared-types/   Honesty labels + message types
packages/flags/          Capability feature flags
packages/sync/           Caption clock / lag math
packages/lint-copy/      Banned-term checks for assist copy
packages/critical-gate/  Health/legal/safety hard gate stub
fixtures/captions/       Sample VTT
.github/workflows/pr.yml CI ready for later push
```

## Git remote (add later — not required today)

This repo is initialized **locally**. No Origin/GitHub remote is required to develop or sideload.

When you are ready to push:

```sh
cd /cursor/stores/self/workspace/asl-youtube-assist

# Origin (preferred when available)
git remote add origin https://origin.cursor.com/git/ashish-gupta-f4j90/asl-youtube-assist.git

# Or GitHub
# git remote add origin https://github.com/<owner>/asl-youtube-assist.git

git push -u origin main
```

If the remote does not exist yet, create an empty repo first, then push. See Project note `internal/development/repo-bootstrap.md` for prior remote-create blockers.

## Labeling rules (stop-ship)

Allowed: **ASL assist / partial**, captions-stay-on language, human interpretation only for real Tier A humans.

Never: AI/digital interpreter for assist, accuracy %, “ASL captions” as the product, fluent-ASL-from-captions claims.

## License

Proprietary — Sign Language Project. All rights reserved.
