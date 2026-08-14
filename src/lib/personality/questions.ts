import { ForcedChoiceItem, Item, LikertItem, ScenarioItem } from "./types";

/**
 * Item bank.
 *
 * Design decisions, and why:
 *
 * - **Six factors, not five.** Big Five (Costa & McCrae, 1992; Goldberg, 1993)
 *   plus Honesty-Humility from HEXACO (Ashton & Lee, 2007). The sixth factor
 *   replicates across lexical studies in many languages and separates
 *   "agreeable" from "principled" — a distinction worth having when the output
 *   feeds an alignment-like creature system.
 *
 * - **Facets, not just factors.** Each factor is probed through 3 narrow
 *   facets rather than 6 interchangeable items. Facet-level scores carry
 *   variance that the factor average throws away, and two people with the same
 *   Conscientiousness score can differ sharply on orderliness vs. persistence.
 *
 * - **Balanced keying.** Every facet has one direct and one reverse-keyed
 *   item. This is the standard control for acquiescence (yea-saying) bias:
 *   someone who agrees with everything scores near the midpoint instead of
 *   maxing every trait.
 *
 * - **Mixed formats.** Likert agreement, frequency ratings, ipsative
 *   forced-choice pairs, and situational scenarios. Format variety reduces
 *   monotony-driven careless responding, and forced-choice items resist
 *   social-desirability distortion because both options are equally
 *   presentable.
 *
 * - **Consistency pairs.** Selected items are tagged with `consistencyPair`.
 *   After reverse-scoring, paired items should agree; systematic disagreement
 *   flags careless or random responding rather than a personality result.
 *
 * Items are original Portuguese paraphrases written against the construct
 * definitions above. The IPIP (Goldberg et al., 2006) public item pool was
 * used as a style reference only — no item text is copied from it.
 *
 * Items no longer carry archetype tags. The oracle (`src/lib/oracle`) derives
 * element/role/alignment scores directly from the final trait, Jungian,
 * astrological and numerological readings instead of from per-item tags —
 * one documented formula per axis, rather than 60+ hand-picked associations.
 */

const likert: LikertItem[] = [
  // ======================= ABERTURA À EXPERIÊNCIA =======================
  // Facet: imaginação
  { id: "O-ima-1", kind: "likert", dimension: "openness", facet: "imaginação", positive: true,
    text: "Passo bastante tempo imaginando cenários e possibilidades que ainda não existem.", consistencyPair: "O-ima" },
  { id: "O-ima-2", kind: "likert", dimension: "openness", facet: "imaginação", positive: false,
    text: "Prefiro lidar com o que é concreto a ficar divagando sobre hipóteses.", consistencyPair: "O-ima" },
  // Facet: interesses intelectuais
  { id: "O-int-1", kind: "frequency", dimension: "openness", facet: "interesses intelectuais", positive: true,
    text: "Com que frequência você se pega pesquisando um assunto só porque ficou curioso?" },
  { id: "O-int-2", kind: "likert", dimension: "openness", facet: "interesses intelectuais", positive: false,
    text: "Discussões abstratas ou filosóficas me cansam rápido." },
  // Facet: sensibilidade estética
  { id: "O-est-1", kind: "likert", dimension: "openness", facet: "sensibilidade estética", positive: true,
    text: "Música, arte ou paisagens já me emocionaram de verdade." },
  { id: "O-est-2", kind: "likert", dimension: "openness", facet: "sensibilidade estética", positive: false,
    text: "Não faz muito sentido pra mim gastar tempo apreciando arte." },

  // ========================= CONSCIENCIOSIDADE =========================
  // Facet: organização
  { id: "C-org-1", kind: "likert", dimension: "conscientiousness", facet: "organização", positive: true,
    text: "Gosto que minhas coisas e meus compromissos estejam em ordem.", consistencyPair: "C-org" },
  { id: "C-org-2", kind: "frequency", dimension: "conscientiousness", facet: "organização", positive: false,
    text: "Com que frequência você perde algo por não lembrar onde guardou?", consistencyPair: "C-org" },
  // Facet: persistência
  { id: "C-per-1", kind: "likert", dimension: "conscientiousness", facet: "persistência", positive: true,
    text: "Termino o que começo, mesmo depois que deixa de ser interessante." },
  { id: "C-per-2", kind: "frequency", dimension: "conscientiousness", facet: "persistência", positive: false,
    text: "Com que frequência você adia uma tarefa até o prazo estar em cima?" },
  // Facet: prudência
  { id: "C-pru-1", kind: "likert", dimension: "conscientiousness", facet: "prudência", positive: true,
    text: "Penso nas consequências antes de decidir, mesmo quando estou empolgado." },
  { id: "C-pru-2", kind: "likert", dimension: "conscientiousness", facet: "prudência", positive: false,
    text: "Costumo agir por impulso e resolver os problemas depois." },

  // ============================ EXTROVERSÃO ============================
  // Facet: sociabilidade
  { id: "E-soc-1", kind: "likert", dimension: "extraversion", facet: "sociabilidade", positive: true,
    text: "Estar com bastante gente me deixa mais animado, não mais cansado.", consistencyPair: "E-soc" },
  { id: "E-soc-2", kind: "likert", dimension: "extraversion", facet: "sociabilidade", positive: false,
    text: "Depois de muito convívio social, preciso de um tempo sozinho para me recuperar.", consistencyPair: "E-soc" },
  // Facet: assertividade
  { id: "E-ass-1", kind: "likert", dimension: "extraversion", facet: "assertividade", positive: true,
    text: "Quando um grupo está sem rumo, eu costumo assumir a direção." },
  { id: "E-ass-2", kind: "likert", dimension: "extraversion", facet: "assertividade", positive: false,
    text: "Evito ser o centro das atenções sempre que dá." },
  // Facet: busca de estímulo
  { id: "E-est-1", kind: "likert", dimension: "extraversion", facet: "busca de estímulo", positive: true,
    text: "Ambientes movimentados e cheios de energia me fazem bem." },
  { id: "E-est-2", kind: "likert", dimension: "extraversion", facet: "busca de estímulo", positive: false,
    text: "Prefiro uma noite tranquila em casa a qualquer evento agitado." },

  // ============================ AMABILIDADE ============================
  // Facet: empatia
  { id: "A-emp-1", kind: "likert", dimension: "agreeableness", facet: "empatia", positive: true,
    text: "Percebo rápido quando alguém está mal, mesmo que a pessoa não diga nada." },
  { id: "A-emp-2", kind: "likert", dimension: "agreeableness", facet: "empatia", positive: false,
    text: "Tenho dificuldade em me colocar no lugar de quem sente as coisas muito diferente de mim." },
  // Facet: cooperação
  { id: "A-coo-1", kind: "likert", dimension: "agreeableness", facet: "cooperação", positive: true,
    text: "Prefiro ceder um pouco a transformar uma divergência em briga.", consistencyPair: "A-coo" },
  { id: "A-coo-2", kind: "frequency", dimension: "agreeableness", facet: "cooperação", positive: false,
    text: "Com que frequência você entra em discussões acaloradas para defender seu ponto?", consistencyPair: "A-coo" },
  // Facet: confiança
  { id: "A-con-1", kind: "likert", dimension: "agreeableness", facet: "confiança", positive: true,
    text: "Parto do princípio de que as pessoas têm boas intenções." },
  { id: "A-con-2", kind: "likert", dimension: "agreeableness", facet: "confiança", positive: false,
    text: "Costumo desconfiar dos motivos por trás da gentileza dos outros." },

  // ============================ NEUROTICISMO ===========================
  // Facet: ansiedade
  { id: "N-ans-1", kind: "frequency", dimension: "neuroticism", facet: "ansiedade", positive: true,
    text: "Com que frequência você se preocupa com coisas que talvez nem aconteçam?", consistencyPair: "N-ans" },
  { id: "N-ans-2", kind: "likert", dimension: "neuroticism", facet: "ansiedade", positive: false,
    text: "Encaro situações incertas com bastante tranquilidade.", consistencyPair: "N-ans" },
  // Facet: volatilidade
  { id: "N-vol-1", kind: "likert", dimension: "neuroticism", facet: "volatilidade", positive: true,
    text: "Meu humor pode virar bastante ao longo de um mesmo dia." },
  { id: "N-vol-2", kind: "likert", dimension: "neuroticism", facet: "volatilidade", positive: false,
    text: "Sou uma pessoa emocionalmente estável e previsível." },
  // Facet: vulnerabilidade ao estresse
  { id: "N-est-1", kind: "likert", dimension: "neuroticism", facet: "vulnerabilidade ao estresse", positive: true,
    text: "Sob pressão, tenho dificuldade de pensar com clareza." },
  { id: "N-est-2", kind: "likert", dimension: "neuroticism", facet: "vulnerabilidade ao estresse", positive: false,
    text: "Situações de crise costumam trazer o meu melhor." },

  // ====================== HONESTIDADE-HUMILDADE ========================
  // Facet: sinceridade
  { id: "H-sin-1", kind: "likert", dimension: "honestyHumility", facet: "sinceridade", positive: true,
    text: "Não me sinto confortável em manipular alguém, mesmo que fosse dar certo.", consistencyPair: "H-sin" },
  { id: "H-sin-2", kind: "likert", dimension: "honestyHumility", facet: "sinceridade", positive: false,
    text: "Se bajular alguém for o caminho mais fácil para conseguir o que quero, eu bajulo.", consistencyPair: "H-sin" },
  // Facet: modéstia
  { id: "H-mod-1", kind: "likert", dimension: "honestyHumility", facet: "modéstia", positive: true,
    text: "Não me considero mais especial do que as pessoas ao meu redor." },
  { id: "H-mod-2", kind: "likert", dimension: "honestyHumility", facet: "modéstia", positive: false,
    text: "Acho que mereço mais reconhecimento do que a maioria das pessoas recebe." },
  // Facet: desapego material
  { id: "H-des-1", kind: "likert", dimension: "honestyHumility", facet: "desapego material", positive: true,
    text: "Ter status e coisas caras não me motiva muito." },
  { id: "H-des-2", kind: "likert", dimension: "honestyHumility", facet: "desapego material", positive: false,
    text: "Gostaria de ter uma vida de luxo e ser reconhecido por isso." },
];

/**
 * Forced-choice items for the Jungian axes.
 *
 * Both options are written to be equally socially acceptable, so the choice
 * reflects preference rather than which answer looks better. Option A always
 * scores toward the first pole (E, S, T, J).
 */
const forcedChoice: ForcedChoiceItem[] = [
  // ---- Extroversão (E) x Introversão (I): source of energy ----
  { id: "J-EI-1", kind: "forced-choice", dimension: "EI", facet: "fonte de energia",
    prompt: "Depois de uma semana pesada, o que te recompõe mais?",
    a: { text: "Sair e estar com gente de quem eu gosto" },
    b: { text: "Um tempo sozinho, no meu ritmo" } },
  { id: "J-EI-2", kind: "forced-choice", dimension: "EI", facet: "processamento",
    prompt: "Quando você precisa resolver algo complicado:",
    a: { text: "Falo sobre o assunto com alguém e vou pensando enquanto falo" },
    b: { text: "Fico remoendo por dentro até chegar a uma conclusão" } },
  { id: "J-EI-3", kind: "forced-choice", dimension: "EI", facet: "amplitude social",
    prompt: "O que descreve melhor o seu círculo?",
    a: { text: "Muita gente, contatos variados, sempre conhecendo alguém novo" },
    b: { text: "Poucas pessoas, mas laços profundos e duradouros" } },

  // ---- Sensação (S) x Intuição (N): mode of perception ----
  { id: "J-SN-1", kind: "forced-choice", dimension: "SN", facet: "foco perceptivo",
    prompt: "Ao avaliar uma proposta, você confia mais em:",
    a: { text: "Dados concretos e no que já foi testado na prática" },
    b: { text: "No padrão que você percebe e no potencial que aquilo tem" } },
  { id: "J-SN-2", kind: "forced-choice", dimension: "SN", facet: "orientação temporal",
    prompt: "Sua atenção fica mais em:",
    a: { text: "O que existe agora e o que precisa ser feito hoje" },
    b: { text: "O que isso pode virar daqui a alguns anos" } },
  { id: "J-SN-3", kind: "forced-choice", dimension: "SN", facet: "estilo de aprendizado",
    prompt: "Você aprende melhor quando:",
    a: { text: "Alguém te mostra o passo a passo e você repete" },
    b: { text: "Você entende o conceito por trás e deduz o resto" } },

  // ---- Pensamento (T) x Sentimento (F): mode of judgement ----
  { id: "J-TF-1", kind: "forced-choice", dimension: "TF", facet: "critério de decisão",
    prompt: "Numa decisão difícil que afeta outras pessoas, o que pesa mais?",
    a: { text: "Qual opção é mais justa e coerente, olhando de fora" },
    b: { text: "Como cada pessoa envolvida vai ser afetada" } },
  { id: "J-TF-2", kind: "forced-choice", dimension: "TF", facet: "estilo de feedback",
    prompt: "Ao dar um retorno difícil, você tende a:",
    a: { text: "Ser direto — a pessoa precisa saber o problema com clareza" },
    b: { text: "Cuidar do tom — a forma importa tanto quanto o conteúdo" } },
  { id: "J-TF-3", kind: "forced-choice", dimension: "TF", facet: "valor central",
    prompt: "Se tivesse que escolher um para preservar:",
    a: { text: "A verdade, mesmo que ela desestabilize o grupo" },
    b: { text: "A harmonia, mesmo que algo fique não dito" } },

  // ---- Julgamento (J) x Percepção (P): orientation to the outer world ----
  { id: "J-JP-1", kind: "forced-choice", dimension: "JP", facet: "estrutura",
    prompt: "Uma viagem ideal para você é:",
    a: { text: "Planejada, com roteiro e reservas feitas" },
    b: { text: "Em aberto, decidindo os próximos passos no caminho" } },
  { id: "J-JP-2", kind: "forced-choice", dimension: "JP", facet: "relação com prazos",
    prompt: "Sua relação com prazos:",
    a: { text: "Entrego antes; deixar para depois me deixa desconfortável" },
    b: { text: "Rendo mais com o prazo em cima" } },
  { id: "J-JP-3", kind: "forced-choice", dimension: "JP", facet: "tomada de decisão",
    prompt: "Diante de várias opções, você prefere:",
    a: { text: "Decidir logo e seguir em frente" },
    b: { text: "Manter as portas abertas o máximo possível" } },
];

/**
 * Situational items. Each scenario loads on more than one dimension at once,
 * which is where they earn their keep: they capture how traits interact under
 * a concrete demand instead of asking about each trait in isolation.
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
    id: "S-3", kind: "scenario",
    situation: "Você percebe que um erro seu passou despercebido e ninguém vai descobrir. Consertar agora significa admitir a falha publicamente.",
    covers: ["honestyHumility", "conscientiousness", "neuroticism"],
    options: [
      { id: "a", text: "Assumo na hora, mesmo com o custo de imagem.",
        weights: { honestyHumility: 4, conscientiousness: 4, neuroticism: 1 } },
      { id: "b", text: "Corrijo discretamente e não menciono para ninguém.",
        weights: { honestyHumility: 2, conscientiousness: 3, neuroticism: 2 } },
      { id: "c", text: "Deixo como está: o estrago seria maior do que o erro.",
        weights: { honestyHumility: 0, conscientiousness: 1, neuroticism: 2 } },
      { id: "d", text: "Fico remoendo a culpa por semanas sem decidir o que fazer.",
        weights: { honestyHumility: 3, conscientiousness: 1, neuroticism: 4 } },
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
    id: "S-5", kind: "scenario",
    situation: "Você tem uma tarde inteira livre, sem nenhuma obrigação.",
    covers: ["openness", "extraversion", "conscientiousness"],
    options: [
      { id: "a", text: "Começo um projeto criativo que estava engavetado.",
        weights: { openness: 4, extraversion: 2, conscientiousness: 3 } },
      { id: "b", text: "Chamo gente para fazer algo junto.",
        weights: { openness: 2, extraversion: 4, conscientiousness: 1 } },
      { id: "c", text: "Adianto pendências e organizo o que estava atrasado.",
        weights: { openness: 1, extraversion: 1, conscientiousness: 4 } },
      { id: "d", text: "Descanso sem plano nenhum e vejo no que dá.",
        weights: { openness: 2, extraversion: 1, conscientiousness: 0 } },
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
 * face a long uninterrupted run of the same question type — the condition that
 * most reliably produces straight-lining in long inventories.
 */
function interleave(): Item[] {
  const out: Item[] = [];
  const l = [...likert];
  const f = [...forcedChoice];
  const s = [...scenarios];
  // Roughly: 3 Likert, 1 forced-choice, then a scenario every other cycle.
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
