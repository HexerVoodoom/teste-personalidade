import { computeNatalChart } from "./astrology/chart";
import { NatalChart } from "./astrology/types";
import { computeNumerology, NumerologyMap } from "./numerology/numerology";
import { scoreProfile } from "./personality/scoring";
import { Answers, PersonalityProfile } from "./personality/types";

export interface OnboardingData {
  fullName: string;
  birthDate: string;
  birthTime: string;
  timeUnknown: boolean;
  placeLabel: string;
  latitude: number;
  longitude: number;
  timeZone: string;
}

/**
 * The three layers are kept separate on purpose.
 *
 * `psychometric` is the only layer with empirical validation behind it and is
 * the one that should drive anything consequential. `astrology` and
 * `numerology` are symbolic systems with no predictive validity — they are
 * here as narrative colour for creature generation, and are weighted well
 * below the psychometric layer when the layers are merged into tags.
 */
export const LAYER_WEIGHTS = {
  psychometric: 1.0,
  astrology: 0.45,
  numerology: 0.3,
} as const;

export interface SoulProfile {
  onboarding: OnboardingData;
  psychometric: PersonalityProfile;
  astrology: NatalChart;
  numerology: NumerologyMap;
  /** Merged, layer-weighted tag ranking — the handoff to the creature system. */
  mergedTags: { tag: string; weight: number; sources: string[] }[];
  generatedAt: string;
}

/** Rescales a weight map so its largest entry is 1, making layers comparable. */
function normalize(weights: Record<string, number>): Record<string, number> {
  const max = Math.max(0, ...Object.values(weights));
  if (max === 0) return {};
  return Object.fromEntries(Object.entries(weights).map(([k, v]) => [k, v / max]));
}

export function buildSoulProfile(
  onboarding: OnboardingData,
  answers: Answers,
  now: Date = new Date()
): SoulProfile {
  const psychometric = scoreProfile(answers);

  const astrology = computeNatalChart({
    date: onboarding.birthDate,
    time: onboarding.birthTime,
    timeZone: onboarding.timeZone,
    latitude: onboarding.latitude,
    longitude: onboarding.longitude,
    placeLabel: onboarding.placeLabel,
    timeUnknown: onboarding.timeUnknown,
  });

  const numerology = computeNumerology(
    onboarding.fullName,
    onboarding.birthDate,
    now.getUTCFullYear()
  );

  // Each layer is normalized to a 0-1 range first, so a layer with many tags
  // cannot outvote another simply by having more entries.
  const layers: [string, Record<string, number>, number][] = [
    ["psicométrico", normalize(psychometric.tagWeights), LAYER_WEIGHTS.psychometric],
    ["astrológico", normalize(astrology.tagWeights), LAYER_WEIGHTS.astrology],
    ["numerológico", normalize(numerology.tagWeights), LAYER_WEIGHTS.numerology],
  ];

  const merged = new Map<string, { weight: number; sources: Set<string> }>();
  for (const [source, weights, factor] of layers) {
    for (const [tag, value] of Object.entries(weights)) {
      const entry = merged.get(tag) ?? { weight: 0, sources: new Set<string>() };
      entry.weight += value * factor;
      entry.sources.add(source);
      merged.set(tag, entry);
    }
  }

  const mergedTags = Array.from(merged.entries())
    .map(([tag, { weight, sources }]) => ({
      tag,
      weight: Number(weight.toFixed(3)),
      sources: Array.from(sources),
    }))
    .sort((a, b) => b.weight - a.weight || a.tag.localeCompare(b.tag, "pt-BR"));

  return {
    onboarding,
    psychometric,
    astrology,
    numerology,
    mergedTags,
    generatedAt: now.toISOString(),
  };
}
