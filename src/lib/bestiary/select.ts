import { mulberry32, hashString, pick } from "../rng";
import { AlignmentId, ElementId, OracleAxes, RealmId, RoleId } from "../oracle/types";
import { BESTIARY_SEED, BestiaryCreature, BestiaryTamanho } from "./seed";

const ELEMENT_TO_TAGS: Record<ElementId, string[]> = {
  agua: ["Elemental de Água", "Aquático"],
  fogo: ["Elemental de Fogo", "Elemental de Lava"],
  terra: ["Elemental de Terra"],
  ar: ["Elemental de Vento", "Alado"],
  sombra: ["Elemental Sombrio"],
  luz: ["Elemental de Luz"],
  planta: ["Planta"],
  industrial: ["Alienígena/Cósmico", "Geleia/Slime"],
};

const REALM_TO_BIOMAS: Record<RealmId, string[]> = {
  deserto: ["Deserto", "Savana"],
  picos: ["Montanha", "Céus"],
  oceano: ["Oceano", "Abissal", "Água"],
  pantano: ["Pântano"],
  floresta: ["Floresta", "Floresta Tropical"],
  cavernas: ["Caverna", "Subterrâneo", "Masmorra", "Submundo", "Ruínas"],
  gelo: ["Montanha", "Espaço"],
  campina: ["Planície", "Urbano"],
  akasha: ["Espaço", "Ruínas", "Mundo Digital"],
};

/** Alignment leans the acceptable hostility band: poder skews aggressive,
 *  benevolência skews gentle, harmonia sits in the middle. */
const ALIGNMENT_TO_HOSTILIDADE: Record<AlignmentId, [number, number]> = {
  poder: [6, 10],
  harmonia: [3, 8],
  benevolencia: [1, 6],
};

const ROLE_TO_TAMANHOS: Record<RoleId, BestiaryTamanho[]> = {
  tanque: ["Grande", "Enorme", "Colossal"],
  fisico: ["Médio", "Grande", "Enorme"],
  magico: ["Miúdo", "Pequeno", "Médio", "Grande", "Enorme", "Colossal"],
  suporte: ["Miúdo", "Pequeno", "Médio"],
  alcance: ["Pequeno", "Médio", "Grande"],
};

export interface BestiaryMatch {
  creature: BestiaryCreature;
  score: number;
}

function scoreCreature(c: BestiaryCreature, oracle: OracleAxes): number {
  let score = 0;
  const elementTags = ELEMENT_TO_TAGS[oracle.dominantElement];
  if (c.tags.some((t) => elementTags.includes(t))) score += 3;

  const biomas = REALM_TO_BIOMAS[oracle.dominantRealm];
  if (c.bioma.some((b) => biomas.includes(b)) || c.bioma.includes("Qualquer")) score += 2;

  const [lo, hi] = ALIGNMENT_TO_HOSTILIDADE[oracle.dominantAlignment];
  if (c.hostilidade >= lo && c.hostilidade <= hi) score += 2;

  if (ROLE_TO_TAMANHOS[oracle.dominantRole].includes(c.tamanho)) score += 1;

  return score;
}

/**
 * Selects a bestiary creature "coherently but with a random factor": scores
 * every candidate against the oracle's dominant axes, narrows to the
 * top-scoring band (creatures within 1 point of the best score — the
 * "range" that's a defensible match, not just the single best), then makes
 * a seeded pick from that band. The seed comes from the user's own input, so
 * the same person always gets the same creature, but two different people
 * with a similarly-scoring band can land on different ones.
 */
export function selectBestiaryCreature(
  oracle: OracleAxes,
  seedKey: string,
  pool: readonly BestiaryCreature[] = BESTIARY_SEED
): BestiaryMatch {
  const scored = pool.map((creature) => ({ creature, score: scoreCreature(creature, oracle) }));
  const best = Math.max(...scored.map((s) => s.score));
  const band = scored.filter((s) => s.score >= best - 1);
  const rng = mulberry32(hashString(`${seedKey}|bestiary`));
  return pick(rng, band);
}
