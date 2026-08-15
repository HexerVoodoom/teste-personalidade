import assert from "node:assert/strict";
import test from "node:test";
import { buildSoulProfile, OnboardingData } from "./profile";
import { items } from "./personality/questions";
import { Answers } from "./personality/types";
import { ELEMENT_ORDER, ROLE_ORDER, ALIGNMENT_ORDER, REALM_ORDER } from "./oracle/types";

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

test("builds all three layers plus the oracle from one onboarding payload", () => {
  const profile = buildSoulProfile(onboarding, fullAnswers(), NOW);
  assert.ok(profile.psychometric.traits.openness);
  assert.equal(profile.astrology.bodies.length, 11);
  assert.ok(profile.numerology.lifePath.value > 0);
  assert.equal(profile.numerology.personalYearReference, 2026);
  assert.equal(profile.generatedAt, NOW.toISOString());
  assert.ok(ELEMENT_ORDER.includes(profile.oracle.dominantElement));
  assert.ok(ROLE_ORDER.includes(profile.oracle.dominantRole));
  assert.ok(ALIGNMENT_ORDER.includes(profile.oracle.dominantAlignment));
  assert.ok(REALM_ORDER.includes(profile.oracle.dominantRealm));
});

test("unknown birth time still produces a usable profile with warnings", () => {
  const profile = buildSoulProfile(
    { ...onboarding, birthTime: "", timeUnknown: true },
    fullAnswers(),
    NOW
  );
  assert.equal(profile.astrology.bigThree.ascendant, null);
  assert.ok(profile.astrology.warnings.length > 0);
  // Even with houses/angles unavailable, the element split still exists and
  // the oracle can still be computed from it plus the psychometric layer.
  for (const el of ELEMENT_ORDER) {
    assert.ok(Number.isFinite(profile.oracle.elements[el]));
  }
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

test("changing only the quiz answers changes the oracle's role/alignment split", () => {
  const a = buildSoulProfile(onboarding, fullAnswers(), NOW);
  const lowExtraversionAnswers: Answers = {};
  for (const item of items) {
    if (item.kind === "likert" || item.kind === "frequency") {
      lowExtraversionAnswers[item.id] = {
        kind: "likert",
        value: item.dimension === "extraversion" ? (item.positive ? 1 : 5) : item.positive ? 5 : 2,
      };
    } else if (item.kind === "forced-choice") {
      lowExtraversionAnswers[item.id] = { kind: "forced-choice", choice: "a" };
    } else {
      lowExtraversionAnswers[item.id] = { kind: "scenario", optionId: "b" };
    }
  }
  const b = buildSoulProfile(onboarding, lowExtraversionAnswers, NOW);
  assert.notEqual(a.oracle.roles.fisico, b.oracle.roles.fisico);
});

test("the whole profile survives JSON serialization", () => {
  const profile = buildSoulProfile(onboarding, fullAnswers(), NOW);
  const roundTrip = JSON.parse(JSON.stringify(profile));
  assert.equal(roundTrip.astrology.bodies.length, profile.astrology.bodies.length);
  assert.ok(Number.isFinite(roundTrip.astrology.angles.ascendant));
  assert.equal(roundTrip.oracle.dominantElement, profile.oracle.dominantElement);
});
