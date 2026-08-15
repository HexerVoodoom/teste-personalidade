import assert from "node:assert/strict";
import test from "node:test";
import { buildEvolutionChain } from "./evolutionChain";
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

function rookieFor(seed: string) {
  const axes = generateOracleAxes(neutral);
  return generateRookieCreature(axes, BESTIARY_SEED[0], seed);
}

test("has exactly 11 stages: rookie + 3 branches x 3 stages + ultra", () => {
  const chain = buildEvolutionChain(rookieFor("a"), "a");
  assert.equal(chain.length, 11);
  const ids = chain.map((s) => s.stageId);
  assert.deepEqual(ids, [
    "rookie",
    "champion-virus", "ultimate-virus", "mega-virus",
    "champion-data", "ultimate-data", "mega-data",
    "champion-vaccine", "ultimate-vaccine", "mega-vaccine",
    "ultra",
  ]);
});

test("rookie has no reference, every other stage references the one before it in its branch", () => {
  const chain = buildEvolutionChain(rookieFor("a"), "a");
  const byId = Object.fromEntries(chain.map((s) => [s.stageId, s]));
  assert.deepEqual(byId.rookie.referenceStageIds, []);
  assert.deepEqual(byId["champion-virus"].referenceStageIds, ["rookie"]);
  assert.deepEqual(byId["ultimate-virus"].referenceStageIds, ["champion-virus"]);
  assert.deepEqual(byId["mega-virus"].referenceStageIds, ["ultimate-virus"]);
});

test("ultra references all three mega stages", () => {
  const chain = buildEvolutionChain(rookieFor("a"), "a");
  const ultra = chain.find((s) => s.stageId === "ultra")!;
  assert.deepEqual(ultra.referenceStageIds, ["mega-virus", "mega-data", "mega-vaccine"]);
  assert.match(ultra.prompt, /Fuse the THREE creatures/);
});

test("is deterministic for the same seed key", () => {
  const rookie = rookieFor("same-user");
  const a = buildEvolutionChain(rookie, "same-user");
  const b = buildEvolutionChain(rookie, "same-user");
  assert.deepEqual(a, b);
});

test("every non-rookie stage prompt mentions the rookie's own name, so identity carries through", () => {
  const rookie = rookieFor("a");
  const chain = buildEvolutionChain(rookie, "a");
  for (const step of chain.slice(1)) {
    assert.ok(step.prompt.includes(rookie.name), `${step.stageId} prompt is missing ${rookie.name}`);
  }
});

test("every stage's prompt carries the rookie's exact pixel-art style block, with emphasis on every non-rookie stage", () => {
  const rookie = rookieFor("a");
  const chain = buildEvolutionChain(rookie, "a");
  assert.ok(rookie.imagePrompt.includes("16x16 pixel art"), "sanity: rookie prompt itself is pixel-art");
  for (const step of chain) {
    assert.ok(step.prompt.includes("16x16 pixel art"), `${step.stageId} prompt is missing the pixel-art style block`);
    assert.ok(step.prompt.includes("no shading, no outlines, no anti-aliasing"), `${step.stageId} prompt is missing the style rules`);
  }
  for (const step of chain.slice(1)) {
    assert.match(step.prompt, /CRITICAL:.*pixel-art style must persist/, `${step.stageId} prompt is missing the style-importance emphasis`);
  }
});
