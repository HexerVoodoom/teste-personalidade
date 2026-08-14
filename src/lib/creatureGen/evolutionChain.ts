import { hashString, mulberry32, pick } from "../rng";
import { RookieCreature } from "./rookie";

/**
 * Sprite-prompt chain, ported from `soulmon/src/utils/spritePrompts.ts`
 * (`buildSpritePromptChain`) — the actual chaining rule Soulmon uses for the
 * stages beyond rookie: each stage's prompt says to evolve the *previous
 * stage's image* (`referenceStageIds`), not to describe the creature from
 * scratch, so visual identity carries forward through an image-to-image
 * pipeline. Only rookie was asked for originally; this is the natural
 * follow-up for debugging what the later stages would look like, without
 * committing to running the actual image generation.
 */

export type Branch = "virus" | "data" | "vaccine";

/** Copied verbatim from `spritePrompts.ts` — visual traits sampled per branch. */
export const BRANCH_TRAIT_POOL: Record<Branch, string[]> = {
  virus: [
    "fierce power aura, jagged dark-green energy",
    "sharper claws and horns, predatory stance",
    "crackling wild energy, untamed power",
  ],
  data: [
    "serene digital glyphs orbiting the body, balanced geometry",
    "crystalline blue circuits woven into the form",
    "calm flowing lines, harmonic symmetry",
  ],
  vaccine: [
    "warm golden halo, gentle guardian presence",
    "soft radiant wings of light",
    "protective golden ornaments, kind eyes",
  ],
};

/**
 * Every non-rookie stage restates the rookie's own pixel-art style block
 * (not a separate, drifted style description) plus an explicit emphasis
 * sentence — these stages chain through image-to-image
 * (`referenceStageIds`), and a generator following a reference image is
 * especially prone to drifting away from a style that isn't restated on
 * every single step.
 */
function styleReminder(rookie: RookieCreature): string {
  return (
    `${rookie.styleBlock} ` +
    `CRITICAL: this exact pixel-art style must persist unchanged through every evolution stage — ` +
    `do not shift art style, medium, shading technique, or level of detail, even as the creature ` +
    `grows larger and more powerful.`
  );
}

export interface EvolutionStep {
  stageId: string;
  referenceStageIds: string[];
  prompt: string;
}

/**
 * Builds the full rookie → champion → ultimate → mega → ultra chain (3
 * branches — Vírus/Data/Vacina, matching the oracle's `AlignmentId`s — that
 * fuse into one Ultra), text-only. No image is actually generated here; each
 * step's prompt is meant to be fed, together with the previous step's
 * generated image, to whatever image-to-image tool Soulmon eventually wires
 * up — same contract as `spritePrompts.ts`.
 */
export function buildEvolutionChain(rookie: RookieCreature, seedKey: string): EvolutionStep[] {
  const rng = mulberry32(hashString(`${seedKey}|evolution`));
  const baseDescription = `${rookie.archetype.phrase.en} ${rookie.name}, inspired by ${rookie.inspiredBy}`;
  const steps: EvolutionStep[] = [];

  steps.push({
    stageId: "rookie",
    referenceStageIds: [],
    prompt: rookie.imagePrompt,
  });

  const BRANCHES: Branch[] = ["virus", "data", "vaccine"];
  for (const b of BRANCHES) {
    const champTrait = pick(rng, BRANCH_TRAIT_POOL[b]);
    steps.push({
      stageId: `champion-${b}`,
      referenceStageIds: ["rookie"],
      prompt:
        `Evolve the creature in the reference image into its next, more developed form. ` +
        `Keep its visual identity, colors and species traits, but make it visibly stronger, ` +
        `larger and more mature. Add: ${champTrait}. ${baseDescription}. ${styleReminder(rookie)}`,
    });
    steps.push({
      stageId: `ultimate-${b}`,
      referenceStageIds: [`champion-${b}`],
      prompt:
        `Evolve the creature in the reference image into its next, clearly superior form. ` +
        `Same identity, but more imposing, more detailed and more powerful than the reference. ` +
        `Amplify: ${pick(rng, BRANCH_TRAIT_POOL[b])}. ${baseDescription}. ${styleReminder(rookie)}`,
    });
    steps.push({
      stageId: `mega-${b}`,
      referenceStageIds: [`ultimate-${b}`],
      prompt:
        `Evolve the creature in the reference image into its final, fully realized mega form. ` +
        `Preserve identity, but push scale, presence and ornamentation to the maximum. ` +
        `Crown it with: ${pick(rng, BRANCH_TRAIT_POOL[b])}. ${baseDescription}. ${styleReminder(rookie)}`,
    });
  }

  steps.push({
    stageId: "ultra",
    referenceStageIds: ["mega-virus", "mega-data", "mega-vaccine"],
    prompt:
      `Fuse the THREE creatures in the reference images into a single transcendent ultra form. ` +
      `The result must clearly combine defining traits of all three references — power, harmony ` +
      `and benevolence united — as an evolved, more developed being beyond any of them. ` +
      `${baseDescription}. ${styleReminder(rookie)}`,
  });

  return steps;
}
