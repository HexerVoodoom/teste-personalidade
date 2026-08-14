import pool from "./pool.json";

export type BestiaryTamanho = "Miúdo" | "Pequeno" | "Médio" | "Grande" | "Enorme" | "Colossal";

/**
 * `elementos` and `familia` use the exact same vocabulary as the
 * class-system (`ElementoBaseId`/derived ids and `FamiliaCriatura`) — this
 * is besti-rio-'s canonical, IA-first classification output
 * (`classify.ts`/`classificacaoConfianca: "alta"`), not a bespoke tag set.
 * Some `elementos` entries are class-system *derived* ids (e.g. "lava",
 * "veneno", "gelo"), not only the 17 base ids the oracle scores directly —
 * `select.ts` maps those down for matching purposes.
 */
export interface BestiaryCreature {
  nome: string;
  origem: string;
  descricao: string;
  tamanho: BestiaryTamanho;
  hostilidade: number;
  elementos: string[];
  familia: string;
  biologia: string[];
}

/**
 * A 400-creature stratified sample of besti-rio-'s ~14,300-creature corpus
 * (all `classificacaoConfianca: "alta"`, every one carrying a real
 * description — placeholder "sem registro físico encontrado" entries were
 * excluded), covering all 17 class-system elements and all 14 creature
 * families. Bundling the full corpus (14k+ creatures) would bloat this
 * client-side app considerably for a use case that doesn't need it; 400
 * keeps the selection pool "large" (the very first version of this project
 * shipped a 30-creature seed) while staying a reasonable bundle size.
 *
 * Regenerate by re-running besti-rio-'s `npm run classify:apply` and
 * re-sampling — see `docs/fundamentacao.md` for the exact query used.
 */
export const BESTIARY_SEED: BestiaryCreature[] = pool as BestiaryCreature[];
