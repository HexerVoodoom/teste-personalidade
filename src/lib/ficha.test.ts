import assert from "node:assert/strict";
import test from "node:test";
import { buildCreatureFicha } from "./ficha";
import { buildSoulProfile, OnboardingData } from "./profile";
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

test("builds a complete ficha end-to-end from an onboarding + quiz answer set", () => {
  const profile = buildSoulProfile(onboarding, fullAnswers(), NOW);
  const ficha = buildCreatureFicha(profile);

  assert.ok(ficha.ficha.totals.elementos > 0);
  assert.ok(ficha.bestiaryPick.creature.nome.length > 0);
  assert.ok(ficha.rookie.name.length > 0);
  assert.match(ficha.rookie.imagePrompt, /pixel art/i);
});

test("is deterministic: the same profile always yields the same ficha", () => {
  const profile = buildSoulProfile(onboarding, fullAnswers(), NOW);
  const a = buildCreatureFicha(profile);
  const b = buildCreatureFicha(profile);
  assert.deepEqual(a, b);
});

test("a different person (name/birth) can get a different bestiary pick and rookie", () => {
  const a = buildCreatureFicha(buildSoulProfile(onboarding, fullAnswers(), NOW));
  const b = buildCreatureFicha(
    buildSoulProfile({ ...onboarding, fullName: "Carlos Henrique Prado", birthDate: "1988-02-14" }, fullAnswers(), NOW)
  );
  // Not asserting they MUST differ (small pool), just that the pipeline
  // actually depends on identity rather than always returning the same thing.
  const same = a.bestiaryPick.creature.nome === b.bestiaryPick.creature.nome && a.rookie.name === b.rookie.name;
  assert.equal(same, false);
});

test("fichaByStage has all 5 evolution stages, budgets growing at each one", () => {
  const profile = buildSoulProfile(onboarding, fullAnswers(), NOW);
  const result = buildCreatureFicha(profile);
  assert.deepEqual(Object.keys(result.fichaByStage), ["rookie", "champion", "ultimate", "mega", "ultra"]);
  assert.deepEqual(result.ficha, result.fichaByStage.rookie);
  let prev = 0;
  for (const stage of ["rookie", "champion", "ultimate", "mega", "ultra"] as const) {
    const total = result.fichaByStage[stage].totals.elementos;
    assert.ok(total > prev, `${stage} elementos total (${total}) should exceed the previous stage's (${prev})`);
    prev = total;
  }
});

test("the whole ficha survives JSON serialization", () => {
  const profile = buildSoulProfile(onboarding, fullAnswers(), NOW);
  const ficha = buildCreatureFicha(profile);
  const roundTrip = JSON.parse(JSON.stringify(ficha));
  assert.equal(roundTrip.rookie.name, ficha.rookie.name);
  assert.equal(roundTrip.bestiaryPick.creature.nome, ficha.bestiaryPick.creature.nome);
});
