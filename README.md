# ASL YouTube Assist (Phase 1 · Slice A)

Chrome/Edge **Manifest V3** extension that adds an **ASL assist / partial** PiP-style overlay on YouTube watch pages.

**This is not a human interpreter.** Captions remain the reliability floor. No accuracy percentages. No “better than captions” claim until a funded Deaf/HH cohort (AC-1.3/1.4). Conservative gloss + Tier A/B routing (Tier A empty) + eval harness scaffolding ship **without new CapEx**. Lexical + fingerspell scaffolding is in; **approved clip pack is held** pending `docs/asl-clip-sources.md` + coordinator pick (no AI-persona default).

## Workspace paths

| Role                        | Path                                                |
| --------------------------- | --------------------------------------------------- |
| **Project browse / mirror** | `/cursor/stores/self/workspace/asl-youtube-assist/` |
| **Git + npm working tree**  | `/agent/asl-youtube-assist/`                        |

The Project store mount cannot host a real `.git` directory (permission / rename limits). **Local git is initialized and committed on `/agent/asl-youtube-assist`**. Source is mirrored into the Project workspace path for browsing. Prefer the `/agent` path for `git`, `npm install`, `npm test`, and `npm run build`.

Push to Origin/GitHub when ready — remotes are optional today. See `GIT_LOCATION.md` in the store mirror.

## What Slice A includes

| Feature                                                    | Status                                  |
| ---------------------------------------------------------- | --------------------------------------- |
| Sideload MV3 extension (Chrome/Edge)                       | Done                                    |
| Toggle ASL assist overlay on YouTube watch                 | Done                                    |
| Caption floor preserved (never strips CC)                  | Done                                    |
| Sync to caption timestamps when text tracks exist          | Done (best-effort)                      |
| Honest labels: **ASL assist / partial** only               | Done                                    |
| Critical-domain keyword gate stub (disclosed as heuristic) | Done                                    |
| Movable overlay (drag / arrow keys)                        | Done                                    |
| Lexical index + fingerspell OOV scaffolding                | Done                                    |
| Conservative gloss (not English-on-the-hands as ASL)       | Done (Phase 1 · AC-1.1)                 |
| Tier A/B routing UI (Tier A catalog empty / honest)        | Done (Phase 1 · AC-1.2)                 |
| Stitch/timing into caption cue windows                     | Done (thin eng)                         |
| Eval harness scaffolding (`evals/`)                        | Done (Phase 1 · AC-1.5; not Deaf proof) |
| Clip media pack (Deaf-produced / licensed)                 | **Deferred** — CapEx / AC-0.5           |
| Named caption fixtures + sync verification                 | Done                                    |
| Fixture smoke + manual sideload checklist                  | Done                                    |
| Lint, unit tests, CI workflow                              | Done                                    |
| Usefulness-vs-captions / paid Deaf cohort (AC-1.3/1.4)     | Deferred (budget)                       |
| Companion web / store publish / neural / Tier A media      | Out of Slice A                          |

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
7. Confirm **ASL assist / partial**, disclaimer notes **clip pack pending**, gloss/fingerspell cues, captions still work.
8. Drag **Move** (or arrow keys) so the overlay does not cover captions.

Full checklist: [`docs/sideload-checklist.md`](docs/sideload-checklist.md).

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
packages/gloss/          Conservative assist gloss (AC-1.1)
packages/lexical/        Gloss index + playlist (media pack pending)
packages/fingerspell/    OOV letter steps
packages/stitch/         Cue-window timing fit
packages/catalog/        Tier A/B routing (empty Tier A OK)
evals/                   Harness scaffolding (AC-1.5; not Deaf proof)
fixtures/captions/       Named Phase 0 VTTs + sync expected JSON
e2e/extension/           Fixture smoke (no live YouTube)
.github/workflows/pr.yml CI ready for later push
```

## Clip pack hold

Do **not** bind AI-persona video or a specific third-party pack until research + coordinator relay. See `apps/extension/assets/lexical/ATTRIBUTION.md` and Project `internal/deaf-user-review/clip-source-stance.md`.

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

## Critical-domain gate (Slice A stub)

Detection is a **keyword stub** on YouTube title/description tokens (health / legal / safety word lists). It is **not** content understanding — false negatives and false positives are expected. When it matches and no human path exists, unsupervised assist is blocked and the UI says so explicitly (`Keyword stub only — not content understanding.`). Strengthen signals + fixtures before any store/RC; keep the honesty of the blocked copy.

## Labeling rules (stop-ship)

Allowed: **ASL assist / partial**, captions-stay-on language, human interpretation only for real Tier A humans.

Never: AI/digital interpreter for assist, accuracy %, “ASL captions” as the product, fluent-ASL-from-captions claims.

While the clip pack is pending, do not claim Deaf-produced signing video is playing. Keep **ASL assist / partial**.

## License

Proprietary — Sign Language Project. All rights reserved.
