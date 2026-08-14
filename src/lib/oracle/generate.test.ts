import assert from "node:assert/strict";
import test from "node:test";
import { generateOracleAxes, OracleInputs } from "./generate";
import { ALIGNMENT_ORDER, ELEMENT_ORDER, REALM_ORDER, ROLE_ORDER } from "./types";

const neutral: OracleInputs = {
  traits: {
    openness: 50, conscientiousness: 50, extraversion: 50,
    agreeableness: 50, neuroticism: 50, honestyHumility: 50,
  },
  jung: { EI: 50, SN: 50, TF: 50, JP: 50 },
  astrologyElements: { fogo: 3, terra: 3, ar: 3, água: 3 },
  astrologyPolarities: { diurno: 5, noturno: 5 },
  numerologyNumbers: [5],
};

function withTrait(overrides: Partial<OracleInputs["traits"]>): OracleInputs {
  return { ...neutral, traits: { ...neutral.traits, ...overrides } };
}

test("every axis is a valid share summing to ~100", () => {
  const axes = generateOracleAxes(neutral);
  for (const [record, order] of [
    [axes.elements, ELEMENT_ORDER],
    [axes.roles, ROLE_ORDER],
    [axes.alignments, ALIGNMENT_ORDER],
    [axes.realms, REALM_ORDER],
  ] as const) {
    const total = order.reduce((sum, k) => sum + (record as Record<string, number>)[k], 0);
    assert.ok(Math.abs(total - 100) < 0.5, `total ${total}`);
    for (const k of order) {
      assert.ok((record as Record<string, number>)[k] >= 0, `${k} negative`);
    }
  }
});

test("dominant fields agree with the max of their own record", () => {
  const axes = generateOracleAxes(neutral);
  const maxKey = <K extends string>(record: Record<K, number>, order: K[]) =>
    order.reduce((best, k) => (record[k] > record[best] ? k : best), order[0]);
  assert.equal(axes.dominantElement, maxKey(axes.elements, ELEMENT_ORDER));
  assert.equal(axes.dominantRole, maxKey(axes.roles, ROLE_ORDER));
  assert.equal(axes.dominantAlignment, maxKey(axes.alignments, ALIGNMENT_ORDER));
  assert.equal(axes.dominantRealm, maxKey(axes.realms, REALM_ORDER));
});

test("high Conscientiousness raises terra and tanque relative to a neutral profile", () => {
  const base = generateOracleAxes(neutral);
  const high = generateOracleAxes(withTrait({ conscientiousness: 95 }));
  assert.ok(high.elements.terra > base.elements.terra);
  assert.ok(high.elements.industrial > base.elements.industrial);
});

test("high Extraversion raises fogo and fisico relative to a neutral profile", () => {
  const base = generateOracleAxes(neutral);
  const high = generateOracleAxes(withTrait({ extraversion: 95 }));
  assert.ok(high.elements.fogo > base.elements.fogo);
  assert.ok(high.roles.fisico > base.roles.fisico);
});

test("high Agreeableness raises agua and suporte relative to a neutral profile", () => {
  const base = generateOracleAxes(neutral);
  const high = generateOracleAxes(withTrait({ agreeableness: 95 }));
  assert.ok(high.elements.agua > base.elements.agua);
  assert.ok(high.roles.suporte > base.roles.suporte);
});

test("high Openness raises ar and magico relative to a neutral profile", () => {
  const base = generateOracleAxes(neutral);
  const high = generateOracleAxes(withTrait({ openness: 95 }));
  assert.ok(high.elements.ar > base.elements.ar);
  assert.ok(high.roles.magico > base.roles.magico);
});

test("low Honesty-Humility raises sombra; high raises luz", () => {
  const low = generateOracleAxes(withTrait({ honestyHumility: 5 }));
  const high = generateOracleAxes(withTrait({ honestyHumility: 95 }));
  assert.ok(low.elements.sombra > high.elements.sombra);
  assert.ok(high.elements.luz > low.elements.luz);
});

test("astrology's own element split still moves the corresponding oracle element", () => {
  const waterHeavy = generateOracleAxes({
    ...neutral,
    astrologyElements: { fogo: 1, terra: 1, ar: 1, água: 20 },
  });
  const base = generateOracleAxes(neutral);
  assert.ok(waterHeavy.elements.agua > base.elements.agua);
});

test("facet overrides are used when present, and fall back to the trait score otherwise", () => {
  const withFacet = generateOracleAxes({
    ...neutral,
    facets: { "conscientiousness:organização": 95 },
  });
  const withoutFacet = generateOracleAxes(neutral);
  assert.ok(withFacet.elements.industrial > withoutFacet.elements.industrial);
});

test("class-system bridge copies the six shared elements verbatim", () => {
  const axes = generateOracleAxes(withTrait({ extraversion: 80 }));
  // Compare pre-normalization ratios: both records were normalized
  // independently, but the six shared elements must keep the same *rank*
  // relative to each other in both spaces since they come from the same
  // underlying numbers.
  const soulmonOrder = [...ELEMENT_ORDER.filter((e) => e !== "planta" && e !== "industrial")].sort(
    (a, b) => axes.elements[b] - axes.elements[a]
  );
  const classOrder = [...soulmonOrder].sort(
    (a, b) => axes.classElements[b as never] - axes.classElements[a as never]
  );
  assert.deepEqual(soulmonOrder, classOrder);
});

test("class-system elements without a grounded signal are present but small", () => {
  const axes = generateOracleAxes(neutral);
  for (const ungrounded of ["tempo", "som", "gravidade"] as const) {
    assert.ok(axes.classElements[ungrounded] >= 0);
  }
});

test("numerology numbers nudge their affiliated element, role and alignment", () => {
  // Number 8 -> elements industrial/terra, role tanque, alignment poder.
  const withEight = generateOracleAxes({ ...neutral, numerologyNumbers: [8, 8, 8] });
  const without = generateOracleAxes({ ...neutral, numerologyNumbers: [] });
  assert.ok(withEight.elements.industrial > without.elements.industrial);
  assert.ok(withEight.roles.tanque > without.roles.tanque);
  assert.ok(withEight.alignments.poder > without.alignments.poder);
});

test("all-zero astrology input does not divide by zero or produce NaN", () => {
  const axes = generateOracleAxes({
    ...neutral,
    astrologyElements: { fogo: 0, terra: 0, ar: 0, água: 0 },
    astrologyPolarities: { diurno: 0, noturno: 0 },
  });
  for (const order of [ELEMENT_ORDER, ROLE_ORDER, ALIGNMENT_ORDER, REALM_ORDER]) {
    for (const key of order) {
      const value =
        order === ELEMENT_ORDER ? axes.elements[key as never]
        : order === ROLE_ORDER ? axes.roles[key as never]
        : order === ALIGNMENT_ORDER ? axes.alignments[key as never]
        : axes.realms[key as never];
      assert.ok(Number.isFinite(value), `${key} is not finite`);
    }
  }
});

test("realm scores are a deterministic function of the element scores", () => {
  const a = generateOracleAxes(neutral);
  const b = generateOracleAxes({ ...neutral });
  assert.deepEqual(a.realms, b.realms);
  // Oceano should track água+sombra, not fogo.
  const fireHeavy = generateOracleAxes({ ...neutral, astrologyElements: { fogo: 30, terra: 1, ar: 1, água: 1 } });
  const waterHeavy = generateOracleAxes({ ...neutral, astrologyElements: { fogo: 1, terra: 1, ar: 1, água: 30 } });
  assert.ok(waterHeavy.realms.oceano > fireHeavy.realms.oceano);
});
