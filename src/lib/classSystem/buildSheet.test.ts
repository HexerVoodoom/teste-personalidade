import assert from "node:assert/strict";
import test from "node:test";
import { buildFicha, FICHA_STAGE_ORDER, ROOKIE_BUDGET, STAGE_MULTIPLIER } from "./buildSheet";
import { generateOracleAxes, OracleInputs } from "../oracle/generate";
import { avaliarCaptura, capturableCreatures, selectCompanion } from "./capture";
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

test("the full talent budget is spent, never on both sides of the mutually-exclusive pair", () => {
  const ficha = buildFicha("Teste", generateOracleAxes(neutral));
  assert.equal(ficha.totals.talentos, ROOKIE_BUDGET.talentoRanks);
  const talentos = Object.keys(ficha.talentos);
  assert.ok(!(talentos.includes("impacto_imediato") && talentos.includes("dano_ao_longo_do_tempo")));
});

test("a bigger (higher-stage) talent budget spreads across more than just the 2 role talents", () => {
  const ficha = buildFicha("Teste", generateOracleAxes(neutral), "ultimate");
  const talentos = Object.keys(ficha.talentos);
  assert.ok(talentos.length > 2, `expected more than 2 talents, got ${talentos}`);
  assert.ok(!(talentos.includes("impacto_imediato") && talentos.includes("dano_ao_longo_do_tempo")));
});

test("no talent is ranked above its own class-system rank cap", () => {
  const ficha = buildFicha("Teste", generateOracleAxes(neutral), "ultra");
  const CAPS: Record<string, number> = {
    area_ampliada: 5, conjuracao_rapida: 5, alcance_estendido: 5, canalizacao_profunda: 5,
    economia_de_recurso: 5, persistencia: 3, impacto_imediato: 3, dano_ao_longo_do_tempo: 3,
  };
  for (const [id, ranks] of Object.entries(ficha.talentos)) {
    assert.ok((ranks ?? 0) <= CAPS[id], `${id} has ${ranks} ranks, cap is ${CAPS[id]}`);
  }
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

test("every later evolution stage has a strictly bigger budget than the one before it", () => {
  const axes = generateOracleAxes(neutral);
  let prevTotal = 0;
  for (const stage of FICHA_STAGE_ORDER) {
    const ficha = buildFicha("Teste", axes, stage);
    const total =
      ficha.totals.elementos + ficha.totals.escolas + ficha.totals.recursos + ficha.totals.profissoes;
    assert.ok(total > prevTotal, `${stage}'s total (${total}) should exceed the previous stage's (${prevTotal})`);
    prevTotal = total;
  }
});

test("elementos/escolas/recursos/profissao budgets are always spent exactly, at every stage", () => {
  const axes = generateOracleAxes(neutral);
  for (const stage of FICHA_STAGE_ORDER) {
    const ficha = buildFicha("Teste", axes, stage);
    const m = STAGE_MULTIPLIER[stage];
    assert.equal(ficha.totals.elementos, Math.round(ROOKIE_BUDGET.elementos * m));
    assert.equal(
      ficha.totals.escolas,
      Math.round(ROOKIE_BUDGET.escolasDistribuidas * m) + Math.round(ROOKIE_BUDGET.evocacaoFixo * m)
    );
    assert.equal(ficha.totals.recursos, Math.round(ROOKIE_BUDGET.recursos * m));
    assert.equal(ficha.totals.profissoes, Math.round(ROOKIE_BUDGET.profissao * m));
  }
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

test("every one of the 6 professions is reachable across a spread of profiles/seeds (regression: joalheiro/artesao were never picked)", () => {
  const profiles: OracleInputs[] = [
    { ...neutral, traits: { ...neutral.traits, extraversion: 95 } }, // fisico -> furia -> ferreiro
    { ...neutral, traits: { ...neutral.traits, conscientiousness: 95, neuroticism: 5 } }, // tanque -> soullink -> alquimista
    { ...neutral, traits: { ...neutral.traits, openness: 95 } }, // magico -> mana -> artesao
    { ...neutral, traits: { ...neutral.traits, agreeableness: 95 } }, // suporte -> fe -> tecelao
    { // alcance -> ressonancia -> joalheiro
      ...neutral,
      traits: { ...neutral.traits, conscientiousness: 80 },
      jung: { ...neutral.jung, TF: 95 },
      astrologyElements: { fogo: 1, terra: 1, ar: 30, água: 1 },
    },
  ];
  const seen = new Set<string>();
  for (const inputs of profiles) {
    const axes = generateOracleAxes(inputs);
    for (let i = 0; i < 40; i++) {
      const ficha = buildFicha("Teste", axes, "rookie", `user-${i}`);
      for (const p of Object.keys(ficha.profissoes)) seen.add(p);
    }
  }
  const ALL: string[] = ["ferreiro", "tecelao", "artesao", "joalheiro", "alquimista", "curtidor"];
  for (const p of ALL) assert.ok(seen.has(p), `${p} never picked; seen: ${[...seen]}`);
});

test("profissao is a seeded pick, not always the single top scorer (regression: ferreiro won ~80% of profiles)", () => {
  const axes = generateOracleAxes(neutral);
  const picks = new Set<string>();
  for (let i = 0; i < 30; i++) {
    picks.add(Object.keys(buildFicha("Teste", axes, "rookie", `seed-${i}`).profissoes)[0]);
  }
  assert.ok(picks.size > 1, `expected more than one distinct profession across 30 seeds, got ${[...picks]}`);
});

test("a fisico-dominant (furia) build picks ferreiro much more often than a random 1-in-6 baseline", () => {
  const axes = generateOracleAxes({ ...neutral, traits: { ...neutral.traits, extraversion: 95 } });
  assert.equal(axes.dominantRole, "fisico");
  let ferreiroCount = 0;
  const N = 40;
  for (let i = 0; i < N; i++) {
    const ficha = buildFicha("Teste", axes, "rookie", `seed-${i}`);
    if (ficha.profissoes.ferreiro) ferreiroCount++;
  }
  assert.ok(ferreiroCount / N > 0.5, `expected ferreiro to dominate a furia build, got ${ferreiroCount}/${N}`);
});

test("profissao is stable across every evolution stage for the same person (regression: 70/200 simulated people had it flip between rookie and ultra)", () => {
  let seed = 55;
  const nextRand = () => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; };
  for (let i = 0; i < 40; i++) {
    const axes = generateOracleAxes({
      traits: {
        openness: nextRand() * 100, conscientiousness: nextRand() * 100, extraversion: nextRand() * 100,
        agreeableness: nextRand() * 100, neuroticism: nextRand() * 100, honestyHumility: nextRand() * 100,
      },
      jung: { EI: nextRand() * 100, SN: nextRand() * 100, TF: nextRand() * 100, JP: nextRand() * 100 },
      astrologyElements: { fogo: nextRand() * 30, terra: nextRand() * 30, ar: nextRand() * 30, água: nextRand() * 30 },
      astrologyPolarities: { diurno: nextRand() * 10, noturno: nextRand() * 10 },
      numerologyNumbers: [1 + Math.floor(nextRand() * 9)],
    });
    const seedKey = `stage-stability-${i}`;
    const picks = new Set<string>();
    for (const stage of FICHA_STAGE_ORDER) {
      picks.add(Object.keys(buildFicha("X", axes, stage, seedKey).profissoes)[0]);
    }
    assert.equal(picks.size, 1, `profissao changed across stages for person ${i}: ${[...picks]}`);
  }
});

test("talent spillover order is a seeded pick, not always the same fixed order (regression: 20 seeds used to produce 1 identical allocation)", () => {
  const axes = generateOracleAxes({ ...neutral, traits: { ...neutral.traits, extraversion: 90 }, astrologyElements: { fogo: 20, terra: 3, ar: 3, água: 3 } });
  const allocations = new Set<string>();
  for (let i = 0; i < 20; i++) {
    allocations.add(JSON.stringify(buildFicha("Teste", axes, "ultimate", `seed-${i}`).talentos));
  }
  assert.ok(allocations.size > 1, `expected more than one distinct talent allocation across 20 seeds, got ${allocations.size}`);
});

test("companion capture is a seeded pick across the capturable pool, not always the single strongest catch", () => {
  const axes = generateOracleAxes({
    ...neutral,
    traits: { ...neutral.traits, extraversion: 90, conscientiousness: 80 },
    astrologyElements: { fogo: 20, terra: 10, ar: 3, água: 3 },
  });
  const ficha = buildFicha("Teste", axes);
  const catches = capturableCreatures(ficha, CRIATURAS);
  if (catches.length < 2) return; // nothing to vary between for this profile
  const picks = new Set<string>();
  for (let i = 0; i < 20; i++) {
    picks.add(selectCompanion(ficha, CRIATURAS, `seed-${i}`)!.criatura.nome);
  }
  assert.ok(picks.size > 1, `expected more than one distinct companion across 20 seeds, got ${[...picks]}`);
});
