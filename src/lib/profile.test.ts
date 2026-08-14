import assert from "node:assert/strict";
import test from "node:test";
import { buildSoulProfile, OnboardingData, LAYER_WEIGHTS } from "./profile";
import { items } from "./personality/questions";
import { Answers } from "./personality/types";

const onboarding: OnboardingData = {
  fullName: "Maria Eduarda Nogueira",
  birthDate: "1994-07-23",
  birthTime: "14:35",
  timeUnknown: false,
  placeLabel: "São Paulo - SP, BR",
  latitude: -23.5505,
  longitude: -46.6333,
  timeZone: "America/Sao_Paulo",
};

function fullAnswers(): Answers {
  const answers: Answers = {};
  for (const item of items) {
    if (item.kind === "likert" || item.kind === "frequency") {
      answers[item.id] = { kind: "likert", value: item.positive ? 5 : 2 };
    } else if (item.kind === "forced-choice") {
      answers[item.id] = { kind: "forced-choice", choice: "a" };
    } else {
      answers[item.id] = { kind: "scenario", optionId: "b" };
    }
  }
  return answers;
}

const NOW = new Date("2026-08-14T00:00:00Z");

test("builds all three layers from one onboarding payload", () => {
  const profile = buildSoulProfile(onboarding, fullAnswers(), NOW);
  assert.ok(profile.psychometric.traits.openness);
  assert.equal(profile.astrology.bodies.length, 11);
  assert.ok(profile.numerology.lifePath.value > 0);
  assert.equal(profile.numerology.personalYearReference, 2026);
  assert.equal(profile.generatedAt, NOW.toISOString());
});

test("merged tags are sorted and annotated with their source layers", () => {
  const profile = buildSoulProfile(onboarding, fullAnswers(), NOW);
  assert.ok(profile.mergedTags.length > 0);
  for (let i = 1; i < profile.mergedTags.length; i++) {
    assert.ok(
      profile.mergedTags[i - 1].weight >= profile.mergedTags[i].weight,
      "mergedTags must be sorted by weight"
    );
  }
  for (const entry of profile.mergedTags) {
    assert.ok(entry.sources.length > 0);
    for (const source of entry.sources) {
      assert.ok(["psicométrico", "astrológico", "numerológico"].includes(source));
    }
  }
});

test("the psychometric layer outweighs the symbolic ones", () => {
  assert.ok(LAYER_WEIGHTS.psychometric > LAYER_WEIGHTS.astrology);
  assert.ok(LAYER_WEIGHTS.astrology > LAYER_WEIGHTS.numerology);

  // A tag carried only by numerology can never outrank the psychometric top tag.
  const profile = buildSoulProfile(onboarding, fullAnswers(), NOW);
  const topTag = profile.mergedTags[0];
  const numerologyOnly = profile.mergedTags.filter(
    (t) => t.sources.length === 1 && t.sources[0] === "numerológico"
  );
  for (const tag of numerologyOnly) {
    assert.ok(tag.weight < topTag.weight, `${tag.tag} outranked ${topTag.tag}`);
  }
});

test("no single layer's tag count lets it dominate the merge", () => {
  // Each layer is normalized to a 0-1 range before weighting, so the maximum
  // contribution any layer can make to one tag is exactly its layer weight.
  const profile = buildSoulProfile(onboarding, fullAnswers(), NOW);
  const ceiling = LAYER_WEIGHTS.psychometric + LAYER_WEIGHTS.astrology + LAYER_WEIGHTS.numerology;
  for (const entry of profile.mergedTags) {
    assert.ok(entry.weight <= ceiling + 1e-9, `${entry.tag} = ${entry.weight}`);
  }
});

test("unknown birth time still produces a usable profile with warnings", () => {
  const profile = buildSoulProfile(
    { ...onboarding, birthTime: "", timeUnknown: true },
    fullAnswers(),
    NOW
  );
  assert.equal(profile.astrology.bigThree.ascendant, null);
  assert.ok(profile.astrology.warnings.length > 0);
  assert.ok(profile.mergedTags.length > 0);
});

test("changing only the birth city changes the chart but not the numerology", () => {
  const sp = buildSoulProfile(onboarding, fullAnswers(), NOW);
  const tokyo = buildSoulProfile(
    { ...onboarding, latitude: 35.6762, longitude: 139.6503, timeZone: "Asia/Tokyo", placeLabel: "Tóquio" },
    fullAnswers(),
    NOW
  );
  assert.notEqual(sp.astrology.angles.ascendant, tokyo.astrology.angles.ascendant);
  assert.equal(sp.numerology.lifePath.value, tokyo.numerology.lifePath.value);
});

test("changing only the name changes the numerology but not the chart", () => {
  const a = buildSoulProfile(onboarding, fullAnswers(), NOW);
  const b = buildSoulProfile({ ...onboarding, fullName: "Carlos Henrique Prado" }, fullAnswers(), NOW);
  assert.equal(a.astrology.angles.ascendant, b.astrology.angles.ascendant);
  assert.notEqual(a.numerology.expression.value, b.numerology.expression.value);
});

test("the whole profile survives JSON serialization", () => {
  const profile = buildSoulProfile(onboarding, fullAnswers(), NOW);
  const roundTrip = JSON.parse(JSON.stringify(profile));
  assert.equal(roundTrip.mergedTags.length, profile.mergedTags.length);
  assert.equal(roundTrip.astrology.bodies.length, profile.astrology.bodies.length);
  assert.ok(Number.isFinite(roundTrip.astrology.angles.ascendant));
});
