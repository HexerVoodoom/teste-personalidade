import { OracleAxes, RoleId } from "../oracle/types";
import { CLASS_ELEMENT_ORDER } from "../oracle/types";
import { ELEMENTO_BASE_ORDER, ElementoBaseId, EscolaId, Ficha, RecursoId, StarterTalentoId } from "./types";

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
} as const;

const ROLE_TO_ESCOLA: Record<RoleId, EscolaId> = {
  fisico: "combate_fisico",
  tanque: "combate_fisico",
  alcance: "longo_alcance",
  magico: "conjuracao",
  suporte: "benca",
};

const ROLE_TO_RECURSO: Record<RoleId, RecursoId> = {
  fisico: "furia",
  tanque: "furia",
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

  const roleEscolaShares = { combate_fisico: 0, longo_alcance: 0, conjuracao: 0, benca: 0 } as Record<
    "combate_fisico" | "longo_alcance" | "conjuracao" | "benca",
    number
  >;
  for (const role of Object.keys(oracle.roles) as RoleId[]) {
    const escola = ROLE_TO_ESCOLA[role];
    if (escola !== "evocacao") roleEscolaShares[escola as keyof typeof roleEscolaShares] += oracle.roles[role];
  }
  const distributedEscolas = apportion(
    roleEscolaShares,
    ["combate_fisico", "longo_alcance", "conjuracao", "benca"] as const,
    ROOKIE_BUDGET.escolasDistribuidas
  );
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

  return {
    nome,
    elementos,
    escolas,
    recursos,
    talentos,
    totals: {
      elementos: Object.values(elementos).reduce((a, b) => a + (b ?? 0), 0),
      escolas: Object.values(escolas).reduce((a, b) => a + (b ?? 0), 0),
      recursos: Object.values(recursos).reduce((a, b) => a + (b ?? 0), 0),
      talentos: Object.values(talentos).reduce((a, b) => a + (b ?? 0), 0),
    },
  };
}
