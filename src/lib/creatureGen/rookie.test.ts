import assert from "node:assert/strict";
import test from "node:test";
import { generateRookieCreature } from "./rookie";
import { generateOracleAxes, OracleInputs } from "../oracle/generate";
import { BESTIARY_SEED } from "../bestiary/seed";

const neutral: OracleInputs = {
  traits: { openness: 50, conscientiousness: 50, extraversion: 50, agreeableness: 50, neuroticism: 50, honestyHumility: 50 },
  jung: { EI: 50, SN: 50, TF: 50, JP: 50 },
  astrologyElements: { fogo: 3, terra: 3, ar: 3, água: 3 },
  astrologyPolarities: { diurno: 5, noturno: 5 },
  numerologyNumbers: [5],
};

test("is deterministic for the same seed key", () => {
  const axes = generateOracleAxes(neutral);
  const a = generateRookieCreature(axes, BESTIARY_SEED[0], "user-a");
  const b = generateRookieCreature(axes, BESTIARY_SEED[0], "user-a");
  assert.deepEqual(a, b);
});

test("different seed keys can produce different creatures for the same axes", () => {
  const axes = generateOracleAxes(neutral);
  const names = new Set<string>();
  for (let i = 0; i < 20; i++) {
    names.add(generateRookieCreature(axes, BESTIARY_SEED[0], `user-${i}`).name);
  }
  assert.ok(names.size > 1);
});

test("image prompt follows the Soulmon contract: rookie-sized, no franchise copy, no monochrome tint", () => {
  const axes = generateOracleAxes(neutral);
  const rookie = generateRookieCreature(axes, BESTIARY_SEED[0], "user-a");
  assert.match(rookie.imagePrompt, /Do not copy any existing franchise character/);
  assert.match(rookie.imagePrompt, /16x16 pixel art/);
  assert.match(rookie.imagePrompt, /Do not tint the whole creature in a single hue/);
});

test("bio mentions the bestiary creature used as inspiration", () => {
  const axes = generateOracleAxes(neutral);
  const rookie = generateRookieCreature(axes, BESTIARY_SEED[5], "user-a");
  assert.equal(rookie.inspiredBy, BESTIARY_SEED[5].nome);
  assert.ok(rookie.bio.pt.includes(BESTIARY_SEED[5].nome));
  assert.ok(rookie.bio.en.includes(BESTIARY_SEED[5].nome));
});

test("name is a non-empty capitalized word ending in 'mon'", () => {
  const axes = generateOracleAxes(neutral);
  const rookie = generateRookieCreature(axes, BESTIARY_SEED[0], "user-a");
  assert.match(rookie.name, /^[A-Z][a-z]*mon$/);
});

test("changing the dominant element changes the archetype noun pool used", () => {
  const fireAxes = generateOracleAxes({ ...neutral, astrologyElements: { fogo: 30, terra: 1, ar: 1, água: 1 } });
  const waterAxes = generateOracleAxes({ ...neutral, astrologyElements: { fogo: 1, terra: 1, ar: 1, água: 30 } });
  const fire = generateRookieCreature(fireAxes, BESTIARY_SEED[0], "same-user");
  const water = generateRookieCreature(waterAxes, BESTIARY_SEED[0], "same-user");
  assert.notEqual(fire.archetype.noun.en, water.archetype.noun.en);
});
