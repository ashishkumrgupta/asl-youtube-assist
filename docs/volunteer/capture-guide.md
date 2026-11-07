# Volunteer capture guide (citation clips)

**Goal:** Short, clear ASL citation clips for the assist overlay — **not** fluent discourse interpretation.

## Framing

- Camera facing **front**: torso + face visible
- Plain / uncluttered background
- Good lighting on hands and face
- Neutral clothing that contrasts with hands

## Timing & format

- **≤ 2–3 seconds** per gloss (citation form)
- One gloss per file
- Prefer **WebM** (VP8/VP9) or MP4 (H.264); 720p is enough
- Filename: `<GLOSS>.webm` (e.g. `HELLO.webm`) matching the HF shortlist gloss ID

## Gloss IDs

Start from the extension HF shortlist in `@asl/lexical` (`LEXICAL_ENTRIES` — ~50 lemmas such as HELLO, THANKS, YES, NO, PLEASE, …).  
Business assigns the gloss list per contributor; do not invent IDs.

## What we are not asking for

- Long sentences or storytelling (discourse)
- Fingerspelling entire English sentences as “ASL”
- Any claim that the clip is interpreter-grade

## After capture

1. Signed **release** on file (`docs/volunteer/clip-release.md`) — product+cache or link-only
2. Tech check (framing, length, format)
3. **Deaf QA** pass/fail logged per gloss (`apps/extension/assets/lexical/ase/qa/volunteer-qa-log.json`)
4. Credits string confirmed (`CREDITS.json`)
5. Ingest with provenance `volunteer` only when release **and** QA pass

Until those land, the pack stays **pending** and the UI uses gloss/fingerspell fallback with “No clip for this sign.”
