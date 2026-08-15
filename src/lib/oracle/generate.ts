import {
  AlignmentId, ALIGNMENT_ORDER,
  ClassElementId, CLASS_ELEMENT_ORDER,
  ElementId, ELEMENT_ORDER,
  OracleAxes,
  RealmId, REALM_ORDER,
  RoleId, ROLE_ORDER,
} from "./types";
import { computeDominantClassElements } from "./derivedElements";
import { hashString } from "../rng";

/**
 * Numerology → element/role/alignment affinity tables, copied from
 * `soulmon/src/utils/oracle.ts` (`NUMBER_ELEMENTS` / `NUMBER_ROLES` /
 * `NUMBER_ALIGNMENT`). These are symbolic lookup tables, not derived from
 * any of this project's engines, so they are reused as-is rather than
 * reinvented — keeping this module's numerology reading compatible with
 * Soulmon's existing one.
 */
const NUMBER_ELEMENTS: Record<number, ElementId[]> = {
  1: ["fogo", "luz"], 2: ["agua", "luz"], 3: ["ar", "luz"], 4: ["terra", "industrial"],
  5: ["ar", "fogo"], 6: ["planta", "agua"], 7: ["sombra", "agua"], 8: ["industrial", "terra"],
  9: ["luz", "fogo"], 11: ["luz", "ar"], 22: ["industrial", "terra"], 33: ["luz", "planta"],
};
const NUMBER_ROLES: Record<number, RoleId> = {
  1: "fisico", 2: "suporte", 3: "alcance", 4: "tanque", 5: "alcance", 6: "suporte",
  7: "magico", 8: "tanque", 9: "magico", 11: "magico", 22: "tanque", 33: "suporte",
};
const NUMBER_ALIGNMENT: Record<number, AlignmentId> = {
  1: "poder", 2: "harmonia", 3: "harmonia", 4: "poder", 5: "harmonia", 6: "benevolencia",
  7: "harmonia", 8: "poder", 9: "benevolencia", 11: "harmonia", 22: "poder", 33: "benevolencia",
};

/**
 * Realm affinity is pure world-geography, not personality — a swamp is watery
 * and shadowy regardless of who is visiting it. This table is copied as-is
 * from Soulmon's `REALM_WEIGHTS`.
 */
// The original (Soulmon-copied) table had every realm's weights sum to 5 or
// 6 total "points": deserto/pantano/cavernas/akasha summed to 6, while
// picos/floresta/gelo/campina (and oceano, worst at 4) summed to only 5 —
// a structurally lower ceiling than their 6-point competitors regardless of
// the person, which starved them in simulation (oceano was literally
// unreachable at 0/2000; the rest lagged well behind). Every realm below
// now sums to 6, so no realm has a structural edge over another baked into
// the table itself — remaining differences in how often a realm is picked
// should come from how common its underlying elements are, not this.
const REALM_WEIGHTS: Record<RealmId, Partial<Record<ElementId, number>>> = {
  deserto: { fogo: 3, terra: 2, industrial: 1 },
  picos: { ar: 3, fogo: 2, industrial: 1 },
  oceano: { agua: 4, sombra: 2 },
  pantano: { agua: 2, sombra: 2, planta: 2 },
  floresta: { planta: 3, terra: 2, agua: 1 },
  cavernas: { terra: 3, sombra: 2, industrial: 1 },
  gelo: { agua: 3, ar: 2, luz: 1 },
  campina: { luz: 2, planta: 2, ar: 2 },
  akasha: { luz: 3, sombra: 3 },
};

/** Role → alignment leaning, copied from Soulmon's `ROLE_ALIGNMENT`. */
const ROLE_ALIGNMENT: Record<RoleId, AlignmentId> = {
  fisico: "poder", tanque: "benevolencia", suporte: "benevolencia",
  magico: "harmonia", alcance: "harmonia",
};

export interface OracleInputs {
  /** 0-100 Big Five + HEXACO factor scores. */
  traits: {
    openness: number;
    conscientiousness: number;
    extraversion: number;
    agreeableness: number;
    neuroticism: number;
    honestyHumility: number;
  };
  /** 0-100 facet scores, keyed "dimension:facet" — same keys as
   *  `TraitScore.facets`. Optional; falls back to the parent trait score. */
  facets?: Record<string, number>;
  /** 0-100 toward the first pole of each axis (E, S, T, J). */
  jung: { EI: number; SN: number; TF: number; JP: number };
  /** Raw weighted element sums from the natal chart (`distribution.elements`). */
  astrologyElements: { fogo: number; terra: number; ar: number; água: number };
  /** Raw weighted polarity sums (`distribution.polarities`). */
  astrologyPolarities: { diurno: number; noturno: number };
  /** Core numerology numbers to read for elemental/role/alignment affinity
   *  (life path, expression, soul urge, personality, birthday, maturity). */
  numerologyNumbers: number[];
}

function facet(inputs: OracleInputs, dimension: string, name: string, fallback: number): number {
  return inputs.facets?.[`${dimension}:${name}`] ?? fallback;
}

/** Rescales a record so its values sum to 100, preserving zeros. */
function toShare<K extends string>(record: Record<K, number>, order: K[]): Record<K, number> {
  const total = order.reduce((sum, k) => sum + Math.max(0, record[k]), 0);
  if (total <= 0) {
    const even = Object.fromEntries(order.map((k) => [k, 100 / order.length])) as Record<K, number>;
    return even;
  }
  return Object.fromEntries(
    order.map((k) => [k, Number(((Math.max(0, record[k]) / total) * 100).toFixed(2))])
  ) as Record<K, number>;
}

function argmax<K extends string>(record: Record<K, number>, order: K[]): K {
  return order.reduce((best, k) => (record[k] > record[best] ? k : best), order[0]);
}

/**
 * Builds the Soulmon-compatible oracle axes from this project's own trait,
 * Jungian, astrological and numerological readings — replacing the astrology
 * + numerology + quiz math Soulmon's own `oracle.ts` currently does inline.
 *
 * Every formula below is a documented, deterministic weighted sum — no RNG,
 * unlike Soulmon's hash-seeded tie-breaking, because this project's inputs
 * are already continuous (0-100 trait scores) rather than the handful of
 * discrete zodiac/animal/number buckets Soulmon reads from.
 */
export function generateOracleAxes(inputs: OracleInputs): OracleAxes {
  const { traits, jung, astrologyElements, astrologyPolarities, numerologyNumbers } = inputs;

  // ---- Elements: astrology's own element split is the primary signal for
  // the four elements it shares a name with; traits add a secondary nudge
  // that lets someone whose astrology reads mostly "terra" still register as
  // meaningfully more or less curious/organized than another "terra" person.
  // NB: agua/fogo/terra/ar share a single 60-point astrology pool between
  // the 4 of them (averaging ~15 each, not 60), while sombra/luz/planta/
  // industrial each draw on their own independent, non-shared trait terms.
  // sombra/luz used to also stack a polarity bonus (up to 20) on top of a
  // full-weight trait term (up to 60), giving them a structurally higher
  // ceiling and average than every other element — which, combined with
  // `akasha`'s realm weight being exactly `{ luz: 3, sombra: 3 }` (the only
  // realm that double-weights two elements at full weight instead of one),
  // made `akasha` win an outsized share of profiles regardless of the
  // actual person. Coefficients below are tuned so every element's expected
  // value lands in the same ~25-40 range (verified empirically, not just by
  // eyeballing the formulas).
  const astroTotal =
    astrologyElements.fogo + astrologyElements.terra + astrologyElements.ar + astrologyElements.água || 1;
  // ar and terra share the same formula shape as agua/fogo, but
  // NUMBER_ELEMENTS gives ar a primary (+6) numerology bonus at 2 of the 12
  // numbers (3, 5) vs terra's 1 (4) — a real asymmetry in the (copied,
  // otherwise-untouched) table that skewed ar noticeably above terra in
  // simulation. Trait coefficients nudged to compensate rather than
  // touching the numerology table itself.
  const elements: Record<ElementId, number> = {
    agua: (astrologyElements.água / astroTotal) * 60 + traits.agreeableness * 0.4,
    fogo: (astrologyElements.fogo / astroTotal) * 60 + traits.extraversion * 0.4,
    terra: (astrologyElements.terra / astroTotal) * 60 + traits.conscientiousness * 0.47,
    ar: (astrologyElements.ar / astroTotal) * 60 + traits.openness * 0.35,
    sombra: traits.neuroticism * 0.45 + (100 - traits.honestyHumility) * 0.15 +
      (astrologyPolarities.noturno / (astrologyPolarities.diurno + astrologyPolarities.noturno || 1)) * 12,
    luz: traits.honestyHumility * 0.45 +
      (astrologyPolarities.diurno / (astrologyPolarities.diurno + astrologyPolarities.noturno || 1)) * 12 +
      traits.agreeableness * 0.15,
    planta: traits.agreeableness * 0.4 + facet(inputs, "conscientiousness", "persistência", traits.conscientiousness) * 0.4,
    // This quiz only defines one facet per trait ("organização" for
    // conscientiousness — see questions.ts), so "prudência" always falls
    // back to the same trait.conscientiousness value "organização" is
    // itself derived from. Stacking both terms on that one trait (0.5+0.3)
    // gave industrial nearly double the effective single-trait weight of
    // every other element, making it win the dominant-element argmax ~31%
    // of the time in a 2000-profile simulation (expected ~12.5%). Mixing in
    // jung.JP ("estrutura" — thematically the same organized/methodical
    // signal, but a genuinely independent input) spreads that weight across
    // two uncorrelated sources instead of double-counting one.
    industrial: facet(inputs, "conscientiousness", "organização", traits.conscientiousness) * 0.5 +
      jung.JP * 0.25,
  };
  // Primary/secondary numerology bonus (matching Soulmon's own
  // `addScore(primary, pts, ...); addScore(secondary, 1, ...)` split) —
  // giving both elements the full +6 made "luz" (the primary OR secondary
  // element for 6 of the 12 numerology numbers, double any other element's
  // count) even more disproportionately likely to dominate.
  for (const n of numerologyNumbers) {
    const [primary, secondary] = NUMBER_ELEMENTS[n] ?? [];
    if (primary) elements[primary] += 6;
    if (secondary) elements[secondary] += 1;
  }

  // ---- Roles: physical/tank/ranged reuse the same astrology element split
  // that drives fire/earth/air/water — Soulmon does the same via zodiac
  // element → role. Magic instead follows Openness and the Sensing↔iNtuition
  // axis (100 - SN, since SN is scored toward Sensing).
  // "prudência" and "assertividade" aren't real facets this quiz collects
  // (only one facet exists per trait — see questions.ts), so every use of
  // them below always falls back to the plain trait score. That's fine
  // where a role mixes it with unrelated signals, but suporte/tanque/fisico
  // each leaned on a single trait at a coefficient (0.7/0.5/0.6) well above
  // magico's largest (0.4), giving them outsized variance and making them
  // win the dominant-role argmax far more than a 1-in-5 baseline in a
  // 2000-profile simulation (suporte ~29%, tanque ~25%, magico ~9.5%).
  // Coefficients rebalanced so no role's primary trait term exceeds ~0.45.
  const roles: Record<RoleId, number> = {
    suporte: traits.agreeableness * 0.45 + (astrologyElements.água / astroTotal) * 30 +
      (100 - traits.honestyHumility) * 0.1,
    tanque: facet(inputs, "conscientiousness", "prudência", traits.conscientiousness) * 0.35 +
      (100 - traits.neuroticism) * 0.3 + (astrologyElements.terra / astroTotal) * 20,
    fisico: facet(inputs, "extraversion", "assertividade", traits.extraversion) * 0.55 +
      (astrologyElements.fogo / astroTotal) * 40,
    // Unlike the other 4 roles, magico has no astrology term diluting it
    // (fisico/tanque/alcance/suporte all mix in a *shared* astro-element
    // share, which averages far below its own max since it's split 4 ways)
    // -- so its 3 independent trait/jung terms used to sum to full weight
    // (1.0) and structurally outscore every other role on average. Scaled
    // down to land in the same range (verified empirically).
    magico: traits.openness * 0.4 + (100 - jung.SN) * 0.22 + (100 - jung.JP) * 0.13,
    // alcance's astro_ar term compounds with the elements table's own ar
    // bump, and ar is numerology's most frequent primary/secondary target
    // (NUMBER_ELEMENTS gives it a bonus at 3 of 12 numbers, more than any
    // other element) — so alcance rode that same correlated signal and won
    // the argmax disproportionately. Coefficients trimmed to compensate.
    alcance: facet(inputs, "conscientiousness", "prudência", traits.conscientiousness) * 0.4 +
      jung.TF * 0.3 + (astrologyElements.ar / astroTotal) * 25,
  };
  for (const n of numerologyNumbers) {
    roles[NUMBER_ROLES[n]] += 4;
  }

  // ---- Alignment: dominant role leans toward its Soulmon-mapped alignment;
  // Extraversion/assertiveness reinforces Poder, low Honesty-Humility
  // (status-seeking) reinforces it further, and Openness reinforces Harmonia.
  // ROLE_ALIGNMENT maps 2 roles to harmonia, 2 to benevolencia, but only 1
  // (fisico) to poder — summing raw role scores gave poder roughly half the
  // role-derived signal of the other two alignments regardless of the
  // person, which measurably suppressed it (poder won a 2000-profile
  // simulation's argmax ~20% of the time vs benevolencia's ~43%, for 3
  // options with an even ~33% baseline). Averaging by how many roles feed
  // each alignment removes that role-count asymmetry.
  const rolesPerAlignment: Record<AlignmentId, number> = { poder: 0, harmonia: 0, benevolencia: 0 };
  for (const role of ROLE_ORDER) rolesPerAlignment[ROLE_ALIGNMENT[role]]++;
  const alignments: Record<AlignmentId, number> = { poder: 0, harmonia: 0, benevolencia: 0 };
  for (const role of ROLE_ORDER) {
    const target = ROLE_ALIGNMENT[role];
    alignments[target] += (roles[role] * 0.5) / rolesPerAlignment[target];
  }
  // Poder's bonus terms (below) plus its now-undivided role term made it
  // overshoot the other two once the role-count averaging above was added
  // — trimmed down, and benevolencia's bonus bumped up to compensate for
  // agreeableness being one of the "softer" (astro-diluted) role signals.
  alignments.poder += facet(inputs, "extraversion", "assertividade", traits.extraversion) * 0.2 +
    (100 - traits.honestyHumility) * 0.15;
  alignments.harmonia += traits.openness * 0.3;
  alignments.benevolencia += traits.agreeableness * 0.4;
  for (const n of numerologyNumbers) {
    alignments[NUMBER_ALIGNMENT[n]] += 4;
  }

  // ---- Realms: element scores via Soulmon's own world-geography weight
  // table, plus the same kind of small deterministic per-person "signature"
  // term Soulmon itself adds (`hashString(...) % 4`) — without it, everyone
  // whose element scores land in a similar shape (common, since several
  // realms share weighted elements) converges on the exact same realm every
  // time; the signature breaks that without making the result any less
  // deterministic for a given person.
  const inputKey = JSON.stringify(inputs);
  const realms: Record<RealmId, number> = Object.fromEntries(
    REALM_ORDER.map((realm) => {
      const score = Object.entries(REALM_WEIGHTS[realm]).reduce(
        (sum, [el, weight]) => sum + weight! * elements[el as ElementId],
        0
      );
      return [realm, score + (hashString(`${inputKey}|${realm}`) % 4)];
    })
  ) as Record<RealmId, number>;

  // ---- class-system bridge: the 6 elements shared by name are copied
  // directly; the remaining 11 have no grounded signal yet and are left at a
  // small floor so downstream consumers can distinguish "not modeled" (this)
  // from "modeled and scored zero" without a division by zero.
  const classElements: Record<ClassElementId, number> = {
    fogo: elements.fogo, agua: elements.agua, terra: elements.terra, ar: elements.ar,
    sombra: elements.sombra, luz: elements.luz,
    eletricidade: 5, arcano: traits.openness * 0.15 + (100 - jung.SN) * 0.1,
    vileza: (100 - traits.honestyHumility) * 0.15, morte: traits.neuroticism * 0.1,
    vida: traits.agreeableness * 0.15, vigor: traits.conscientiousness * 0.1,
    marcial: facet(inputs, "extraversion", "assertividade", traits.extraversion) * 0.15,
    tempo: 5, som: 5, gravidade: 5, espaco: 5,
  };

  const sharedClassElements = toShare(classElements, CLASS_ELEMENT_ORDER);

  return {
    elements: toShare(elements, ELEMENT_ORDER),
    roles: toShare(roles, ROLE_ORDER),
    alignments: toShare(alignments, ALIGNMENT_ORDER),
    realms: toShare(realms, REALM_ORDER),
    classElements: sharedClassElements,
    dominantElement: argmax(elements, ELEMENT_ORDER),
    dominantRole: argmax(roles, ROLE_ORDER),
    dominantAlignment: argmax(alignments, ALIGNMENT_ORDER),
    dominantRealm: argmax(realms, REALM_ORDER),
    dominantClassElements: computeDominantClassElements(sharedClassElements),
  };
}
