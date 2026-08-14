import { CITIES } from "@/lib/onboarding/cities";
import { OnboardingData } from "@/lib/profile";
import { items } from "@/lib/personality/questions";
import { Answers } from "@/lib/personality/types";

const FIRST_NAMES = [
  "Maria", "João", "Ana", "Pedro", "Beatriz", "Lucas", "Camila", "Rafael",
  "Larissa", "Gustavo", "Fernanda", "Bruno", "Juliana", "Diego", "Carla",
  "Thiago", "Patrícia", "Rodrigo", "Aline", "Marcelo",
];
const LAST_NAMES = [
  "Silva", "Santos", "Oliveira", "Souza", "Pereira", "Costa", "Almeida",
  "Nogueira", "Ribeiro", "Carvalho", "Gomes", "Martins", "Rocha", "Barbosa",
  "Prado", "Araújo", "Cardoso", "Teixeira", "Moreira", "Correia",
];

function randomOf<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomDate(startYear: number, endYear: number): string {
  const year = startYear + Math.floor(Math.random() * (endYear - startYear + 1));
  const month = 1 + Math.floor(Math.random() * 12);
  const day = 1 + Math.floor(Math.random() * 28); // 28 avoids month-length edge cases
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function randomTime(): string {
  const hour = Math.floor(Math.random() * 24);
  const minute = Math.floor(Math.random() * 60);
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

/** Fills a plausible onboarding payload — for debugging the pipeline quickly
 *  without typing name/date/city by hand every time. */
export function randomOnboarding(): OnboardingData {
  const city = randomOf(CITIES);
  const fullName = `${randomOf(FIRST_NAMES)} ${randomOf(LAST_NAMES)} ${randomOf(LAST_NAMES)}`;
  return {
    fullName,
    birthDate: randomDate(1970, 2010),
    birthTime: randomTime(),
    timeUnknown: false,
    placeLabel: `${city.name}${city.region ? " - " + city.region : ""}, ${city.country}`,
    latitude: city.latitude,
    longitude: city.longitude,
    timeZone: city.timeZone,
  };
}

/** Fills every item with a uniformly random valid answer. */
export function randomAnswers(): Answers {
  const answers: Answers = {};
  for (const item of items) {
    if (item.kind === "likert" || item.kind === "frequency") {
      answers[item.id] = { kind: "likert", value: (1 + Math.floor(Math.random() * 5)) as 1 | 2 | 3 | 4 | 5 };
    } else if (item.kind === "forced-choice") {
      answers[item.id] = { kind: "forced-choice", choice: Math.random() < 0.5 ? "a" : "b" };
    } else if (item.kind === "scenario") {
      answers[item.id] = { kind: "scenario", optionId: randomOf(item.options).id };
    }
  }
  return answers;
}
