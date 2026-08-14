import { buildFicha } from "./classSystem/buildSheet";
import { capturableCreatures, CapturaAvaliacao } from "./classSystem/capture";
import { CRIATURAS } from "./classSystem/creatures";
import { Ficha } from "./classSystem/types";
import { selectBestiaryCreature, BestiaryMatch } from "./bestiary/select";
import { buildEvolutionChain, EvolutionStep } from "./creatureGen/evolutionChain";
import { generateRookieCreature, RookieCreature } from "./creatureGen/rookie";
import { SoulProfile } from "./profile";

export interface CreatureFicha {
  ficha: Ficha;
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

  const ficha = buildFicha(profile.onboarding.fullName, profile.oracle);

  const catches = capturableCreatures(ficha, CRIATURAS);
  const starterCompanion = catches.length > 0 ? catches[0] : null;

  const bestiaryPick = selectBestiaryCreature(profile.oracle, seedKey);
  const rookie = generateRookieCreature(profile.oracle, bestiaryPick.creature, seedKey);
  const evolutionChain = buildEvolutionChain(rookie, seedKey);

  return { ficha, starterCompanion, bestiaryPick, rookie, evolutionChain };
}
