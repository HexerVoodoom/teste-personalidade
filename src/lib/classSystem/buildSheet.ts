import { OracleAxes, RoleId } from "../oracle/types";
import { CLASS_ELEMENT_ORDER } from "../oracle/types";
import { ELEMENTO_BASE_ORDER, ElementoBaseId, EscolaId, Ficha, ProfissaoId, RecursoId, StarterTalentoId } from "./types";
import { PROFISSOES } from "./profissoes";

/**
 * class-system has no fixed starting point budget in its source (it's an
 * open-ended point-buy system) — a character sheet needed one, so this
 * module defines a documented convention scaled by evolution stage: enough
 * points at "rookie" to have a coherent identity and legally capture a
 * class-system creature (via `evocacao`), growing substantially at each
 * later stage so a champion/ultimate/mega/ultra sheet actually reads as
 * more advanced, not just re-flavored — deep enough into escolas/recursos
 * at the top stages to reach the `nivelMinimo: 8`/`10` prerequisite tier
 * class-system's own talent registry gates behind school/resource depth.
 */
interface Budget {
  elementos: number;
  escolasDistribuidas: number;
  evocacaoFixo: number;
  recursos: number;
  talentoRanks: number;
  profissao: number;
}

export const ROOKIE_BUDGET: Budget = {
  elementos: 28,
  escolasDistribuidas: 14,
  evocacaoFixo: 4,
  recursos: 8,
  talentoRanks: 10,
  profissao: 6,
};

export type FichaStage = "rookie" | "champion" | "ultimate" | "mega" | "ultra";
export const FICHA_STAGE_ORDER: FichaStage[] = ["rookie", "champion", "ultimate", "mega", "ultra"];

/** How much bigger each stage's budget is than rookie's — an accelerating
 *  curve (each jump is proportionally larger than the last), matching how
 *  monster-evolution power curves usually read: early growth is steady,
 *  the last stage is a big leap. */
export const STAGE_MULTIPLIER: Record<FichaStage, number> = {
  rookie: 1,
  champion: 1.8,
  ultimate: 3,
  mega: 5,
  ultra: 8,
};

/**
 * Only the 8 prerequisite-free talents are ever pickable by `buildFicha`
 * (deeper, escola/recurso-gated talents from class-system's full 47-talent
 * registry aren't modeled here yet), so there's a hard ceiling on how many
 * ranks can actually be spent: 5 talents at `ranksMaximos: 5` + persistência
 * at 3 + one side of the impacto_imediato/dano_ao_longo_do_tempo exclusive
 * pair at 3 = 31. Asking for more than that in the budget would just leave
 * points nominally "granted" but never actually invested, so it's clamped
 * here instead of silently under-spending at the top stages.
 */
const MAX_SPENDABLE_TALENTO_RANKS = 31;

function budgetForStage(stage: FichaStage): Budget {
  const m = STAGE_MULTIPLIER[stage];
  return {
    elementos: Math.round(ROOKIE_BUDGET.elementos * m),
    escolasDistribuidas: Math.round(ROOKIE_BUDGET.escolasDistribuidas * m),
    evocacaoFixo: Math.round(ROOKIE_BUDGET.evocacaoFixo * m),
    recursos: Math.round(ROOKIE_BUDGET.recursos * m),
    talentoRanks: Math.min(Math.round(ROOKIE_BUDGET.talentoRanks * m), MAX_SPENDABLE_TALENTO_RANKS),
    profissao: Math.round(ROOKIE_BUDGET.profissao * m),
  };
}

/**
 * The 8 prerequisite-free talents (`StarterTalentoId`), with class-system's
 * own `ranksMaximos` cap and `exclusivoCom` mutual-exclusion pairing —
 * vendorized from `class-system/src/registry/talentos.ts` so a bigger
 * talent budget can actually be spent (rank up multiple talents, capped
 * correctly) instead of always landing exactly 1 rank on exactly 2 of them
 * regardless of how much budget is available.
 */
const STARTER_TALENTO_CAPS: Record<StarterTalentoId, { ranksMaximos: number; exclusivoCom?: StarterTalentoId }> = {
  area_ampliada: { ranksMaximos: 5 },
  conjuracao_rapida: { ranksMaximos: 5 },
  alcance_estendido: { ranksMaximos: 5 },
  canalizacao_profunda: { ranksMaximos: 5 },
  economia_de_recurso: { ranksMaximos: 5 },
  persistencia: { ranksMaximos: 3 },
  impacto_imediato: { ranksMaximos: 3, exclusivoCom: "dano_ao_longo_do_tempo" },
  dano_ao_longo_do_tempo: { ranksMaximos: 3, exclusivoCom: "impacto_imediato" },
};

const ROLE_TO_ESCOLA: Record<RoleId, EscolaId> = {
  fisico: "combate_fisico",
  tanque: "combate_fisico",
  alcance: "longo_alcance",
  magico: "conjuracao",
  // "suporte" is split between benca/maldicao by alignment below, not
  // pinned to benca alone -- see roleEscolaShares.
  suporte: "benca",
};

/** "tanque" gets `soullink` (paga com a própria vida para proteger/potencializar
 *  os outros — combina com o papel de guardião) instead of doubling up on
 *  `furia` with "fisico"; every one of class-system's 5 recursos is now
 *  reachable from some dominant role, where `furia`/`soullink` used to
 *  collide and leave `soullink` permanently unused. */
const ROLE_TO_RECURSO: Record<RoleId, RecursoId> = {
  fisico: "furia",
  tanque: "soullink",
  magico: "mana",
  suporte: "fe",
  alcance: "ressonancia",
};

/** Two prerequisite-free talents per role, chosen to reinforce its playstyle.
 *  `impacto_imediato` and `dano_ao_longo_do_tempo` are mutually exclusive in
 *  class-system, so no role pairs them together. */
const ROLE_TO_TALENTOS: Record<RoleId, [StarterTalentoId, StarterTalentoId]> = {
  fisico: ["impacto_imediato", "persistencia"],
  tanque: ["persistencia", "economia_de_recurso"],
  magico: ["conjuracao_rapida", "canalizacao_profunda"],
  alcance: ["alcance_estendido", "dano_ao_longo_do_tempo"],
  suporte: ["economia_de_recurso", "canalizacao_profunda"],
};

/** Largest-remainder apportionment: turns a share record into integer points
 *  summing exactly to `total`, instead of naive rounding (which can over- or
 *  under-shoot the budget by a point or two). */
function apportion<K extends string>(shares: Record<K, number>, order: K[], total: number): Record<K, number> {
  const shareTotal = order.reduce((sum, k) => sum + Math.max(0, shares[k]), 0);
  const raw = order.map((k) => ({ key: k, exact: shareTotal > 0 ? (Math.max(0, shares[k]) / shareTotal) * total : total / order.length }));
  const floors = raw.map((r) => ({ ...r, floor: Math.floor(r.exact), remainder: r.exact - Math.floor(r.exact) }));
  let assigned = floors.reduce((sum, r) => sum + r.floor, 0);
  const out = Object.fromEntries(floors.map((r) => [r.key, r.floor])) as Record<K, number>;
  const byRemainder = [...floors].sort((a, b) => b.remainder - a.remainder);
  let i = 0;
  while (assigned < total && byRemainder.length > 0) {
    out[byRemainder[i % byRemainder.length].key] += 1;
    assigned++;
    i++;
  }
  return out;
}

/** Builds a `Ficha` at the given evolution stage from the oracle's axes
 *  (defaults to "rookie"). Deterministic — the same profile+stage always
 *  yields the same sheet; nothing here is randomized. */
export function buildFicha(nome: string, oracle: OracleAxes, stage: FichaStage = "rookie"): Ficha {
  const budget = budgetForStage(stage);

  const elementoShares = Object.fromEntries(
    CLASS_ELEMENT_ORDER.map((id) => [id, oracle.classElements[id]])
  ) as Record<ElementoBaseId, number>;
  const elementos = apportion(elementoShares, ELEMENTO_BASE_ORDER, budget.elementos);
  // Drop zero-point entries: a `Ficha.elementos[el] = 0` reads as "invested
  // and got nothing", which class-system's own `investirElemento` forbids
  // (it only accepts positive integers).
  for (const el of ELEMENTO_BASE_ORDER) if (elementos[el] === 0) delete elementos[el];

  // "benca"/"maldicao" are both fed by the "suporte" role's share, split by
  // alignment (benevolência leans blessing, poder leans curse, harmonia
  // splits evenly between the two) -- this is what makes "maldicao" reachable
  // at all; it used to never receive a single point regardless of profile.
  const DISTRIBUTED_ESCOLAS = ["combate_fisico", "longo_alcance", "conjuracao", "benca", "maldicao"] as const;
  const roleEscolaShares = { combate_fisico: 0, longo_alcance: 0, conjuracao: 0, benca: 0, maldicao: 0 } as Record<
    (typeof DISTRIBUTED_ESCOLAS)[number],
    number
  >;
  const alignmentTotal = (Object.values(oracle.alignments) as number[]).reduce((a, b) => a + b, 0) || 1;
  const bencaFraction = (oracle.alignments.benevolencia + oracle.alignments.harmonia * 0.5) / alignmentTotal;
  const maldicaoFraction = (oracle.alignments.poder + oracle.alignments.harmonia * 0.5) / alignmentTotal;
  for (const role of Object.keys(oracle.roles) as RoleId[]) {
    const share = oracle.roles[role];
    if (role === "suporte") {
      roleEscolaShares.benca += share * bencaFraction;
      roleEscolaShares.maldicao += share * maldicaoFraction;
      continue;
    }
    const escola = ROLE_TO_ESCOLA[role];
    if (escola !== "evocacao") roleEscolaShares[escola as keyof typeof roleEscolaShares] += share;
  }
  const distributedEscolas = apportion(roleEscolaShares, [...DISTRIBUTED_ESCOLAS], budget.escolasDistribuidas);
  const escolas: Partial<Record<EscolaId, number>> = { evocacao: budget.evocacaoFixo };
  for (const [escola, pontos] of Object.entries(distributedEscolas)) {
    if (pontos > 0) escolas[escola as EscolaId] = pontos;
  }

  const dominantRole = oracle.dominantRole;
  const recursos: Partial<Record<RecursoId, number>> = {
    [ROLE_TO_RECURSO[dominantRole]]: budget.recursos,
  };

  const talentos = allocateTalentos(dominantRole, budget.talentoRanks);

  const profissoes: Partial<Record<ProfissaoId, number>> = {
    [pickProfissao(elementos, escolas)]: budget.profissao,
  };

  return {
    nome,
    elementos,
    escolas,
    recursos,
    talentos,
    profissoes,
    totals: {
      elementos: Object.values(elementos).reduce((a, b) => a + (b ?? 0), 0),
      escolas: Object.values(escolas).reduce((a, b) => a + (b ?? 0), 0),
      recursos: Object.values(recursos).reduce((a, b) => a + (b ?? 0), 0),
      talentos: Object.values(talentos).reduce((a, b) => a + (b ?? 0), 0),
      profissoes: Object.values(profissoes).reduce((a, b) => a + (b ?? 0), 0),
    },
  };
}

/**
 * Spends `budget` ranks across the 8 prerequisite-free talents, instead of
 * always landing exactly 1 rank on exactly 2 of them regardless of how much
 * budget is available. The role's own 2 thematic talents (`ROLE_TO_TALENTOS`)
 * fill first — up to their `ranksMaximos` cap — then any leftover budget
 * spreads across the rest of the 8, in a fixed deterministic order, always
 * respecting each talent's own rank cap and skipping the loser of the
 * impacto_imediato/dano_ao_longo_do_tempo exclusive pair once the winner
 * (from the role's own picks, or the fixed order as a tie-break) is chosen.
 */
function allocateTalentos(dominantRole: RoleId, budget: number): Partial<Record<StarterTalentoId, number>> {
  const priority: StarterTalentoId[] = [
    ...ROLE_TO_TALENTOS[dominantRole],
    ...(Object.keys(STARTER_TALENTO_CAPS) as StarterTalentoId[]).filter(
      (t) => !ROLE_TO_TALENTOS[dominantRole].includes(t)
    ),
  ];

  const talentos: Partial<Record<StarterTalentoId, number>> = {};
  let excluded: StarterTalentoId | null = null;
  let remaining = budget;

  for (const id of priority) {
    if (remaining <= 0) break;
    if (id === excluded) continue;
    const cap: { ranksMaximos: number; exclusivoCom?: StarterTalentoId } = STARTER_TALENTO_CAPS[id];
    const ranks = Math.min(cap.ranksMaximos, remaining);
    if (ranks <= 0) continue;
    talentos[id] = ranks;
    remaining -= ranks;
    if (cap.exclusivoCom) excluded = cap.exclusivoCom;
  }

  return talentos;
}

/**
 * Picks the profession whose `fatoresElementos`/`fatoresEscolas` weights
 * best match the points this sheet already invested — a ferreiro sheet
 * (vigor/marcial/fogo/terra + combate_fisico) doesn't need a separate
 * "personality → profession" mapping; it falls out of the same elementos/
 * escolas the rest of the sheet already committed to, so professions stay
 * interlinked with the rest of the build instead of being a random pick.
 * Ties break on `PROFISSOES`' declaration order (deterministic).
 */
function pickProfissao(
  elementos: Partial<Record<ElementoBaseId, number>>,
  escolas: Partial<Record<EscolaId, number>>
): ProfissaoId {
  let best: ProfissaoId | null = null;
  let bestScore = -Infinity;
  for (const def of Object.values(PROFISSOES)) {
    let score = 0;
    for (const [el, peso] of Object.entries(def.fatoresElementos)) {
      score += (elementos[el as ElementoBaseId] ?? 0) * (peso ?? 0);
    }
    for (const [esc, peso] of Object.entries(def.fatoresEscolas ?? {})) {
      score += (escolas[esc as EscolaId] ?? 0) * (peso ?? 0);
    }
    if (score > bestScore) {
      bestScore = score;
      best = def.id;
    }
  }
  // Only reachable if PROFISSOES is ever empty, which it isn't.
  return best!;
}
