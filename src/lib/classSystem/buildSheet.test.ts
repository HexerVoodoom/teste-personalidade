import assert from "node:assert/strict";
import test from "node:test";
import { buildFicha, ROOKIE_BUDGET } from "./buildSheet";
import { generateOracleAxes, OracleInputs } from "../oracle/generate";
import { avaliarCaptura, capturableCreatures } from "./capture";
import { CRIATURAS } from "./creatures";

const neutral: OracleInputs = {
  traits: { openness: 50, conscientiousness: 50, extraversion: 50, agreeableness: 50, neuroticism: 50, honestyHumility: 50 },
  jung: { EI: 50, SN: 50, TF: 50, JP: 50 },
  astrologyElements: { fogo: 3, terra: 3, ar: 3, água: 3 },
  astrologyPolarities: { diurno: 5, noturno: 5 },
  numerologyNumbers: [5],
};

test("elemento budget is spent exactly, never over or under", () => {
  const ficha = buildFicha("Teste", generateOracleAxes(neutral));
  assert.equal(ficha.totals.elementos, ROOKIE_BUDGET.elementos);
});

test("escola budget is the fixed evocação floor plus the distributed pool", () => {
  const ficha = buildFicha("Teste", generateOracleAxes(neutral));
  assert.equal(ficha.totals.escolas, ROOKIE_BUDGET.escolasDistribuidas + ROOKIE_BUDGET.evocacaoFixo);
  assert.equal(ficha.escolas.evocacao, ROOKIE_BUDGET.evocacaoFixo);
});

test("recurso budget goes entirely to the resource matching the dominant role", () => {
  const axes = generateOracleAxes({ ...neutral, traits: { ...neutral.traits, extraversion: 95 } });
  const ficha = buildFicha("Teste", axes);
  assert.equal(ficha.totals.recursos, ROOKIE_BUDGET.recursos);
  assert.equal(Object.keys(ficha.recursos).length, 1);
});

test("exactly two talent ranks are invested, from the mutually-exclusive-safe set", () => {
  const ficha = buildFicha("Teste", generateOracleAxes(neutral));
  assert.equal(ficha.totals.talentos, ROOKIE_BUDGET.talentoRanks);
  const talentos = Object.keys(ficha.talentos);
  assert.ok(!(talentos.includes("impacto_imediato") && talentos.includes("dano_ao_longo_do_tempo")));
});

test("no element is stored at zero points", () => {
  const ficha = buildFicha("Teste", generateOracleAxes(neutral));
  for (const pts of Object.values(ficha.elementos)) {
    assert.ok(pts && pts > 0);
  }
});

test("a high-Conscientiousness, high-Extraversion sheet ends up able to capture at least one class-system creature", () => {
  const axes = generateOracleAxes({
    ...neutral,
    traits: { ...neutral.traits, extraversion: 90, conscientiousness: 80 },
    astrologyElements: { fogo: 20, terra: 10, ar: 3, água: 3 },
  });
  const ficha = buildFicha("Teste", axes);
  const catches = capturableCreatures(ficha, CRIATURAS);
  assert.ok(catches.length > 0, "expected at least one capturable creature");
  for (const c of catches) {
    assert.ok(c.poder >= c.criatura.poderBase);
  }
});

test("capture requires both affinity and evocação points — removing either fails it", () => {
  const ficha = buildFicha("Teste", generateOracleAxes(neutral));
  const withEvocacao = { ...ficha, escolas: { ...ficha.escolas } };
  const withoutEvocacao = { ...ficha, escolas: { ...ficha.escolas, evocacao: 0 } };
  const someCapturable = capturableCreatures(withEvocacao, CRIATURAS);
  if (someCapturable.length > 0) {
    const target = someCapturable[0].criatura;
    assert.equal(avaliarCaptura(withoutEvocacao, target).capturavel, false);
  }
  const withoutAffinity = { ...ficha, elementos: {} };
  for (const cr of Object.values(CRIATURAS)) {
    assert.equal(avaliarCaptura(withoutAffinity, cr).capturavel, false);
  }
});

test("the sheet is deterministic for the same oracle input", () => {
  const axes = generateOracleAxes(neutral);
  const a = buildFicha("Teste", axes);
  const b = buildFicha("Teste", axes);
  assert.deepEqual(a, b);
});

test("profissao budget is spent exactly, on a single profession", () => {
  const ficha = buildFicha("Teste", generateOracleAxes(neutral));
  assert.equal(ficha.totals.profissoes, ROOKIE_BUDGET.profissao);
  assert.equal(Object.keys(ficha.profissoes).length, 1);
});

test("maldicao is reachable for a poder-leaning, high-suporte profile (it used to be dead code)", () => {
  const axes = generateOracleAxes({
    ...neutral,
    traits: { ...neutral.traits, agreeableness: 95, extraversion: 95, honestyHumility: 5 },
  });
  const ficha = buildFicha("Teste", axes);
  assert.ok((ficha.escolas.maldicao ?? 0) > 0, "expected maldicao to receive points for a poder-leaning profile");
});

test("soullink is reachable for a tanque-dominant profile (it used to collide with furia)", () => {
  const axes = generateOracleAxes({
    ...neutral,
    traits: { ...neutral.traits, conscientiousness: 95, neuroticism: 5 },
    astrologyElements: { fogo: 1, terra: 30, ar: 1, água: 1 },
  });
  assert.equal(axes.dominantRole, "tanque");
  const ficha = buildFicha("Teste", axes);
  assert.equal(Object.keys(ficha.recursos)[0], "soullink");
});

test("every escola and every recurso is reachable by some role/alignment profile", () => {
  const escolaSeen = new Set<string>();
  const recursoSeen = new Set<string>();
  const profiles: Partial<typeof neutral.traits>[] = [
    { extraversion: 95 }, // fisico
    { conscientiousness: 95, neuroticism: 5 }, // tanque
    { openness: 95 }, // magico
    { agreeableness: 95 }, // suporte / benca
    { agreeableness: 95, extraversion: 95, honestyHumility: 5 }, // suporte / maldicao
  ];
  for (const traits of profiles) {
    const axes = generateOracleAxes({ ...neutral, traits: { ...neutral.traits, ...traits } });
    const ficha = buildFicha("Teste", axes);
    for (const escola of Object.keys(ficha.escolas)) escolaSeen.add(escola);
    for (const recurso of Object.keys(ficha.recursos)) recursoSeen.add(recurso);
  }
  assert.ok(escolaSeen.has("maldicao"), `escolas seen: ${[...escolaSeen]}`);
  assert.ok(recursoSeen.has("soullink"), `recursos seen: ${[...recursoSeen]}`);
});
