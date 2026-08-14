export type BigFiveTrait = "openness" | "conscientiousness" | "extraversion" | "agreeableness" | "neuroticism";

export type JungAxis = "EI" | "SN" | "TF" | "JP";

export type Dimension = BigFiveTrait | JungAxis;

/**
 * Tags are the seam for future integration with the Soulmon ecosystem
 * (bestiário / class-system). Each question and each resulting trait level
 * can carry tags such as element/skill/temperament hints, without this
 * project depending on those repos directly.
 */
export type ArchetypeTag = string;

export interface Question {
  id: string;
  dimension: Dimension;
  /** For Big Five: which facet of the trait this probes (kept coarse on purpose). */
  facet: string;
  text: string;
  /** true = agreeing raises the score for `dimension`'s positive pole; false = reverse-scored */
  positive: boolean;
  tags: ArchetypeTag[];
}

export type LikertAnswer = 1 | 2 | 3 | 4 | 5;

export interface Answers {
  [questionId: string]: LikertAnswer;
}

export interface TraitScore {
  dimension: Dimension;
  /** 0-100 normalized score */
  score: number;
  level: "muito baixo" | "baixo" | "moderado" | "alto" | "muito alto";
  tags: ArchetypeTag[];
}

export interface JungTypeResult {
  code: string; // e.g. "INFJ"
  axes: Record<JungAxis, { pole: string; score: number }>;
}

export interface PersonalityProfile {
  bigFive: Record<BigFiveTrait, TraitScore>;
  jung: JungTypeResult;
  dominantTags: ArchetypeTag[];
  /** Flat trait-points map intended as the export contract for external systems
   * (e.g. distributing points across a class-system / bestiary). */
  traitPoints: Record<string, number>;
}
