/**
 * Vocabulary shared with the Soulmon ecosystem.
 *
 * `ElementId`, `RoleId`, `AlignmentId` and `RealmId` are copied verbatim
 * (same ids, same order) from `soulmon/src/utils/oracle.ts` so this module's
 * output is a drop-in replacement for that file's `OracleResult` axes. This
 * project's onboarding + Big Five/HEXACO/Jung/astrology/numerology engines
 * are meant to eventually replace Soulmon's own (lighter) astrology +
 * numerology + quiz pipeline; until that migration happens, this module lives
 * here and produces the same shape Soulmon already consumes.
 *
 * `ClassElementId` is the class-system's 17-element registry
 * (`class-system/src/registry/elementos.ts`). Only 6 elements are shared with
 * Soulmon's 8 (`agua fogo terra ar sombra luz`); the other 11 class-system
 * elements (`eletricidade arcano vileza morte vida vigor marcial tempo som
 * gravidade espaco`) have no natural anchor in the current trait/astrology/
 * numerology data and are left at a low, documented weight rather than
 * invented.
 */

export type ElementId =
  | "agua" | "fogo" | "terra" | "ar"
  | "sombra" | "luz" | "planta" | "industrial";

export type RoleId = "suporte" | "tanque" | "fisico" | "magico" | "alcance";

export type AlignmentId = "poder" | "harmonia" | "benevolencia";

export type RealmId =
  | "deserto" | "picos" | "oceano" | "pantano" | "floresta"
  | "cavernas" | "gelo" | "campina" | "akasha";

export const ELEMENT_ORDER: ElementId[] = [
  "agua", "fogo", "terra", "ar", "sombra", "luz", "planta", "industrial",
];
export const ROLE_ORDER: RoleId[] = ["suporte", "tanque", "fisico", "magico", "alcance"];
export const ALIGNMENT_ORDER: AlignmentId[] = ["poder", "harmonia", "benevolencia"];
export const REALM_ORDER: RealmId[] = [
  "deserto", "picos", "oceano", "pantano", "floresta", "cavernas", "gelo", "campina", "akasha",
];

export type ClassElementId =
  | "fogo" | "agua" | "terra" | "ar"
  | "eletricidade" | "arcano" | "sombra" | "luz"
  | "vileza" | "morte" | "vida" | "vigor"
  | "marcial" | "tempo" | "som" | "gravidade" | "espaco";

export const CLASS_ELEMENT_ORDER: ClassElementId[] = [
  "fogo", "agua", "terra", "ar", "eletricidade", "arcano", "sombra", "luz",
  "vileza", "morte", "vida", "vigor", "marcial", "tempo", "som", "gravidade", "espaco",
];

export interface OracleAxes {
  elements: Record<ElementId, number>;
  roles: Record<RoleId, number>;
  alignments: Record<AlignmentId, number>;
  realms: Record<RealmId, number>;
  /** Provisional bridge to the class-system's 17-element registry. */
  classElements: Record<ClassElementId, number>;
  dominantElement: ElementId;
  dominantRole: RoleId;
  dominantAlignment: AlignmentId;
  dominantRealm: RealmId;
}
