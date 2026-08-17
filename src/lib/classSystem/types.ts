/**
 * Vocabulário do class-system — **reexportado do repositório real**, não mais
 * espelhado aqui.
 *
 * Este arquivo já foi uma cópia à mão ("read-only reference data copied into
 * this project"). A cópia derivou: o registro real tem 11 profissões contra as
 * 6 daqui, 111 linhas de criaturas contra 52, e ganhou 3.215 elementos e uma
 * camada de consulta que este projeto nunca viu. Cópia de dados é a mesma
 * armadilha da regra copiada — diverge sem dar erro.
 *
 * A dependência é `github:HexerVoodoom/Class-System` (repositório PÚBLICO), em
 * código TypeScript sem build: o Next transpila via `transpilePackages`.
 * Atualizar = `npm update class-system`, e o lockfile fixa o commit para o
 * build ser reprodutível.
 *
 * O que continua sendo DESTE projeto está no fim do arquivo: `Ficha`,
 * `StarterTalentoId` e os orçamentos por estágio são convenção do protótipo,
 * não regra do class-system.
 */

export type {
  ElementoBaseId, ElementoId, ElementoDef,
  EscolaId, RecursoId,
  ProfissaoId, ProfissaoDef, CategoriaItem,
  FamiliaCriatura, CriaturaDef,
} from 'class-system';

export {
  ELEMENTOS, ELEMENTOS_PRIMAIS, elementosBase, elementosDerivados,
  ESCOLAS, RECURSOS, PROFISSOES, CRIATURAS, FAMILIAS, TALENTOS,
} from 'class-system';

import type { ElementoBaseId, EscolaId, ProfissaoId, RecursoId } from 'class-system';

export const ELEMENTO_BASE_ORDER: ElementoBaseId[] = [
  "fogo", "agua", "terra", "ar", "eletricidade", "arcano", "sombra", "luz",
  "vileza", "morte", "vida", "vigor", "marcial", "tempo", "som", "gravidade", "espaco",
];

export const ESCOLA_ORDER: EscolaId[] = [
  "combate_fisico", "longo_alcance", "evocacao", "conjuracao", "benca", "maldicao",
];

/**
 * Talentos with no prerequisite (`requisito` unset in `talentos.ts`) — the
 * only ones a rookie-stage sheet can legally take, since every other talent
 * requires school/resource levels this budget doesn't reach.
 */
export type StarterTalentoId =
  | "area_ampliada" | "conjuracao_rapida" | "alcance_estendido" | "canalizacao_profunda"
  | "economia_de_recurso" | "persistencia" | "impacto_imediato" | "dano_ao_longo_do_tempo";

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
