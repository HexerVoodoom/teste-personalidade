import { mulberry32, hashString, pick } from "../rng";
import { AlignmentId, ElementId, OracleAxes, RealmId, RoleId } from "../oracle/types";
import { BESTIARY_SEED, BestiaryCreature, BestiaryTamanho } from "./seed";

/**
 * besti-rio-'s `elementos` are class-system element ids (17 base + derived).
 * The oracle scores only the 17 base ids (`classElements`), so a handful of
 * common derived ids a creature might carry are mapped down to the base
 * component(s) they're actually made of, purely for matching purposes here
 * — the creature's own `elementos` field is left untouched.
 */
const DERIVED_TO_BASE: Record<string, string[]> = {
  lava: ["fogo", "terra"],
  veneno: ["agua", "vileza"],
  gelo: ["agua"],
};

function baseElementIds(elementos: string[]): string[] {
  return elementos.flatMap((id) => DERIVED_TO_BASE[id] ?? [id]);
}

/** Soulmon's 8-element vocabulary maps onto a subset of the class-system's
 *  17 — used to translate the oracle's dominant Soulmon element into the
 *  class-system ids besti-rio- actually carries. `sombra`/`luz` are shared
 *  by name; `planta`/`industrial` don't exist as class-system base elements
 *  and fall back to a close relative. */
const ORACLE_ELEMENT_TO_CLASS_SYSTEM: Record<ElementId, string[]> = {
  agua: ["agua"],
  fogo: ["fogo"],
  terra: ["terra"],
  ar: ["ar"],
  sombra: ["sombra"],
  luz: ["luz"],
  planta: ["vida"],
  industrial: ["marcial"],
};

const REALM_TO_FAMILIAS: Record<RealmId, string[]> = {
  deserto: ["besta", "aberracao"],
  picos: ["ave", "gigante", "draconico"],
  oceano: ["aquatica"],
  pantano: ["planta", "aberracao"],
  floresta: ["besta", "planta", "espirito"],
  cavernas: ["morto_vivo", "construto", "demonio"],
  gelo: ["besta", "espirito"],
  campina: ["besta", "ave", "humanoide"],
  akasha: ["espirito", "aberracao", "demonio"],
};

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

  const creatureBaseElements = new Set(baseElementIds(c.elementos));
  const wantedElements = ORACLE_ELEMENT_TO_CLASS_SYSTEM[oracle.dominantElement];
  if (wantedElements.some((e) => creatureBaseElements.has(e))) score += 3;

  if (REALM_TO_FAMILIAS[oracle.dominantRealm].includes(c.familia)) score += 2;

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
