/**
 * Phase 0 lexical index (small) — gloss lookup only.
 * Media binding is separate (`clip-source.ts`) and pending coordinator pick.
 */

export interface LexicalEntry {
  readonly gloss: string;
  /** Relative media path when pack loaded; ignored while pending. */
  readonly assetPath: string;
  readonly durationMs: number;
  readonly forms: readonly string[];
}

/** Small high-frequency MVP index (~50 glosses) for fixtures / demo captions. */
export const LEXICAL_ENTRIES: readonly LexicalEntry[] = [
  {
    gloss: "HELLO",
    assetPath: "lexical/clips/HELLO.webm",
    durationMs: 900,
    forms: ["hello", "hi", "hey"],
  },
  {
    gloss: "THANKS",
    assetPath: "lexical/clips/THANKS.webm",
    durationMs: 900,
    forms: ["thanks", "thank", "thankful"],
  },
  {
    gloss: "YES",
    assetPath: "lexical/clips/YES.webm",
    durationMs: 700,
    forms: ["yes", "yeah", "yep"],
  },
  {
    gloss: "NO",
    assetPath: "lexical/clips/NO.webm",
    durationMs: 700,
    forms: ["no", "nope"],
  },
  {
    gloss: "PLEASE",
    assetPath: "lexical/clips/PLEASE.webm",
    durationMs: 900,
    forms: ["please"],
  },
  {
    gloss: "SORRY",
    assetPath: "lexical/clips/SORRY.webm",
    durationMs: 900,
    forms: ["sorry"],
  },
  {
    gloss: "GOOD",
    assetPath: "lexical/clips/GOOD.webm",
    durationMs: 800,
    forms: ["good", "great", "nice"],
  },
  { gloss: "BAD", assetPath: "lexical/clips/BAD.webm", durationMs: 800, forms: ["bad"] },
  {
    gloss: "FRIEND",
    assetPath: "lexical/clips/FRIEND.webm",
    durationMs: 900,
    forms: ["friend", "friends"],
  },
  {
    gloss: "FAMILY",
    assetPath: "lexical/clips/FAMILY.webm",
    durationMs: 900,
    forms: ["family"],
  },
  {
    gloss: "LOVE",
    assetPath: "lexical/clips/LOVE.webm",
    durationMs: 900,
    forms: ["love", "loved", "loves"],
  },
  {
    gloss: "WANT",
    assetPath: "lexical/clips/WANT.webm",
    durationMs: 800,
    forms: ["want", "wanna", "wants"],
  },
  {
    gloss: "NEED",
    assetPath: "lexical/clips/NEED.webm",
    durationMs: 800,
    forms: ["need", "needs", "needed"],
  },
  {
    gloss: "GO",
    assetPath: "lexical/clips/GO.webm",
    durationMs: 700,
    forms: ["go", "going", "goes", "went"],
  },
  {
    gloss: "COME",
    assetPath: "lexical/clips/COME.webm",
    durationMs: 700,
    forms: ["come", "coming", "came"],
  },
  {
    gloss: "SEE",
    assetPath: "lexical/clips/SEE.webm",
    durationMs: 700,
    forms: ["see", "seeing", "saw", "seen"],
  },
  {
    gloss: "LOOK",
    assetPath: "lexical/clips/LOOK.webm",
    durationMs: 700,
    forms: ["look", "looking", "looks"],
  },
  {
    gloss: "HELP",
    assetPath: "lexical/clips/HELP.webm",
    durationMs: 800,
    forms: ["help", "helps", "helping"],
  },
  {
    gloss: "KNOW",
    assetPath: "lexical/clips/KNOW.webm",
    durationMs: 800,
    forms: ["know", "knows", "knew", "known"],
  },
  {
    gloss: "THINK",
    assetPath: "lexical/clips/THINK.webm",
    durationMs: 800,
    forms: ["think", "thinking", "thinks"],
  },
  {
    gloss: "UNDERSTAND",
    assetPath: "lexical/clips/UNDERSTAND.webm",
    durationMs: 1000,
    forms: ["understand", "understood"],
  },
  {
    gloss: "LEARN",
    assetPath: "lexical/clips/LEARN.webm",
    durationMs: 900,
    forms: ["learn", "learning", "learns"],
  },
  {
    gloss: "TEACH",
    assetPath: "lexical/clips/TEACH.webm",
    durationMs: 900,
    forms: ["teach", "teaching", "teaches"],
  },
  {
    gloss: "WORK",
    assetPath: "lexical/clips/WORK.webm",
    durationMs: 800,
    forms: ["work", "working", "works"],
  },
  {
    gloss: "PLAY",
    assetPath: "lexical/clips/PLAY.webm",
    durationMs: 800,
    forms: ["play", "playing", "plays"],
  },
  {
    gloss: "EAT",
    assetPath: "lexical/clips/EAT.webm",
    durationMs: 800,
    forms: ["eat", "eating", "eats", "ate"],
  },
  {
    gloss: "DRINK",
    assetPath: "lexical/clips/DRINK.webm",
    durationMs: 800,
    forms: ["drink", "drinking", "drinks"],
  },
  {
    gloss: "HOME",
    assetPath: "lexical/clips/HOME.webm",
    durationMs: 800,
    forms: ["home"],
  },
  {
    gloss: "SCHOOL",
    assetPath: "lexical/clips/SCHOOL.webm",
    durationMs: 900,
    forms: ["school"],
  },
  {
    gloss: "TIME",
    assetPath: "lexical/clips/TIME.webm",
    durationMs: 800,
    forms: ["time", "times"],
  },
  {
    gloss: "DAY",
    assetPath: "lexical/clips/DAY.webm",
    durationMs: 700,
    forms: ["day", "days"],
  },
  {
    gloss: "NIGHT",
    assetPath: "lexical/clips/NIGHT.webm",
    durationMs: 700,
    forms: ["night", "nights"],
  },
  { gloss: "NOW", assetPath: "lexical/clips/NOW.webm", durationMs: 700, forms: ["now"] },
  {
    gloss: "LATER",
    assetPath: "lexical/clips/LATER.webm",
    durationMs: 800,
    forms: ["later"],
  },
  {
    gloss: "TODAY",
    assetPath: "lexical/clips/TODAY.webm",
    durationMs: 800,
    forms: ["today"],
  },
  {
    gloss: "TOMORROW",
    assetPath: "lexical/clips/TOMORROW.webm",
    durationMs: 900,
    forms: ["tomorrow"],
  },
  {
    gloss: "YESTERDAY",
    assetPath: "lexical/clips/YESTERDAY.webm",
    durationMs: 900,
    forms: ["yesterday"],
  },
  {
    gloss: "WHAT",
    assetPath: "lexical/clips/WHAT.webm",
    durationMs: 700,
    forms: ["what"],
  },
  {
    gloss: "WHERE",
    assetPath: "lexical/clips/WHERE.webm",
    durationMs: 700,
    forms: ["where"],
  },
  { gloss: "WHO", assetPath: "lexical/clips/WHO.webm", durationMs: 700, forms: ["who"] },
  { gloss: "WHY", assetPath: "lexical/clips/WHY.webm", durationMs: 700, forms: ["why"] },
  { gloss: "HOW", assetPath: "lexical/clips/HOW.webm", durationMs: 700, forms: ["how"] },
  {
    gloss: "MORE",
    assetPath: "lexical/clips/MORE.webm",
    durationMs: 700,
    forms: ["more"],
  },
  {
    gloss: "FINISH",
    assetPath: "lexical/clips/FINISH.webm",
    durationMs: 800,
    forms: ["finish", "finished", "done"],
  },
  {
    gloss: "START",
    assetPath: "lexical/clips/START.webm",
    durationMs: 800,
    forms: ["start", "starting", "starts", "begin"],
  },
  {
    gloss: "STOP",
    assetPath: "lexical/clips/STOP.webm",
    durationMs: 700,
    forms: ["stop", "stopped", "stops"],
  },
  {
    gloss: "WELCOME",
    assetPath: "lexical/clips/WELCOME.webm",
    durationMs: 900,
    forms: ["welcome"],
  },
  {
    gloss: "NAME",
    assetPath: "lexical/clips/NAME.webm",
    durationMs: 800,
    forms: ["name", "names"],
  },
  {
    gloss: "ME",
    assetPath: "lexical/clips/ME.webm",
    durationMs: 600,
    forms: ["me", "i", "my", "mine"],
  },
  {
    gloss: "YOU",
    assetPath: "lexical/clips/YOU.webm",
    durationMs: 600,
    forms: ["you", "your", "yours"],
  },
  {
    gloss: "WE",
    assetPath: "lexical/clips/WE.webm",
    durationMs: 600,
    forms: ["we", "us", "our"],
  },
  {
    gloss: "DEMO",
    assetPath: "lexical/clips/DEMO.webm",
    durationMs: 900,
    forms: ["demo", "demonstration"],
  },
  {
    gloss: "CAPTION",
    assetPath: "lexical/clips/CAPTION.webm",
    durationMs: 900,
    forms: ["caption", "captions"],
  },
  { gloss: "ASL", assetPath: "lexical/clips/ASL.webm", durationMs: 800, forms: ["asl"] },
  {
    gloss: "ASSIST",
    assetPath: "lexical/clips/ASSIST.webm",
    durationMs: 900,
    forms: ["assist", "assistance"],
  },
  {
    gloss: "PARTIAL",
    assetPath: "lexical/clips/PARTIAL.webm",
    durationMs: 900,
    forms: ["partial"],
  },
] as const;

export function buildLookup(
  entries: readonly LexicalEntry[] = LEXICAL_ENTRIES,
): ReadonlyMap<string, LexicalEntry> {
  const map = new Map<string, LexicalEntry>();
  for (const entry of entries) {
    for (const form of entry.forms) {
      map.set(form.toLowerCase(), entry);
    }
    map.set(entry.gloss.toLowerCase(), entry);
  }
  return map;
}

export const LEXICAL_LOOKUP = buildLookup();

export function lexicalPackSize(): number {
  return LEXICAL_ENTRIES.length;
}
