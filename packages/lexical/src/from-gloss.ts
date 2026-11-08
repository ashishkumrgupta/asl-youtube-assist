import { fingerspellToken } from "@asl/fingerspell";
import { isEnabled } from "@asl/flags";
import type { GlossResult } from "@asl/gloss";
import { CLIP_PACK_MANIFEST, clipPackIsPending } from "./clip-source.js";
import { LEXICAL_LOOKUP } from "./dictionary.js";
import { resolveMediaForGloss } from "./dual-path.js";
import type {
  AssistPlaylistStep,
  PlaylistBuildResult,
  PlaylistMediaOptions,
} from "./playlist.js";

/**
 * Build playlist from conservative gloss tokens (Phase 1) instead of raw English order.
 * Dual-path: prefer real → AI (flagged) → remote → cues. Never invent local files.
 */
export function buildPlaylistFromGloss(
  gloss: GlossResult,
  mediaOptions?: PlaylistMediaOptions,
): PlaylistBuildResult {
  const packPending = clipPackIsPending(CLIP_PACK_MANIFEST);
  const packLoaded = !packPending;
  const aiFlagEnabled =
    mediaOptions?.aiFlagEnabled ?? isEnabled("local", "assist.ai_generated.v1");
  const steps: AssistPlaylistStep[] = [];
  let lexicalHits = 0;
  let fingerspellTokens = 0;

  for (const token of gloss.tokens) {
    const entry = LEXICAL_LOOKUP.get(token.surface);
    if (entry) {
      lexicalHits += 1;
      const resolved = resolveMediaForGloss(entry.gloss, {
        aiFlagEnabled,
        allowTestOnlyAi: mediaOptions?.allowTestOnlyAi ?? false,
      });
      const assetPath =
        resolved.kind === "real" || resolved.kind === "ai_generated"
          ? resolved.assetPath
          : null;
      steps.push({
        kind: "lexical",
        gloss: entry.gloss,
        assetPath,
        remoteUrl: resolved.remoteUrl,
        noClipFallback: resolved.noClipFallback,
        mediaKind: resolved.kind,
        mediaProvenance: resolved.provenance,
        honestyShortTag: resolved.honestyShortTag,
        stageHint: resolved.stageHint,
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
