import { BigFiveTrait, JungAxis } from "./types";

export const bigFiveLabels: Record<BigFiveTrait, { name: string; low: string; high: string }> = {
  openness: { name: "Abertura à experiência", low: "convencional", high: "curioso(a) e imaginativo(a)" },
  conscientiousness: { name: "Conscienciosidade", low: "espontâneo(a)", high: "organizado(a) e disciplinado(a)" },
  extraversion: { name: "Extroversão", low: "reservado(a)", high: "sociável e enérgico(a)" },
  agreeableness: { name: "Amabilidade", low: "competitivo(a)", high: "cooperativo(a) e empático(a)" },
  neuroticism: { name: "Neuroticismo", low: "emocionalmente estável", high: "sensível a estresse" },
};

export const jungAxisLabels: Record<JungAxis, { name: string; poles: [string, string] }> = {
  EI: { name: "Extroversão x Introversão", poles: ["Extroversão (E)", "Introversão (I)"] },
  SN: { name: "Sensação x Intuição", poles: ["Sensação (S)", "Intuição (N)"] },
  TF: { name: "Pensamento x Sentimento", poles: ["Pensamento (T)", "Sentimento (F)"] },
  JP: { name: "Julgamento x Percepção", poles: ["Julgamento (J)", "Percepção (P)"] },
};
