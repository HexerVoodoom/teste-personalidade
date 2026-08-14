import { ProfissaoDef, ProfissaoId } from "./types";

/**
 * Copied (base-elements-only) from `class-system/src/registry/profissoes.ts`
 * — joalheiro's `cristal` factor is a *derived* class-system element id, out
 * of scope for this project's 17 base ids, so it's dropped here rather than
 * invented a base-element substitute for.
 */
export const PROFISSOES: Record<ProfissaoId, ProfissaoDef> = {
  ferreiro: {
    id: "ferreiro",
    nome: "Ferreiro",
    descricao: "Forja armas e armaduras de metal. Escala com vigor, marcial, fogo e terra.",
    fatoresElementos: { vigor: 0.5, marcial: 0.5, fogo: 0.4, terra: 0.4 },
    fatoresEscolas: { combate_fisico: 0.3 },
  },
  tecelao: {
    id: "tecelao",
    nome: "Tecelão",
    descricao: "Tece vestes e mantos encantados. Escala com arcano, ar e som.",
    fatoresElementos: { arcano: 0.5, ar: 0.4, som: 0.4, luz: 0.3 },
    fatoresEscolas: { benca: 0.3 },
  },
  artesao: {
    id: "artesao",
    nome: "Artesão",
    descricao: "Monta engenhocas e dispositivos. Escala com arcano, eletricidade, gravidade e espaço.",
    fatoresElementos: { arcano: 0.5, eletricidade: 0.4, gravidade: 0.4, espaco: 0.4 },
    fatoresEscolas: { conjuracao: 0.3 },
  },
  joalheiro: {
    id: "joalheiro",
    nome: "Joalheiro",
    descricao: "Lapida gemas e forja joias. Escala com luz, arcano e tempo.",
    fatoresElementos: { luz: 0.5, arcano: 0.5, tempo: 0.3 },
  },
  alquimista: {
    id: "alquimista",
    nome: "Alquimista",
    descricao: "Destila poções, óleos e bombas. Escala com água, vida, morte e vileza.",
    fatoresElementos: { agua: 0.5, vida: 0.4, morte: 0.4, vileza: 0.4 },
    fatoresEscolas: { maldicao: 0.3, benca: 0.2 },
  },
  curtidor: {
    id: "curtidor",
    nome: "Curtidor",
    descricao: "Trabalha couro e peles de criaturas. Escala com vida, vigor e sombra.",
    fatoresElementos: { vida: 0.5, vigor: 0.4, sombra: 0.4, terra: 0.3 },
    fatoresEscolas: { evocacao: 0.2 },
  },
};
