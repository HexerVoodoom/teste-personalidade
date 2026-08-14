import assert from "node:assert/strict";
import test from "node:test";
import { selectBestiaryCreature } from "./select";
import { generateOracleAxes, OracleInputs } from "../oracle/generate";
import { BESTIARY_SEED } from "./seed";

const neutral: OracleInputs = {
  traits: { openness: 50, conscientiousness: 50, extraversion: 50, agreeableness: 50, neuroticism: 50, honestyHumility: 50 },
  jung: { EI: 50, SN: 50, TF: 50, JP: 50 },
  astrologyElements: { fogo: 3, terra: 3, ar: 3, água: 3 },
  astrologyPolarities: { diurno: 5, noturno: 5 },
  numerologyNumbers: [5],
};

test("always returns a creature from the pool", () => {
  const axes = generateOracleAxes(neutral);
  const match = selectBestiaryCreature(axes, "seed-a");
  assert.ok(BESTIARY_SEED.includes(match.creature));
});

test("is deterministic for the same seed key", () => {
  const axes = generateOracleAxes(neutral);
  const a = selectBestiaryCreature(axes, "same-user");
  const b = selectBestiaryCreature(axes, "same-user");
  assert.equal(a.creature.nome, b.creature.nome);
});

test("a water-dominant profile is more likely to land on a water creature than a fire-dominant one", () => {
  const waterAxes = generateOracleAxes({ ...neutral, astrologyElements: { fogo: 1, terra: 1, ar: 1, água: 30 } });
  const fireAxes = generateOracleAxes({ ...neutral, astrologyElements: { fogo: 30, terra: 1, ar: 1, água: 1 } });

  let waterHits = 0;
  let fireHits = 0;
  for (let i = 0; i < 40; i++) {
    const w = selectBestiaryCreature(waterAxes, `user-${i}`);
    const f = selectBestiaryCreature(fireAxes, `user-${i}`);
    if (w.creature.elementos.includes("agua")) waterHits++;
    if (f.creature.elementos.includes("fogo")) fireHits++;
  }
  assert.ok(waterHits > 10, `only ${waterHits}/40 water picks for a water-dominant profile`);
  assert.ok(fireHits > 10, `only ${fireHits}/40 fire picks for a fire-dominant profile`);
});

test("different seed keys can select different creatures from the same band", () => {
  const axes = generateOracleAxes(neutral);
  const names = new Set<string>();
  for (let i = 0; i < 30; i++) {
    names.add(selectBestiaryCreature(axes, `person-${i}`).creature.nome);
  }
  assert.ok(names.size > 1, "expected the random factor to produce more than one outcome across 30 people");
});

test("hostility band tracks alignment: benevolência skews toward gentler creatures", () => {
  const kindAxes = generateOracleAxes({ ...neutral, traits: { ...neutral.traits, agreeableness: 95, extraversion: 5 } });
  const fierceAxes = generateOracleAxes({ ...neutral, traits: { ...neutral.traits, extraversion: 95, honestyHumility: 5 } });
  assert.equal(kindAxes.dominantAlignment, "benevolencia");
  assert.equal(fierceAxes.dominantAlignment, "poder");

  let kindHostilitySum = 0;
  let fierceHostilitySum = 0;
  for (let i = 0; i < 30; i++) {
    kindHostilitySum += selectBestiaryCreature(kindAxes, `k-${i}`).creature.hostilidade;
    fierceHostilitySum += selectBestiaryCreature(fierceAxes, `k-${i}`).creature.hostilidade;
  }
  assert.ok(kindHostilitySum < fierceHostilitySum);
});
