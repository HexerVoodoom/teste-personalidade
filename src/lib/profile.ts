import { computeNatalChart } from "./astrology/chart";
import { NatalChart } from "./astrology/types";
import { computeNumerology, NumerologyMap } from "./numerology/numerology";
import { generateOracleAxes } from "./oracle/generate";
import { OracleAxes } from "./oracle/types";
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

export interface SoulProfile {
  onboarding: OnboardingData;
  psychometric: PersonalityProfile;
  astrology: NatalChart;
  numerology: NumerologyMap;
  /**
   * Element/role/alignment/realm axes in the vocabulary Soulmon's own
   * `oracle.ts` already uses, derived from the three engines above. This is
   * the intended replacement for that file's astrology+numerology+quiz math —
   * see `src/lib/oracle/generate.ts` for the formulas.
   */
  oracle: OracleAxes;
  generatedAt: string;
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

  const facets: Record<string, number> = {};
  for (const trait of Object.values(psychometric.traits)) {
    for (const f of trait.facets) {
      facets[`${trait.dimension}:${f.facet}`] = f.score;
    }
  }

  const oracle = generateOracleAxes({
    traits: {
      openness: psychometric.traits.openness.score,
      conscientiousness: psychometric.traits.conscientiousness.score,
      extraversion: psychometric.traits.extraversion.score,
      agreeableness: psychometric.traits.agreeableness.score,
      neuroticism: psychometric.traits.neuroticism.score,
      honestyHumility: psychometric.traits.honestyHumility.score,
    },
    facets,
    jung: {
      EI: psychometric.jung.axes.EI.score,
      SN: psychometric.jung.axes.SN.score,
      TF: psychometric.jung.axes.TF.score,
      JP: psychometric.jung.axes.JP.score,
    },
    astrologyElements: astrology.distribution.elements,
    astrologyPolarities: astrology.distribution.polarities,
    numerologyNumbers: [
      numerology.lifePath.value,
      numerology.expression.value,
      numerology.soulUrge.value,
      numerology.personality.value,
      numerology.birthday.value,
      numerology.maturity.value,
    ],
  });

  return {
    onboarding,
    psychometric,
    astrology,
    numerology,
    oracle,
    generatedAt: now.toISOString(),
  };
}
