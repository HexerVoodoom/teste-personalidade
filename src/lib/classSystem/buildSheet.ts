import { OracleAxes, RoleId } from "../oracle/types";
import { CLASS_ELEMENT_ORDER } from "../oracle/types";
import { ELEMENTO_BASE_ORDER, ElementoBaseId, EscolaId, Ficha, ProfissaoId, RecursoId, StarterTalentoId } from "./types";
import { PROFISSOES } from "./profissoes";

/**
 * class-system has no fixed starting point budget in its source (it's an
 * open-ended point-buy system) — a "rookie" character sheet needed one, so
 * this module defines a documented, deliberately small convention: enough
 * points to have a coherent identity and to legally capture a class-system
 * creature (via `evocacao`), but nowhere near what any talent besides the
 * eight prerequisite-free ones requires. Raise these constants once
 * "evolution" stages exist and a real leveling curve is designed.
 */
export const ROOKIE_BUDGET = {
  elementos: 12,
  escolasDistribuidas: 6,
  evocacaoFixo: 2,
  recursos: 3,
  talentoRanks: 2,
  profissao: 2,
} as const;

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

/** Builds a rookie-stage `Ficha` from the oracle's axes. Deterministic — the
 *  same profile always yields the same sheet; nothing here is randomized. */
export function buildFicha(nome: string, oracle: OracleAxes): Ficha {
  const elementoShares = Object.fromEntries(
    CLASS_ELEMENT_ORDER.map((id) => [id, oracle.classElements[id]])
  ) as Record<ElementoBaseId, number>;
  const elementos = apportion(elementoShares, ELEMENTO_BASE_ORDER, ROOKIE_BUDGET.elementos);
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
  const distributedEscolas = apportion(roleEscolaShares, [...DISTRIBUTED_ESCOLAS], ROOKIE_BUDGET.escolasDistribuidas);
  const escolas: Partial<Record<EscolaId, number>> = { evocacao: ROOKIE_BUDGET.evocacaoFixo };
  for (const [escola, pontos] of Object.entries(distributedEscolas)) {
    if (pontos > 0) escolas[escola as EscolaId] = pontos;
  }

  const dominantRole = oracle.dominantRole;
  const recursos: Partial<Record<RecursoId, number>> = {
    [ROLE_TO_RECURSO[dominantRole]]: ROOKIE_BUDGET.recursos,
  };

  const talentos: Partial<Record<StarterTalentoId, number>> = {};
  for (const t of ROLE_TO_TALENTOS[dominantRole]) talentos[t] = 1;

  const profissoes: Partial<Record<ProfissaoId, number>> = {
    [pickProfissao(elementos, escolas)]: ROOKIE_BUDGET.profissao,
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
