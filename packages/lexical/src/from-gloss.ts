import { fingerspellToken } from "@asl/fingerspell";
import type { GlossResult } from "@asl/gloss";
import { CLIP_PACK_MANIFEST, clipPackIsPending } from "./clip-source.js";
import { LEXICAL_LOOKUP } from "./dictionary.js";
import type { AssistPlaylistStep, PlaylistBuildResult } from "./playlist.js";

/**
 * Build playlist from conservative gloss tokens (Phase 1) instead of raw English order.
 */
export function buildPlaylistFromGloss(gloss: GlossResult): PlaylistBuildResult {
  const packPending = clipPackIsPending(CLIP_PACK_MANIFEST);
  const packLoaded = !packPending;
  const steps: AssistPlaylistStep[] = [];
  let lexicalHits = 0;
  let fingerspellTokens = 0;

  for (const token of gloss.tokens) {
    const entry = LEXICAL_LOOKUP.get(token.surface);
    if (entry) {
      lexicalHits += 1;
      steps.push({
        kind: "lexical",
        gloss: entry.gloss,
        assetPath: packLoaded ? entry.assetPath : null,
        durationMs: entry.durationMs,
        surface: token.surface,
      });
      continue;
    }
    const fs = fingerspellToken(token.surface, 450, packLoaded);
    if (fs.length > 0) {
      fingerspellTokens += 1;
      steps.push(...fs);
    }
  }

  return {
    steps,
    lexicalHits,
    fingerspellTokens,
    skippedStopwords: gloss.droppedCount,
    clipPackPending: packPending,
  };
}
