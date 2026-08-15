/**
 * Vocabulary mirrored from `class-system/src/registry/*.ts` (elementos,
 * escolas, recursos, talentos, criaturas) — read-only reference data copied
 * into this project so a character sheet can be built without a runtime
 * dependency on that repo. IDs match exactly so a `Ficha` produced here is a
 * valid `Personagem` there.
 */

export type ElementoBaseId =
  | "fogo" | "agua" | "terra" | "ar"
  | "eletricidade" | "arcano" | "sombra" | "luz"
  | "vileza" | "morte" | "vida" | "vigor"
  | "marcial" | "tempo" | "som" | "gravidade" | "espaco";

export const ELEMENTO_BASE_ORDER: ElementoBaseId[] = [
  "fogo", "agua", "terra", "ar", "eletricidade", "arcano", "sombra", "luz",
  "vileza", "morte", "vida", "vigor", "marcial", "tempo", "som", "gravidade", "espaco",
];

export type EscolaId = "combate_fisico" | "longo_alcance" | "evocacao" | "conjuracao" | "benca" | "maldicao";

export const ESCOLA_ORDER: EscolaId[] = [
  "combate_fisico", "longo_alcance", "evocacao", "conjuracao", "benca", "maldicao",
];

export type RecursoId = "mana" | "fe" | "furia" | "soullink" | "ressonancia";

export type ProfissaoId = "ferreiro" | "tecelao" | "artesao" | "joalheiro" | "alquimista" | "curtidor";

export interface ProfissaoDef {
  id: ProfissaoId;
  nome: string;
  descricao: string;
  fatoresElementos: Partial<Record<ElementoBaseId, number>>;
  fatoresEscolas?: Partial<Record<EscolaId, number>>;
}

/**
 * Talentos with no prerequisite (`requisito` unset in `talentos.ts`) — the
 * only ones a rookie-stage sheet can legally take, since every other talent
 * requires school/resource levels this budget doesn't reach.
 */
export type StarterTalentoId =
  | "area_ampliada" | "conjuracao_rapida" | "alcance_estendido" | "canalizacao_profunda"
  | "economia_de_recurso" | "persistencia" | "impacto_imediato" | "dano_ao_longo_do_tempo";

export type FamiliaCriatura =
  | "besta" | "ave" | "aquatica" | "ignea" | "morto_vivo"
  | "aberracao" | "planta" | "espirito" | "construto" | "demonio" | "draconico"
  | "gigante" | "geleia" | "humanoide";

export interface CriaturaDef {
  id: string;
  nome: string;
  familia: FamiliaCriatura;
  afinidades: ElementoBaseId[];
  poderBase: number;
  descricao: string;
}

/** A rookie-stage `Personagem`, restricted to what a level-0 build can hold. */
export interface Ficha {
  nome: string;
  elementos: Partial<Record<ElementoBaseId, number>>;
  escolas: Partial<Record<EscolaId, number>>;
  recursos: Partial<Record<RecursoId, number>>;
  talentos: Partial<Record<StarterTalentoId, number>>;
  profissoes: Partial<Record<ProfissaoId, number>>;
  /** Pontos totais investidos por categoria — a soma bate com o orçamento. */
  totals: { elementos: number; escolas: number; recursos: number; talentos: number; profissoes: number };
}
