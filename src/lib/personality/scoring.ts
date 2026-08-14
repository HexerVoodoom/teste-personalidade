import { questions } from "./questions";
import {
  Answers,
  ArchetypeTag,
  BigFiveTrait,
  JungAxis,
  JungTypeResult,
  PersonalityProfile,
  TraitScore,
} from "./types";

const BIG_FIVE: BigFiveTrait[] = ["openness", "conscientiousness", "extraversion", "agreeableness", "neuroticism"];
const JUNG_AXES: JungAxis[] = ["EI", "SN", "TF", "JP"];

const JUNG_POLES: Record<JungAxis, [string, string]> = {
  EI: ["E", "I"],
  SN: ["S", "N"],
  TF: ["T", "F"],
  JP: ["J", "P"],
};

function levelFor(score: number): TraitScore["level"] {
  if (score < 20) return "muito baixo";
  if (score < 40) return "baixo";
  if (score < 60) return "moderado";
  if (score < 80) return "alto";
  return "muito alto";
}

/** Converts a 1-5 Likert answer (respecting reverse-scoring) into a 0-4 scale. */
function itemValue(raw: number, positive: boolean): number {
  const clamped = Math.min(5, Math.max(1, raw));
  return positive ? clamped - 1 : 5 - clamped;
}

export function isComplete(answers: Answers): boolean {
  return questions.every((q) => answers[q.id] !== undefined);
}

export function scoreProfile(answers: Answers): PersonalityProfile {
  const bigFive = {} as Record<BigFiveTrait, TraitScore>;
  const traitPoints: Record<string, number> = {};
  const tagWeights = new Map<ArchetypeTag, number>();

  for (const trait of BIG_FIVE) {
    const items = questions.filter((q) => q.dimension === trait);
    let sum = 0;
    const maxSum = items.length * 4;
    for (const item of items) {
      const answer = answers[item.id];
      const value = answer !== undefined ? itemValue(answer, item.positive) : 2; // neutral fallback
      sum += value;
      // weight this item's tags by how strongly the answer leaned that way
      const weight = value / 4; // 0..1
      for (const tag of item.tags) {
        tagWeights.set(tag, (tagWeights.get(tag) ?? 0) + weight);
      }
    }
    const score = Math.round((sum / maxSum) * 100);
    const tags = Array.from(new Set(items.flatMap((i) => i.tags)));
    bigFive[trait] = { dimension: trait, score, level: levelFor(score), tags };
    traitPoints[trait] = score;
  }

  const axes = {} as JungTypeResult["axes"];
  let code = "";
  for (const axis of JUNG_AXES) {
    const items = questions.filter((q) => q.dimension === axis);
    let sum = 0;
    const maxSum = items.length * 4;
    for (const item of items) {
      const answer = answers[item.id];
      const value = answer !== undefined ? itemValue(answer, item.positive) : 2;
      sum += value;
      const weight = value / 4;
      for (const tag of item.tags) {
        tagWeights.set(tag, (tagWeights.get(tag) ?? 0) + weight);
      }
    }
    const score = Math.round((sum / maxSum) * 100); // high score = "positive" pole (first letter)
    const [positivePole, negativePole] = JUNG_POLES[axis];
    const pole = score >= 50 ? positivePole : negativePole;
    code += pole;
    axes[axis] = { pole, score };
    traitPoints[`jung_${axis}`] = score;
  }

  const dominantTags = Array.from(tagWeights.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([tag]) => tag);

  return {
    bigFive,
    jung: { code, axes },
    dominantTags,
    traitPoints,
  };
}
