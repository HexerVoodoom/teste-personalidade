import {
  AlignmentId, ALIGNMENT_ORDER,
  ClassElementId, CLASS_ELEMENT_ORDER,
  ElementId, ELEMENT_ORDER,
  OracleAxes,
  RealmId, REALM_ORDER,
  RoleId, ROLE_ORDER,
} from "./types";

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
const REALM_WEIGHTS: Record<RealmId, Partial<Record<ElementId, number>>> = {
  deserto: { fogo: 3, terra: 2, industrial: 1 },
  picos: { ar: 3, fogo: 1, industrial: 1 },
  oceano: { agua: 3, sombra: 1 },
  pantano: { agua: 2, sombra: 2, planta: 2 },
  floresta: { planta: 3, terra: 1, agua: 1 },
  cavernas: { terra: 3, sombra: 2, industrial: 1 },
  gelo: { agua: 2, ar: 2, luz: 1 },
  campina: { luz: 2, planta: 2, ar: 1 },
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
  const astroTotal =
    astrologyElements.fogo + astrologyElements.terra + astrologyElements.ar + astrologyElements.água || 1;
  const elements: Record<ElementId, number> = {
    agua: (astrologyElements.água / astroTotal) * 60 + traits.agreeableness * 0.4,
    fogo: (astrologyElements.fogo / astroTotal) * 60 + traits.extraversion * 0.4,
    terra: (astrologyElements.terra / astroTotal) * 60 + traits.conscientiousness * 0.4,
    ar: (astrologyElements.ar / astroTotal) * 60 + traits.openness * 0.4,
    sombra: traits.neuroticism * 0.6 + (100 - traits.honestyHumility) * 0.2 +
      (astrologyPolarities.noturno / (astrologyPolarities.diurno + astrologyPolarities.noturno || 1)) * 20,
    luz: traits.honestyHumility * 0.6 +
      (astrologyPolarities.diurno / (astrologyPolarities.diurno + astrologyPolarities.noturno || 1)) * 20 +
      traits.agreeableness * 0.2,
    planta: traits.agreeableness * 0.4 + facet(inputs, "conscientiousness", "persistência", traits.conscientiousness) * 0.4,
    industrial: facet(inputs, "conscientiousness", "organização", traits.conscientiousness) * 0.5 +
      facet(inputs, "conscientiousness", "prudência", traits.conscientiousness) * 0.3,
  };
  for (const n of numerologyNumbers) {
    for (const el of NUMBER_ELEMENTS[n] ?? []) elements[el] += 6;
  }

  // ---- Roles: physical/tank/ranged reuse the same astrology element split
  // that drives fire/earth/air/water — Soulmon does the same via zodiac
  // element → role. Magic instead follows Openness and the Sensing↔iNtuition
  // axis (100 - SN, since SN is scored toward Sensing).
  const roles: Record<RoleId, number> = {
    suporte: traits.agreeableness * 0.7 + (astrologyElements.água / astroTotal) * 30,
    tanque: facet(inputs, "conscientiousness", "prudência", traits.conscientiousness) * 0.5 +
      (100 - traits.neuroticism) * 0.3 + (astrologyElements.terra / astroTotal) * 20,
    fisico: facet(inputs, "extraversion", "assertividade", traits.extraversion) * 0.6 +
      (astrologyElements.fogo / astroTotal) * 40,
    magico: traits.openness * 0.5 + (100 - jung.SN) * 0.3 + (100 - jung.JP) * 0.2,
    alcance: facet(inputs, "conscientiousness", "prudência", traits.conscientiousness) * 0.4 +
      jung.TF * 0.3 + (astrologyElements.ar / astroTotal) * 30,
  };
  for (const n of numerologyNumbers) {
    roles[NUMBER_ROLES[n]] += 4;
  }

  // ---- Alignment: dominant role leans toward its Soulmon-mapped alignment;
  // Extraversion/assertiveness reinforces Poder, low Honesty-Humility
  // (status-seeking) reinforces it further, and Openness reinforces Harmonia.
  const alignments: Record<AlignmentId, number> = { poder: 0, harmonia: 0, benevolencia: 0 };
  for (const role of ROLE_ORDER) {
    alignments[ROLE_ALIGNMENT[role]] += roles[role] * 0.5;
  }
  alignments.poder += facet(inputs, "extraversion", "assertividade", traits.extraversion) * 0.3 +
    (100 - traits.honestyHumility) * 0.2;
  alignments.harmonia += traits.openness * 0.3;
  alignments.benevolencia += traits.agreeableness * 0.3;
  for (const n of numerologyNumbers) {
    alignments[NUMBER_ALIGNMENT[n]] += 4;
  }

  // ---- Realms: pure function of the element scores, via Soulmon's own
  // world-geography weight table.
  const realms: Record<RealmId, number> = Object.fromEntries(
    REALM_ORDER.map((realm) => {
      const score = Object.entries(REALM_WEIGHTS[realm]).reduce(
        (sum, [el, weight]) => sum + weight! * elements[el as ElementId],
        0
      );
      return [realm, score];
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

  return {
    elements: toShare(elements, ELEMENT_ORDER),
    roles: toShare(roles, ROLE_ORDER),
    alignments: toShare(alignments, ALIGNMENT_ORDER),
    realms: toShare(realms, REALM_ORDER),
    classElements: toShare(classElements, CLASS_ELEMENT_ORDER),
    dominantElement: argmax(elements, ELEMENT_ORDER),
    dominantRole: argmax(roles, ROLE_ORDER),
    dominantAlignment: argmax(alignments, ALIGNMENT_ORDER),
    dominantRealm: argmax(realms, REALM_ORDER),
  };
}
