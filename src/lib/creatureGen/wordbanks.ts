import { AlignmentId, ElementId, RoleId } from "../oracle/types";

/**
 * Word banks copied verbatim from `soulmon/src/utils/oracle.ts`
 * (`NOUNS_BY_ELEMENT`, `ADJECTIVES_BY_ROLE`, `ADJECTIVES_BY_ELEMENT`,
 * `ELEMENT_PALETTES`, `ALIGNMENT_ACCENT`, `ROOKIE_LOOK`) — this generator is
 * meant to replace that file eventually, so it reuses its actual vocabulary
 * rather than inventing a new one that would drift from it.
 */

export interface LText { pt: string; en: string }

export const NOUNS_BY_ELEMENT: Record<ElementId, LText[]> = {
  agua: [
    { pt: "Sereia", en: "mermaid" }, { pt: "Leviatã", en: "leviathan" }, { pt: "Maré", en: "tide" },
    { pt: "Água-viva", en: "jellyfish" }, { pt: "Nascente", en: "spring well" }, { pt: "Kraken", en: "kraken" },
  ],
  fogo: [
    { pt: "Fênix", en: "phoenix" }, { pt: "Salamandra", en: "salamander" }, { pt: "Vulcão", en: "volcano" },
    { pt: "Braseiro", en: "brazier" }, { pt: "Cometa", en: "comet" }, { pt: "Dragão", en: "dragon" },
  ],
  terra: [
    { pt: "Golem", en: "golem" }, { pt: "Montanha", en: "mountain" }, { pt: "Cristal", en: "crystal" },
    { pt: "Urso", en: "bear" }, { pt: "Fortaleza", en: "fortress" }, { pt: "Menir", en: "menhir" },
  ],
  ar: [
    { pt: "Grifo", en: "griffin" }, { pt: "Ventania", en: "gale" }, { pt: "Pipa", en: "kite" },
    { pt: "Falcão", en: "falcon" }, { pt: "Nuvem", en: "cloud" }, { pt: "Zéfiro", en: "zephyr" },
  ],
  sombra: [
    { pt: "Eclipse", en: "eclipse" }, { pt: "Corvo", en: "raven" }, { pt: "Lanterna", en: "lantern" },
    { pt: "Esfinge", en: "sphinx" }, { pt: "Névoa", en: "mist" }, { pt: "Pantera", en: "panther" },
  ],
  luz: [
    { pt: "Farol", en: "lighthouse" }, { pt: "Unicórnio", en: "unicorn" }, { pt: "Aurora", en: "aurora" },
    { pt: "Estrela", en: "star" }, { pt: "Prisma", en: "prism" }, { pt: "Vaga-lume", en: "firefly" },
  ],
  planta: [
    { pt: "Mandrágora", en: "mandrake" }, { pt: "Carvalho", en: "oak tree" }, { pt: "Vitória-régia", en: "giant water lily" },
    { pt: "Cacto", en: "cactus" }, { pt: "Cogumelo", en: "mushroom" }, { pt: "Bambu", en: "bamboo" },
  ],
  industrial: [
    { pt: "Autômato", en: "automaton" }, { pt: "Engrenagem", en: "gear" }, { pt: "Dínamo", en: "dynamo" },
    { pt: "Relógio", en: "clockwork" }, { pt: "Locomotiva", en: "locomotive" }, { pt: "Satélite", en: "satellite" },
  ],
};

export const ADJECTIVES_BY_ROLE: Record<RoleId, LText[]> = {
  suporte: [
    { pt: "acolhedor(a)", en: "nurturing" }, { pt: "gentil", en: "gentle" }, { pt: "devotado(a)", en: "devoted" },
    { pt: "curador(a)", en: "healing" }, { pt: "leal", en: "loyal" },
  ],
  tanque: [
    { pt: "inabalável", en: "unshakable" }, { pt: "protetor(a)", en: "protective" }, { pt: "colossal", en: "colossal" },
    { pt: "firme", en: "steadfast" }, { pt: "blindado(a)", en: "armored" },
  ],
  fisico: [
    { pt: "feroz", en: "fierce" }, { pt: "indomável", en: "untamable" }, { pt: "veloz", en: "swift" },
    { pt: "implacável", en: "relentless" }, { pt: "valente", en: "valiant" },
  ],
  magico: [
    { pt: "arcano(a)", en: "arcane" }, { pt: "enigmático(a)", en: "enigmatic" }, { pt: "hipnótico(a)", en: "hypnotic" },
    { pt: "visionário(a)", en: "visionary" }, { pt: "etéreo(a)", en: "ethereal" },
  ],
  alcance: [
    { pt: "certeiro(a)", en: "sharp-eyed" }, { pt: "paciente", en: "patient" }, { pt: "vigilante", en: "watchful" },
    { pt: "astuto(a)", en: "cunning" }, { pt: "preciso(a)", en: "precise" },
  ],
};

export const ADJECTIVES_BY_ELEMENT: Record<ElementId, LText[]> = {
  agua: [{ pt: "profundo(a)", en: "deep" }, { pt: "sereno(a)", en: "serene" }, { pt: "fluido(a)", en: "flowing" }],
  fogo: [{ pt: "ardente", en: "blazing" }, { pt: "incandescente", en: "incandescent" }, { pt: "fervoroso(a)", en: "fervent" }],
  terra: [{ pt: "ancestral", en: "ancient" }, { pt: "sólido(a)", en: "solid" }, { pt: "fértil", en: "fertile" }],
  ar: [{ pt: "ligeiro(a)", en: "nimble" }, { pt: "etéreo(a)", en: "airy" }, { pt: "imprevisível", en: "unpredictable" }],
  sombra: [{ pt: "noturno(a)", en: "nocturnal" }, { pt: "oculto(a)", en: "hidden" }, { pt: "insondável", en: "unfathomable" }],
  luz: [{ pt: "radiante", en: "radiant" }, { pt: "cintilante", en: "shimmering" }, { pt: "benevolente", en: "benevolent" }],
  planta: [{ pt: "florescente", en: "blooming" }, { pt: "perene", en: "evergreen" }, { pt: "silvestre", en: "wild-grown" }],
  industrial: [{ pt: "cromado(a)", en: "chrome-plated" }, { pt: "incansável", en: "tireless" }, { pt: "engenhoso(a)", en: "ingenious" }],
};

export const ELEMENT_PALETTES: Record<ElementId, string[]> = {
  agua: [
    "cool blue and teal color palette", "deep navy and seafoam color palette", "turquoise and pearl-white color palette",
  ],
  fogo: [
    "warm red, orange and ember-yellow color palette", "crimson and charcoal-smoke color palette", "sunset orange and molten-gold color palette",
  ],
  terra: [
    "earthy brown and ochre color palette", "clay-red and sandstone color palette", "moss-brown and slate color palette",
  ],
  ar: [
    "sky blue, white and pale silver color palette", "cloud-white and periwinkle color palette", "pale gray-blue and silver-lining color palette",
  ],
  sombra: [
    "deep purple and charcoal color palette", "midnight blue and smoky black color palette", "dark violet and ash-gray color palette",
  ],
  luz: [
    "golden yellow, white and warm cream color palette", "dawn-pink and radiant white color palette", "amber and ivory color palette",
  ],
  planta: [
    "leafy green and lime color palette", "deep fern and blossom-pink color palette", "sage green and sunflower color palette",
  ],
  industrial: [
    "steel gray and gunmetal color palette", "brass and copper machinery color palette", "chrome and hazard-yellow color palette",
  ],
};

export const ALIGNMENT_ACCENT: Record<AlignmentId, string> = {
  poder: "red",
  harmonia: "cyan",
  benevolencia: "gold",
};

export const ROOKIE_LOOK: string[] = [
  "a tiny round chibi body", "small and simple with a big head", "a little blob-like body",
  "a small egg-shaped body", "a chubby palm-sized body", "a tiny two-legged sprout",
  "a small curled-up shape", "a baby-sized round form", "a squishy little body",
  "a pint-sized simple shape", "a tiny bouncy body", "a small button-eyed form",
];
