import { buildFicha, FICHA_STAGE_ORDER, FichaStage } from "./classSystem/buildSheet";
import { CapturaAvaliacao, selectCompanion } from "./classSystem/capture";
import { CRIATURAS } from "./classSystem/creatures";
import { Ficha } from "./classSystem/types";
import { selectBestiaryCreature, BestiaryMatch } from "./bestiary/select";
import { buildEvolutionChain, EvolutionStep } from "./creatureGen/evolutionChain";
import { generateRookieCreature, RookieCreature } from "./creatureGen/rookie";
import { SoulProfile } from "./profile";

export interface CreatureFicha {
  /** Alias for `fichaByStage.rookie` — kept for existing callers. */
  ficha: Ficha;
  /** The same character sheet at every evolution stage, budget scaled up
   *  per `STAGE_MULTIPLIER` — same points-distribution logic, just more of
   *  it, so a champion/ultimate/mega/ultra sheet reads as more advanced,
   *  not just re-flavored. */
  fichaByStage: Record<FichaStage, Ficha>;
  starterCompanion: CapturaAvaliacao | null;
  bestiaryPick: BestiaryMatch;
  rookie: RookieCreature;
  /** Rookie → champion → ultimate → mega → ultra prompt chain (text only,
   *  no image is actually generated) — see `evolutionChain.ts`. */
  evolutionChain: EvolutionStep[];
}

/**
 * End-to-end pipeline requested for testing the oracle: onboarding answers
 * → class-system character sheet (points in every section) → a bestiário
 * creature the answers point to (coherent range + a seeded random pick
 * within it) → a Soulmon-style rookie-only prompt for a brand-new creature,
 * inspired by (not copied from) that bestiário pick.
 */
export function buildCreatureFicha(profile: SoulProfile): CreatureFicha {
  const seedKey = [
    profile.onboarding.fullName.trim().toLowerCase(),
    profile.onboarding.birthDate,
    profile.onboarding.birthTime,
    profile.onboarding.placeLabel,
  ].join("|");

  const fichaByStage = Object.fromEntries(
    FICHA_STAGE_ORDER.map((stage) => [stage, buildFicha(profile.onboarding.fullName, profile.oracle, stage, seedKey)])
  ) as Record<FichaStage, Ficha>;
  const ficha = fichaByStage.rookie;

  const starterCompanion = selectCompanion(ficha, CRIATURAS, seedKey);

  const bestiaryPick = selectBestiaryCreature(profile.oracle, seedKey);
  const rookie = generateRookieCreature(profile.oracle, bestiaryPick.creature, seedKey);
  const evolutionChain = buildEvolutionChain(rookie, seedKey);

  return { ficha, fichaByStage, starterCompanion, bestiaryPick, rookie, evolutionChain };
}
