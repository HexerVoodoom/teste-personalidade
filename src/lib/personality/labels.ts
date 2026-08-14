import { JungAxis, TraitDimension } from "./types";

export const traitLabels: Record<
  TraitDimension,
  { name: string; low: string; high: string; blurb: string }
> = {
  openness: {
    name: "Abertura à experiência",
    low: "concreto, prático",
    high: "curioso, imaginativo",
    blurb: "Amplitude de interesses, apetite por ideias novas e sensibilidade estética.",
  },
  conscientiousness: {
    name: "Conscienciosidade",
    low: "espontâneo, flexível",
    high: "organizado, persistente",
    blurb: "Organização, disciplina e cuidado com consequências.",
  },
  extraversion: {
    name: "Extroversão",
    low: "reservado, contido",
    high: "sociável, assertivo",
    blurb: "Energia direcionada ao mundo social e busca de estímulo.",
  },
  agreeableness: {
    name: "Amabilidade",
    low: "direto, competitivo",
    high: "cooperativo, empático",
    blurb: "Empatia, cooperação e disposição a confiar.",
  },
  neuroticism: {
    name: "Neuroticismo",
    low: "estável sob pressão",
    high: "reativo, sensível",
    blurb: "Frequência e intensidade de emoções negativas sob estresse.",
  },
  honestyHumility: {
    name: "Honestidade-Humildade",
    low: "estratégico, ambicioso",
    high: "íntegro, modesto",
    blurb: "Sinceridade, modéstia e desapego a status — o sexto fator do HEXACO.",
  },
};

export const jungAxisLabels: Record<JungAxis, { name: string; poles: [string, string] }> = {
  EI: { name: "Energia", poles: ["Extroversão (E)", "Introversão (I)"] },
  SN: { name: "Percepção", poles: ["Sensação (S)", "Intuição (N)"] },
  TF: { name: "Julgamento", poles: ["Pensamento (T)", "Sentimento (F)"] },
  JP: { name: "Estilo de vida", poles: ["Julgamento (J)", "Percepção (P)"] },
};

export const numberMeanings: Record<number, string> = {
  1: "iniciativa, liderança, independência",
  2: "cooperação, sensibilidade, diplomacia",
  3: "expressão, criatividade, comunicação",
  4: "estrutura, método, construção sólida",
  5: "liberdade, mudança, versatilidade",
  6: "cuidado, responsabilidade, harmonia",
  7: "análise, introspecção, busca de sentido",
  8: "poder, realização material, autoridade",
  9: "compaixão, encerramento de ciclos, serviço",
  11: "intuição elevada, inspiração, sensibilidade extrema",
  22: "construtor mestre, visão concretizada em larga escala",
  33: "cura, entrega ao coletivo, mestre do amor",
};
