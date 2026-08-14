import { hashString, mulberry32, pick } from "../rng";
import { OracleAxes } from "../oracle/types";
import { BestiaryCreature } from "../bestiary/seed";
import {
  ADJECTIVES_BY_ELEMENT, ADJECTIVES_BY_ROLE, ALIGNMENT_ACCENT, BODY_PLANS,
  ELEMENT_PALETTES, FAMILIA_FEATURES, LText, NOUNS_BY_ELEMENT, ROOKIE_LOOK,
} from "./wordbanks";

/**
 * Image-prompt composer, copied verbatim from `soulmon/src/utils/oracle.ts`
 * (`composeSpritePrompt`). This is the actual "prompt base" the generation
 * pipeline is built on — reused as-is rather than paraphrased, so a rookie
 * generated here matches the visual contract Soulmon already uses.
 */
function composeSpritePrompt(args: {
  concept: string; colorDesc: string; accent: string; levelBlock: string; favoriteCreature?: string;
}): string {
  const concept = args.favoriteCreature ? `${args.favoriteCreature} ${args.concept}` : args.concept;
  return (
    `Generate an original creature for a monster-raising RPG. Do not copy any ` +
    `existing franchise character. ` +
    `Retro virtual-pet sprite, 16x16 pixel art, no background, transparent background: ` +
    `${concept}. ${args.levelBlock}. ` +
    `Flat ${args.colorDesc} colors with ${args.accent} accents, no shading, no outlines, no anti-aliasing. ` +
    `Do not tint the whole creature in a single hue — use clearly distinct colors. ` +
    `Grayscale/black-and-white is acceptable.`
  );
}

/**
 * The style-only portion of `composeSpritePrompt`'s contract (same rules,
 * restated as a standalone sentence instead of interleaved around the
 * concept) — reused verbatim by `evolutionChain.ts` so every later stage
 * (champion/ultimate/mega/ultra) states the exact same pixel-art rules the
 * rookie prompt uses, instead of a different, drifted style description.
 * Evolution stages chain through image-to-image (`referenceStageIds`), where
 * a generator following the reference image is especially prone to drifting
 * away from a style that isn't restated every step.
 */
export function styleBlock(colorDesc: string, accent: string): string {
  return (
    `Retro virtual-pet sprite, 16x16 pixel art, no background, transparent background. ` +
    `Flat ${colorDesc} colors with ${accent} accents, no shading, no outlines, no anti-aliasing. ` +
    `Do not tint the whole creature in a single hue — use clearly distinct colors. ` +
    `Grayscale/black-and-white is acceptable.`
  );
}

export interface RookieCreature {
  name: string;
  archetype: { noun: LText; adjectives: [LText, LText]; phrase: LText };
  bio: LText;
  imagePrompt: string;
  /** The besti-rio- creature used as species inspiration for this rookie —
   *  not a copy, just a seed the prompt nods to (same role `favoriteCreature`
   *  plays in Soulmon's own onboarding). */
  inspiredBy: string;
  /** This rookie's exact style-block text (`styleBlock()` above) — carried
   *  forward by `evolutionChain.ts` so every evolution stage keeps the same
   *  palette/accent identity, not just the same style rules. */
  styleBlock: string;
}

/**
 * Generates a brand-new ROOKIE-stage creature only — Soulmon's full oracle
 * also produces 3 evolution branches × 3 later stages plus a fusion Ultra,
 * none of which are built here since only the rookie stage was asked for.
 * The naming/family/fusion machinery behind those later stages is ~2000
 * lines in `oracle.ts` and is intentionally not ported; this function reuses
 * the smaller word banks (`wordbanks.ts`) and the real `composeSpritePrompt`
 * contract, scoped down to what a rookie needs.
 */
export function generateRookieCreature(
  oracle: OracleAxes,
  bestiaryPick: BestiaryCreature,
  seedKey: string
): RookieCreature {
  const rng = mulberry32(hashString(`${seedKey}|rookie`));

  const noun = pick(rng, NOUNS_BY_ELEMENT[oracle.dominantElement]);
  const adjRole = pick(rng, ADJECTIVES_BY_ROLE[oracle.dominantRole]);
  const adjElement = pick(rng, ADJECTIVES_BY_ELEMENT[oracle.dominantElement]);
  const archetype = {
    noun,
    adjectives: [adjRole, adjElement] as [LText, LText],
    phrase: {
      pt: `${noun.pt} ${adjRole.pt} e ${adjElement.pt}`,
      en: `${adjRole.en} and ${adjElement.en} ${noun.en}`,
    },
  };

  const palette = pick(rng, ELEMENT_PALETTES[oracle.dominantElement]);
  const colorDesc = palette.replace(/\s*color palette\s*$/i, "");
  const accent = ALIGNMENT_ACCENT[oracle.dominantAlignment];
  const levelBlock = pick(rng, ROOKIE_LOOK);

  const stem = noun.en.replace(/[^a-z]/gi, "").slice(0, 4).toLowerCase();
  const name = `${stem.charAt(0).toUpperCase()}${stem.slice(1)}mon`;

  const bio: LText = {
    pt: `${name} nasceu do arquétipo do(a) ${archetype.phrase.pt}, inspirado(a) em ${bestiaryPick.nome} do bestiário. Forma rookie: pequeno(a) e simples, mas já ${adjElement.pt}. Função ${oracle.dominantRole}, alinhamento ${oracle.dominantAlignment}.`,
    en: `${name} was born from the archetype of the ${archetype.phrase.en}, inspired by the bestiary's ${bestiaryPick.nome}. Rookie form: small and simple, but already ${adjElement.en}. Role: ${oracle.dominantRole}. Alignment: ${oracle.dominantAlignment}.`,
  };

  // The creature-definition part of the prompt (concept) is built from real,
  // specific ingredients instead of a generic "X-like creature" label: a
  // body-plan silhouette, a concrete visual feature drawn from the bestiary
  // pick's own family (so "inspired by" shows up as an actual trait, not
  // just a name-drop in the bio text), and the archetype phrase. The STYLE
  // block below (pixel-art, no shading, flat colors) is untouched — only the
  // part that defines what the creature actually looks like changed.
  const bodyPlan = pick(rng, BODY_PLANS);
  const feature = pick(rng, FAMILIA_FEATURES[bestiaryPick.familia] ?? FAMILIA_FEATURES.besta);
  const concept = `${noun.en}-inspired creature with a ${bodyPlan} and ${feature}, ${archetype.phrase.en}`;

  const imagePrompt = composeSpritePrompt({
    concept,
    colorDesc,
    accent,
    levelBlock,
  });

  return { name, archetype, bio, imagePrompt, inspiredBy: bestiaryPick.nome, styleBlock: styleBlock(colorDesc, accent) };
}
