import { Question } from "./types";

/**
 * Item bank grounded in two established traditions:
 *
 * 1. Big Five / Five-Factor Model (Costa & McCrae, 1992; Goldberg's IPIP,
 *    public-domain item pool used as a style reference — items below are
 *    original paraphrases, not copied text). Each trait is probed through
 *    3 coarse facets x 2 items (1 direct, 1 reverse-scored) = 6 items/trait.
 *
 * 2. Jungian cognitive/attitude dichotomies as operationalized by
 *    typology instruments in the MBTI tradition (Myers & Briggs, built on
 *    Jung's "Psychological Types", 1921): Extraversion-Introversion,
 *    Sensing-iNtuition, Thinking-Feeling, Judging-Perceiving.
 *
 * `tags` are a placeholder archetype taxonomy (element/role style hints)
 * meant as the future hook for the Soulmon bestiário/class-system
 * integration. They are illustrative only until that mapping is defined
 * against the real bestiário tag set.
 */
export const questions: Question[] = [
  // ---------- Openness ----------
  { id: "O1", dimension: "openness", facet: "imaginação", text: "Gosto de imaginar mundos ou possibilidades que fogem do óbvio.", positive: true, tags: ["ar", "arcano"] },
  { id: "O2", dimension: "openness", facet: "imaginação", text: "Prefiro rotinas previsíveis a ideias novas e abstratas.", positive: false, tags: ["terra"] },
  { id: "O3", dimension: "openness", facet: "curiosidade", text: "Fico genuinamente curioso sobre assuntos que não têm nada a ver com o meu dia a dia.", positive: true, tags: ["arcano", "explorador"] },
  { id: "O4", dimension: "openness", facet: "curiosidade", text: "Assuntos muito teóricos ou filosóficos me entediam rápido.", positive: false, tags: ["terra"] },
  { id: "O5", dimension: "openness", facet: "estética", text: "Arte, música ou paisagens conseguem me tocar profundamente.", positive: true, tags: ["ar", "encantamento"] },
  { id: "O6", dimension: "openness", facet: "estética", text: "Não vejo muito sentido em gastar tempo apreciando arte ou estética.", positive: false, tags: ["terra"] },

  // ---------- Conscientiousness ----------
  { id: "C1", dimension: "conscientiousness", facet: "organização", text: "Gosto de planejar as coisas com antecedência e me organizar por listas.", positive: true, tags: ["terra", "guardião"] },
  { id: "C2", dimension: "conscientiousness", facet: "organização", text: "Costumo deixar tarefas bagunçadas ou pela metade.", positive: false, tags: ["caos"] },
  { id: "C3", dimension: "conscientiousness", facet: "disciplina", text: "Termino o que começo, mesmo quando fica cansativo.", positive: true, tags: ["terra", "guardião"] },
  { id: "C4", dimension: "conscientiousness", facet: "disciplina", text: "Adio tarefas até o último momento com frequência.", positive: false, tags: ["caos"] },
  { id: "C5", dimension: "conscientiousness", facet: "cuidado", text: "Presto atenção a detalhes que outras pessoas costumam deixar passar.", positive: true, tags: ["terra", "precisão"] },
  { id: "C6", dimension: "conscientiousness", facet: "cuidado", text: "Erros por descuido acontecem comigo com frequência.", positive: false, tags: ["caos"] },

  // ---------- Extraversion ----------
  { id: "E1", dimension: "extraversion", facet: "sociabilidade", text: "Me sinto energizado depois de estar cercado de gente.", positive: true, tags: ["fogo", "vanguarda"] },
  { id: "E2", dimension: "extraversion", facet: "sociabilidade", text: "Prefiro passar a maior parte do tempo sozinho a estar em grupo.", positive: false, tags: ["sombra"] },
  { id: "E3", dimension: "extraversion", facet: "assertividade", text: "Costumo tomar a frente e liderar quando um grupo precisa de direção.", positive: true, tags: ["fogo", "vanguarda"] },
  { id: "E4", dimension: "extraversion", facet: "assertividade", text: "Evito chamar atenção para mim em situações de grupo.", positive: false, tags: ["sombra", "suporte"] },
  { id: "E5", dimension: "extraversion", facet: "entusiasmo", text: "Expresso entusiasmo abertamente quando algo me anima.", positive: true, tags: ["fogo"] },
  { id: "E6", dimension: "extraversion", facet: "entusiasmo", text: "Sou uma pessoa mais reservada e contida na maioria das situações.", positive: false, tags: ["sombra"] },

  // ---------- Agreeableness ----------
  { id: "A1", dimension: "agreeableness", facet: "confiança", text: "Costumo assumir boas intenções nas pessoas até prova em contrário.", positive: true, tags: ["água", "suporte"] },
  { id: "A2", dimension: "agreeableness", facet: "confiança", text: "Desconfio das intenções alheias até ter certeza.", positive: false, tags: ["sombra", "estrategista"] },
  { id: "A3", dimension: "agreeableness", facet: "cooperação", text: "Evito conflitos e busco acordos que agradem todo mundo.", positive: true, tags: ["água", "suporte"] },
  { id: "A4", dimension: "agreeableness", facet: "cooperação", text: "Não hesito em discordar abertamente quando penso diferente.", positive: false, tags: ["fogo", "vanguarda"] },
  { id: "A5", dimension: "agreeableness", facet: "empatia", text: "Me afeto facilmente com o que os outros estão sentindo.", positive: true, tags: ["água", "curandeiro"] },
  { id: "A6", dimension: "agreeableness", facet: "empatia", text: "Prefiro decisões baseadas em lógica, mesmo que magoem alguém.", positive: false, tags: ["ar", "estrategista"] },

  // ---------- Neuroticism ----------
  { id: "N1", dimension: "neuroticism", facet: "ansiedade", text: "Fico ansioso com facilidade diante de situações incertas.", positive: true, tags: ["sombra", "instável"] },
  { id: "N2", dimension: "neuroticism", facet: "ansiedade", text: "Mantenho a calma mesmo sob pressão ou incerteza.", positive: false, tags: ["terra", "guardião"] },
  { id: "N3", dimension: "neuroticism", facet: "instabilidade emocional", text: "Meu humor pode mudar bastante em pouco tempo.", positive: true, tags: ["água", "instável"] },
  { id: "N4", dimension: "neuroticism", facet: "instabilidade emocional", text: "Meu estado de ânimo costuma ser estável ao longo do dia.", positive: false, tags: ["terra"] },
  { id: "N5", dimension: "neuroticism", facet: "vulnerabilidade ao estresse", text: "Situações de pressão me afetam mais do que eu gostaria.", positive: true, tags: ["sombra"] },
  { id: "N6", dimension: "neuroticism", facet: "vulnerabilidade ao estresse", text: "Lido bem com prazos apertados e cobranças.", positive: false, tags: ["terra", "guardião"] },

  // ---------- Jung: Extraversion (E) vs Introversion (I) ----------
  { id: "J-EI-1", dimension: "EI", facet: "fonte de energia", text: "Recarrego minha energia estando com outras pessoas, não sozinho.", positive: true, tags: ["fogo"] },
  { id: "J-EI-2", dimension: "EI", facet: "fonte de energia", text: "Preciso de tempo sozinho para recarregar depois de eventos sociais.", positive: false, tags: ["sombra"] },
  { id: "J-EI-3", dimension: "EI", facet: "processamento", text: "Penso em voz alta, elaborando ideias enquanto falo.", positive: true, tags: ["fogo"] },
  { id: "J-EI-4", dimension: "EI", facet: "processamento", text: "Prefiro refletir internamente antes de compartilhar uma ideia.", positive: false, tags: ["sombra", "arcano"] },
  { id: "J-EI-5", dimension: "EI", facet: "amplitude social", text: "Tenho um círculo social amplo e gosto de conhecer gente nova.", positive: true, tags: ["fogo"] },
  { id: "J-EI-6", dimension: "EI", facet: "amplitude social", text: "Prefiro poucas relações, mas profundas, a muitos conhecidos.", positive: false, tags: ["água", "sombra"] },

  // ---------- Jung: Sensing (S) vs iNtuition (N) ----------
  { id: "J-SN-1", dimension: "SN", facet: "foco perceptivo", text: "Confio mais em fatos concretos e na experiência prática do que em teorias.", positive: true, tags: ["terra"] },
  { id: "J-SN-2", dimension: "SN", facet: "foco perceptivo", text: "Gosto de explorar padrões, possibilidades e o \"quadro geral\" por trás dos fatos.", positive: false, tags: ["arcano", "ar"] },
  { id: "J-SN-3", dimension: "SN", facet: "orientação temporal", text: "Foco no que é concreto e imediato, mais do que em hipóteses futuras.", positive: true, tags: ["terra"] },
  { id: "J-SN-4", dimension: "SN", facet: "orientação temporal", text: "Fico mais empolgado imaginando o que algo pode se tornar do que com o que já é.", positive: false, tags: ["arcano"] },
  { id: "J-SN-5", dimension: "SN", facet: "estilo de aprendizado", text: "Aprendo melhor com passos práticos e exemplos concretos.", positive: true, tags: ["terra", "precisão"] },
  { id: "J-SN-6", dimension: "SN", facet: "estilo de aprendizado", text: "Aprendo melhor entendendo o conceito abstrato por trás das coisas.", positive: false, tags: ["arcano"] },

  // ---------- Jung: Thinking (T) vs Feeling (F) ----------
  { id: "J-TF-1", dimension: "TF", facet: "critério de decisão", text: "Decido com base em lógica e consistência, mesmo que isso desagrade alguém.", positive: true, tags: ["ar", "estrategista"] },
  { id: "J-TF-2", dimension: "TF", facet: "critério de decisão", text: "Decido levando em conta como cada pessoa envolvida vai se sentir.", positive: false, tags: ["água", "curandeiro"] },
  { id: "J-TF-3", dimension: "TF", facet: "estilo de feedback", text: "Prefiro dar feedback direto e objetivo, mesmo que seja duro.", positive: true, tags: ["ar", "vanguarda"] },
  { id: "J-TF-4", dimension: "TF", facet: "estilo de feedback", text: "Cuido bastante do tom para não ferir os sentimentos de quem recebe o feedback.", positive: false, tags: ["água", "suporte"] },
  { id: "J-TF-5", dimension: "TF", facet: "valor central", text: "Justiça e coerência importam mais para mim do que harmonia.", positive: true, tags: ["ar", "estrategista"] },
  { id: "J-TF-6", dimension: "TF", facet: "valor central", text: "Harmonia entre as pessoas importa mais para mim do que estar certo.", positive: false, tags: ["água"] },

  // ---------- Jung: Judging (J) vs Perceiving (P) ----------
  { id: "J-JP-1", dimension: "JP", facet: "estrutura", text: "Gosto de ter as coisas decididas e planejadas com antecedência.", positive: true, tags: ["terra", "guardião"] },
  { id: "J-JP-2", dimension: "JP", facet: "estrutura", text: "Prefiro manter opções em aberto e decidir na hora.", positive: false, tags: ["caos", "explorador"] },
  { id: "J-JP-3", dimension: "JP", facet: "relação com prazos", text: "Termino as coisas bem antes do prazo, sem deixar para depois.", positive: true, tags: ["terra"] },
  { id: "J-JP-4", dimension: "JP", facet: "relação com prazos", text: "Costumo trabalhar melhor sob a pressão de um prazo próximo.", positive: false, tags: ["caos"] },
  { id: "J-JP-5", dimension: "JP", facet: "estilo de vida", text: "Prefiro rotina e previsibilidade a espontaneidade.", positive: true, tags: ["terra"] },
  { id: "J-JP-6", dimension: "JP", facet: "estilo de vida", text: "Gosto de me adaptar e improvisar conforme as coisas acontecem.", positive: false, tags: ["caos", "explorador"] },
];

export const totalQuestions = questions.length;
