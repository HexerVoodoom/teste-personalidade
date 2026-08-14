import assert from "node:assert/strict";
import test from "node:test";
import { items, likertItems, forcedChoiceItems, scenarioItems } from "./questions";
import { scoreProfile, isComplete, computeValidity } from "./scoring";
import { Answers, LikertValue, TRAIT_DIMENSIONS, JUNG_AXES } from "./types";

/** Builds a complete answer set from a per-item decision function. */
function buildAnswers(
  likertFor: (item: (typeof likertItems)[number]) => LikertValue,
  choice: "a" | "b" = "a",
  scenarioOption = "a"
): Answers {
  const answers: Answers = {};
  for (const item of items) {
    if (item.kind === "likert" || item.kind === "frequency") {
      answers[item.id] = { kind: "likert", value: likertFor(item) };
    } else if (item.kind === "forced-choice") {
      answers[item.id] = { kind: "forced-choice", choice };
    } else {
      answers[item.id] = { kind: "scenario", optionId: scenarioOption };
    }
  }
  return answers;
}

test("item bank is keying-balanced within every facet", () => {
  const byFacet = new Map<string, { positive: number; negative: number }>();
  for (const item of likertItems) {
    const key = `${item.dimension}:${item.facet}`;
    const acc = byFacet.get(key) ?? { positive: 0, negative: 0 };
    if (item.positive) acc.positive++;
    else acc.negative++;
    byFacet.set(key, acc);
  }
  assert.ok(byFacet.size >= 18, `expected at least 18 facets, got ${byFacet.size}`);
  for (const [facet, counts] of byFacet) {
    assert.equal(counts.positive, counts.negative, `${facet} is not keying-balanced`);
  }
});

test("every trait dimension is covered by at least three facets", () => {
  for (const dim of TRAIT_DIMENSIONS) {
    const facets = new Set(likertItems.filter((i) => i.dimension === dim).map((i) => i.facet));
    assert.ok(facets.size >= 3, `${dim} has only ${facets.size} facets`);
  }
});

test("every Jungian axis is covered by forced-choice items", () => {
  for (const axis of JUNG_AXES) {
    const count = forcedChoiceItems.filter((i) => i.dimension === axis).length;
    assert.ok(count >= 3, `axis ${axis} has only ${count} items`);
  }
});

test("item ids are unique", () => {
  const ids = items.map((i) => i.id);
  assert.equal(new Set(ids).size, ids.length);
});

test("interleaving never leaves a long run of the same format", () => {
  let run = 1;
  for (let i = 1; i < items.length; i++) {
    const same =
      items[i].kind === items[i - 1].kind ||
      (["likert", "frequency"].includes(items[i].kind) &&
        ["likert", "frequency"].includes(items[i - 1].kind));
    run = same ? run + 1 : 1;
    assert.ok(run <= 3, `run of ${run} same-format items ending at index ${i}`);
  }
});

test("scenario weights stay inside the 0-4 scale and cover declared dimensions", () => {
  for (const scenario of scenarioItems) {
    assert.ok(scenario.options.length >= 3);
    for (const option of scenario.options) {
      for (const dim of scenario.covers) {
        const w = option.weights[dim];
        assert.ok(w !== undefined, `${scenario.id}/${option.id} misses ${dim}`);
        assert.ok(w >= 0 && w <= 4, `${scenario.id}/${option.id} ${dim} = ${w}`);
      }
    }
    // A scenario that never varies on a dimension carries no information.
    for (const dim of scenario.covers) {
      const values = scenario.options.map((o) => o.weights[dim]);
      assert.ok(new Set(values).size > 1, `${scenario.id} is flat on ${dim}`);
    }
  }
});

test("agreeing with everything lands near the midpoint, not at the ceiling", () => {
  // This is the payoff of balanced keying: a yea-sayer cannot max out a trait.
  const answers = buildAnswers(() => 5);
  const profile = scoreProfile(answers);
  for (const dim of TRAIT_DIMENSIONS) {
    const score = profile.traits[dim].score;
    assert.ok(score > 25 && score < 75, `${dim} = ${score} for an all-agree protocol`);
  }
});

test("keyed-consistent answering drives facets to their extremes", () => {
  // Facet scores come only from Likert items, so answering in the direction of
  // each item's keying must pin every facet at the ceiling, then the floor.
  const high = scoreProfile(buildAnswers((item) => (item.positive ? 5 : 1)));
  for (const dim of TRAIT_DIMENSIONS) {
    for (const facet of high.traits[dim].facets) {
      assert.equal(facet.score, 100, `${dim}.${facet.facet} = ${facet.score}`);
    }
  }

  const low = scoreProfile(buildAnswers((item) => (item.positive ? 1 : 5)));
  for (const dim of TRAIT_DIMENSIONS) {
    for (const facet of low.traits[dim].facets) {
      assert.equal(facet.score, 0, `${dim}.${facet.facet} = ${facet.score}`);
    }
  }
});

test("trait scores separate widely between keyed-high and keyed-low protocols", () => {
  // Scenarios also feed the factor scores and deliberately pull in their own
  // direction, so factor scores are not expected to pin at 0/100 — but the two
  // protocols must still be far apart on every trait.
  const high = scoreProfile(buildAnswers((item) => (item.positive ? 5 : 1), "a", "a"));
  const low = scoreProfile(buildAnswers((item) => (item.positive ? 1 : 5), "b", "d"));
  for (const dim of TRAIT_DIMENSIONS) {
    const gap = high.traits[dim].score - low.traits[dim].score;
    assert.ok(gap >= 30, `${dim} separated by only ${gap} points`);
  }
});

test("all scores stay within 0-100", () => {
  for (const value of [1, 2, 3, 4, 5] as LikertValue[]) {
    const profile = scoreProfile(buildAnswers(() => value));
    for (const dim of TRAIT_DIMENSIONS) {
      const t = profile.traits[dim];
      assert.ok(t.score >= 0 && t.score <= 100, `${dim} = ${t.score}`);
      for (const f of t.facets) {
        assert.ok(f.score >= 0 && f.score <= 100, `${dim}.${f.facet} = ${f.score}`);
      }
    }
    for (const axis of JUNG_AXES) {
      const a = profile.jung.axes[axis];
      assert.ok(a.score >= 0 && a.score <= 100);
      assert.ok(a.clarity >= 0 && a.clarity <= 100);
    }
  }
});

test("forced choices drive the Jungian code", () => {
  const allA = scoreProfile(buildAnswers(() => 3, "a"));
  assert.equal(allA.jung.code, "ESTJ");
  assert.deepEqual(allA.jung.weakAxes, []);

  const allB = scoreProfile(buildAnswers(() => 3, "b"));
  assert.equal(allB.jung.code, "INFP");
});

test("a coin-flip Jungian profile is reported as low clarity", () => {
  const answers = buildAnswers(() => 3, "a");
  // Flip half of each axis's items to B so every axis sits near 50/50.
  const seen: Record<string, number> = {};
  for (const item of forcedChoiceItems) {
    seen[item.dimension] = (seen[item.dimension] ?? 0) + 1;
    if (seen[item.dimension] % 2 === 0) {
      answers[item.id] = { kind: "forced-choice", choice: "b" };
    }
  }
  const profile = scoreProfile(answers);
  assert.ok(profile.jung.weakAxes.length >= 3, `weak axes: ${profile.jung.weakAxes}`);
});

test("validity flags a yea-sayer", () => {
  const v = computeValidity(buildAnswers(() => 5));
  assert.ok(v.acquiescence >= 90);
  assert.equal(v.trustworthy, false);
  assert.ok(v.flags.some((f) => f.includes("aquiescência")));
});

test("validity flags a straight-liner on the midpoint", () => {
  const v = computeValidity(buildAnswers(() => 3));
  assert.equal(v.midpointResponding, 100);
  assert.equal(v.trustworthy, false);
});

test("validity accepts a coherent protocol", () => {
  const v = computeValidity(buildAnswers((item) => (item.positive ? 4 : 2)));
  assert.equal(v.inconsistency, 0);
  assert.equal(v.trustworthy, true);
  assert.deepEqual(v.flags, []);
});

test("validity detects contradictory answers on consistency pairs", () => {
  // Answer 5 to every item, ignoring keying: paired items then disagree maximally.
  const v = computeValidity(buildAnswers(() => 5));
  assert.ok(v.inconsistency >= 90, `inconsistency = ${v.inconsistency}`);
});

test("partial answers are scored without throwing and report progress", () => {
  const answers: Answers = {};
  const first = items.slice(0, 5);
  for (const item of first) {
    if (item.kind === "likert" || item.kind === "frequency") {
      answers[item.id] = { kind: "likert", value: 4 };
    } else if (item.kind === "forced-choice") {
      answers[item.id] = { kind: "forced-choice", choice: "a" };
    } else {
      answers[item.id] = { kind: "scenario", optionId: "a" };
    }
  }
  assert.equal(isComplete(answers), false);
  const profile = scoreProfile(answers);
  assert.equal(profile.answeredCount, 5);
  assert.equal(profile.totalItems, items.length);
  for (const dim of TRAIT_DIMENSIONS) {
    assert.ok(Number.isFinite(profile.traits[dim].score));
  }
});

test("an empty protocol returns neutral scores rather than NaN", () => {
  const profile = scoreProfile({});
  for (const dim of TRAIT_DIMENSIONS) {
    assert.equal(profile.traits[dim].score, 50);
  }
  assert.equal(profile.answeredCount, 0);
});

test("mismatched answer kinds are ignored instead of corrupting scores", () => {
  const answers: Answers = {};
  for (const item of items) {
    // Deliberately send the wrong payload shape for every item.
    answers[item.id] = { kind: "scenario", optionId: "nope" };
  }
  const profile = scoreProfile(answers);
  for (const dim of TRAIT_DIMENSIONS) {
    assert.equal(profile.traits[dim].score, 50);
  }
});

test("tag weights are emitted and ranked for downstream systems", () => {
  const profile = scoreProfile(buildAnswers((item) => (item.positive ? 5 : 1)));
  assert.ok(profile.dominantTags.length > 0);
  const weights = profile.dominantTags.map((t) => profile.tagWeights[t]);
  for (let i = 1; i < weights.length; i++) {
    assert.ok(weights[i - 1] >= weights[i], "dominantTags must be sorted by weight");
  }
});

test("traitPoints exposes every trait and Jungian axis", () => {
  const profile = scoreProfile(buildAnswers(() => 4));
  for (const dim of TRAIT_DIMENSIONS) {
    assert.ok(dim in profile.traitPoints);
  }
  for (const axis of JUNG_AXES) {
    assert.ok(`jung_${axis}` in profile.traitPoints);
  }
});
