import { CriaturaDef } from "./types";
import { Ficha } from "./types";
import { hashString, mulberry32, pick } from "../rng";

/**
 * Capture formula, copied verbatim from
 * `class-system/src/engine/evocacao.ts` (`poderCaptura`/`avaliarCaptura`),
 * minus the `instinto_de_caca` talent bonus — that talent has an escola
 * prerequisite a rookie sheet can't reach, so it's always 0 at this stage.
 */
const CAPTURA_BASE = 8;
const CAPTURA_POR_NIVEL_ELEMENTO = 4;
const CAPTURA_POR_EVOCACAO = 3;

export function poderCaptura(ficha: Ficha, criatura: CriaturaDef): number {
  const nivelAfinidade = Math.max(0, ...criatura.afinidades.map((e) => ficha.elementos[e] ?? 0));
  if (nivelAfinidade <= 0) return 0;
  const evocacao = ficha.escolas.evocacao ?? 0;
  return CAPTURA_BASE + CAPTURA_POR_NIVEL_ELEMENTO * nivelAfinidade + CAPTURA_POR_EVOCACAO * evocacao;
}

export interface CapturaAvaliacao {
  criatura: CriaturaDef;
  capturavel: boolean;
  poder: number;
}

export function avaliarCaptura(ficha: Ficha, criatura: CriaturaDef): CapturaAvaliacao {
  if ((ficha.escolas.evocacao ?? 0) <= 0) {
    return { criatura, capturavel: false, poder: 0 };
  }
  const temAfinidade = criatura.afinidades.some((e) => (ficha.elementos[e] ?? 0) > 0);
  if (!temAfinidade) return { criatura, capturavel: false, poder: 0 };
  const poder = poderCaptura(ficha, criatura);
  return { criatura, capturavel: poder >= criatura.poderBase, poder };
}

/** Every creature the sheet can capture today, sorted by poderBase descending
 *  (the "best" catch first). */
export function capturableCreatures(ficha: Ficha, registry: Record<string, CriaturaDef>): CapturaAvaliacao[] {
  return Object.values(registry)
    .map((cr) => avaliarCaptura(ficha, cr))
    .filter((a) => a.capturavel)
    .sort((a, b) => b.criatura.poderBase - a.criatura.poderBase);
}

/**
 * Picks the sheet's starter companion from every creature it can legally
 * capture today — a seeded pick across the whole capturable pool, not
 * always `capturableCreatures()[0]` (the single strongest catch). Always
 * returning the strongest meant that, out of the class-system's 32-creature
 * registry, only 9 ever actually showed up as anyone's companion across a
 * simulated spread of profiles: whichever creature had the highest
 * `poderBase` within each affinity cluster permanently overshadowed every
 * weaker creature sharing that same affinity. Deterministic per `seedKey`.
 */
export function selectCompanion(
  ficha: Ficha,
  registry: Record<string, CriaturaDef>,
  seedKey: string
): CapturaAvaliacao | null {
  const catches = capturableCreatures(ficha, registry);
  if (catches.length === 0) return null;
  const rng = mulberry32(hashString(`${seedKey}|companion`));
  return pick(rng, catches);
}
