import { ForcedChoiceItem, Item, LikertItem, ScenarioItem } from "./types";

/**
 * Item bank — 20 items total, cut down from an earlier 54-item version that
 * measured 3 facets per trait. This short form trades facet-level breakdown
 * for length: every trait keeps exactly one keying-balanced item pair (one
 * direct, one reverse-keyed — the standard acquiescence control), instead of
 * three. What survives the cut, and why:
 *
 * - **Six factors, not five.** Big Five (Costa & McCrae, 1992; Goldberg, 1993)
 *   plus Honesty-Humility from HEXACO (Ashton & Lee, 2007). The sixth factor
 *   replicates across lexical studies in many languages and separates
 *   "agreeable" from "principled" — a distinction worth having when the output
 *   feeds an alignment-like creature system.
 *
 * - **Balanced keying, kept even at this length.** Every trait's 2 Likert
 *   items are one direct + one reverse-keyed, and marked as a consistency
 *   pair. This is what makes the acquiescence and inconsistency validity
 *   indices possible at all — cutting it would have meant cutting those
 *   checks too.
 *
 * - **Mixed formats, kept.** Likert agreement, forced-choice (ipsative) for
 *   the four Jungian axes, and 4 situational scenarios chosen so their union
 *   still covers all 6 factors — so the factor scores aren't resting on the
 *   12 Likert items alone.
 *
 * Items are original Portuguese paraphrases written against the construct
 * definitions cited above. The IPIP (Goldberg et al., 2006) public item pool
 * was used as a style reference only — no item text is copied from it.
 */

const likert: LikertItem[] = [
  // Openness
  { id: "O-ima-1", kind: "likert", dimension: "openness", facet: "imaginação", positive: true,
    text: "Passo bastante tempo imaginando cenários e possibilidades que ainda não existem.", consistencyPair: "O-ima" },
  { id: "O-ima-2", kind: "likert", dimension: "openness", facet: "imaginação", positive: false,
    text: "Prefiro lidar com o que é concreto a ficar divagando sobre hipóteses.", consistencyPair: "O-ima" },

  // Conscientiousness
  { id: "C-org-1", kind: "likert", dimension: "conscientiousness", facet: "organização", positive: true,
    text: "Gosto que minhas coisas e meus compromissos estejam em ordem.", consistencyPair: "C-org" },
  { id: "C-org-2", kind: "frequency", dimension: "conscientiousness", facet: "organização", positive: false,
    text: "Com que frequência você perde algo por não lembrar onde guardou?", consistencyPair: "C-org" },

  // Extraversion
  { id: "E-soc-1", kind: "likert", dimension: "extraversion", facet: "sociabilidade", positive: true,
    text: "Estar com bastante gente me deixa mais animado, não mais cansado.", consistencyPair: "E-soc" },
  { id: "E-soc-2", kind: "likert", dimension: "extraversion", facet: "sociabilidade", positive: false,
    text: "Depois de muito convívio social, preciso de um tempo sozinho para me recuperar.", consistencyPair: "E-soc" },

  // Agreeableness
  { id: "A-coo-1", kind: "likert", dimension: "agreeableness", facet: "cooperação", positive: true,
    text: "Prefiro ceder um pouco a transformar uma divergência em briga.", consistencyPair: "A-coo" },
  { id: "A-coo-2", kind: "frequency", dimension: "agreeableness", facet: "cooperação", positive: false,
    text: "Com que frequência você entra em discussões acaloradas para defender seu ponto?", consistencyPair: "A-coo" },

  // Neuroticism
  { id: "N-ans-1", kind: "frequency", dimension: "neuroticism", facet: "ansiedade", positive: true,
    text: "Com que frequência você se preocupa com coisas que talvez nem aconteçam?", consistencyPair: "N-ans" },
  { id: "N-ans-2", kind: "likert", dimension: "neuroticism", facet: "ansiedade", positive: false,
    text: "Encaro situações incertas com bastante tranquilidade.", consistencyPair: "N-ans" },

  // Honesty-Humility
  { id: "H-sin-1", kind: "likert", dimension: "honestyHumility", facet: "sinceridade", positive: true,
    text: "Não me sinto confortável em manipular alguém, mesmo que fosse dar certo.", consistencyPair: "H-sin" },
  { id: "H-sin-2", kind: "likert", dimension: "honestyHumility", facet: "sinceridade", positive: false,
    text: "Se bajular alguém for o caminho mais fácil para conseguir o que quero, eu bajulo.", consistencyPair: "H-sin" },
];

/**
 * One forced-choice item per Jungian axis. Both options are written to be
 * equally socially acceptable, so the choice reflects preference rather than
 * which answer looks better. Option A always scores toward the first pole
 * (E, S, T, J).
 */
const forcedChoice: ForcedChoiceItem[] = [
  { id: "J-EI-1", kind: "forced-choice", dimension: "EI", facet: "fonte de energia",
    prompt: "Depois de uma semana pesada, o que te recompõe mais?",
    a: { text: "Sair e estar com gente de quem eu gosto" },
    b: { text: "Um tempo sozinho, no meu ritmo" } },

  { id: "J-SN-1", kind: "forced-choice", dimension: "SN", facet: "foco perceptivo",
    prompt: "Ao avaliar uma proposta, você confia mais em:",
    a: { text: "Dados concretos e no que já foi testado na prática" },
    b: { text: "No padrão que você percebe e no potencial que aquilo tem" } },

  { id: "J-TF-1", kind: "forced-choice", dimension: "TF", facet: "critério de decisão",
    prompt: "Numa decisão difícil que afeta outras pessoas, o que pesa mais?",
    a: { text: "Qual opção é mais justa e coerente, olhando de fora" },
    b: { text: "Como cada pessoa envolvida vai ser afetada" } },

  { id: "J-JP-1", kind: "forced-choice", dimension: "JP", facet: "estrutura",
    prompt: "Uma viagem ideal para você é:",
    a: { text: "Planejada, com roteiro e reservas feitas" },
    b: { text: "Em aberto, decidindo os próximos passos no caminho" } },
];

/**
 * 4 situational items, chosen so their union of `covers` still spans all 6
 * trait dimensions — the factor scores don't rest on the Likert items alone.
 */
const scenarios: ScenarioItem[] = [
  {
    id: "S-1", kind: "scenario",
    situation: "Seu grupo tem um trabalho importante para entregar e o combinado está desmoronando: ninguém fez a parte que prometeu e falta pouco tempo.",
    covers: ["conscientiousness", "extraversion", "agreeableness", "neuroticism"],
    options: [
      { id: "a", text: "Assumo o comando, redistribuo as tarefas e cobro cada um.",
        weights: { conscientiousness: 4, extraversion: 4, agreeableness: 1, neuroticism: 1 } },
      { id: "b", text: "Faço eu mesmo a parte que falta, sem criar atrito.",
        weights: { conscientiousness: 4, extraversion: 1, agreeableness: 3, neuroticism: 2 } },
      { id: "c", text: "Chamo o grupo para conversar e entender o que travou cada um.",
        weights: { conscientiousness: 2, extraversion: 3, agreeableness: 4, neuroticism: 1 } },
      { id: "d", text: "Fico ansioso, mas espero que alguém tome a frente.",
        weights: { conscientiousness: 0, extraversion: 0, agreeableness: 2, neuroticism: 4 } },
    ],
  },
  {
    id: "S-2", kind: "scenario",
    situation: "Você recebe uma oferta para mudar de cidade por uma oportunidade promissora, mas incerta.",
    covers: ["openness", "conscientiousness", "neuroticism"],
    options: [
      { id: "a", text: "Aceito rápido — a novidade em si já vale o risco.",
        weights: { openness: 4, conscientiousness: 1, neuroticism: 1 } },
      { id: "b", text: "Monto uma planilha, avalio cenários e decido com calma.",
        weights: { openness: 3, conscientiousness: 4, neuroticism: 1 } },
      { id: "c", text: "Recuso: o que eu já construí aqui vale mais que a aposta.",
        weights: { openness: 1, conscientiousness: 3, neuroticism: 2 } },
      { id: "d", text: "Fico dias sem dormir pensando nisso e adio a resposta.",
        weights: { openness: 2, conscientiousness: 0, neuroticism: 4 } },
    ],
  },
  {
    id: "S-4", kind: "scenario",
    situation: "Um amigo próximo te conta uma decisão que você acha claramente equivocada.",
    covers: ["agreeableness", "extraversion", "honestyHumility"],
    options: [
      { id: "a", text: "Falo com franqueza o que penso, mesmo que ele não queira ouvir.",
        weights: { agreeableness: 1, extraversion: 3, honestyHumility: 4 } },
      { id: "b", text: "Faço perguntas até ele mesmo enxergar os furos.",
        weights: { agreeableness: 3, extraversion: 2, honestyHumility: 3 } },
      { id: "c", text: "Apoio a decisão dele — não é minha vida.",
        weights: { agreeableness: 4, extraversion: 1, honestyHumility: 2 } },
      { id: "d", text: "Concordo na frente dele e comento com outra pessoa depois.",
        weights: { agreeableness: 2, extraversion: 2, honestyHumility: 0 } },
    ],
  },
  {
    id: "S-6", kind: "scenario",
    situation: "Você é criticado publicamente por algo em que se esforçou bastante.",
    covers: ["neuroticism", "agreeableness", "honestyHumility", "extraversion"],
    options: [
      { id: "a", text: "Rebato na hora e defendo meu trabalho.",
        weights: { neuroticism: 2, agreeableness: 0, honestyHumility: 2, extraversion: 4 } },
      { id: "b", text: "Escuto, considero se há razão e respondo depois com calma.",
        weights: { neuroticism: 1, agreeableness: 3, honestyHumility: 4, extraversion: 2 } },
      { id: "c", text: "Fico abalado e reviso tudo o que fiz procurando o erro.",
        weights: { neuroticism: 4, agreeableness: 3, honestyHumility: 3, extraversion: 1 } },
      { id: "d", text: "Não deixo transparecer nada e sigo como se não fosse comigo.",
        weights: { neuroticism: 2, agreeableness: 2, honestyHumility: 1, extraversion: 0 } },
    ],
  },
];

/**
 * Presentation order interleaves the three formats so that respondents never
 * face a long uninterrupted run of the same question type.
 */
function interleave(): Item[] {
  const out: Item[] = [];
  const l = [...likert];
  const f = [...forcedChoice];
  const s = [...scenarios];
  let cycle = 0;
  while (l.length || f.length || s.length) {
    for (let i = 0; i < 3 && l.length; i++) out.push(l.shift()!);
    if (f.length) out.push(f.shift()!);
    if (cycle % 2 === 1 && s.length) out.push(s.shift()!);
    cycle++;
  }
  return out;
}

export const items: Item[] = interleave();
export const totalItems = items.length;

export const likertItems = likert;
export const forcedChoiceItems = forcedChoice;
export const scenarioItems = scenarios;
