"use client";

import { useMemo, useState } from "react";
import { questions } from "@/lib/personality/questions";
import { scoreProfile, isComplete } from "@/lib/personality/scoring";
import { Answers, LikertAnswer, PersonalityProfile } from "@/lib/personality/types";
import Results from "@/components/Results";

const LIKERT_OPTIONS: { value: LikertAnswer; label: string }[] = [
  { value: 1, label: "Discordo totalmente" },
  { value: 2, label: "Discordo" },
  { value: 3, label: "Neutro" },
  { value: 4, label: "Concordo" },
  { value: 5, label: "Concordo totalmente" },
];

export default function Quiz() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [profile, setProfile] = useState<PersonalityProfile | null>(null);

  const question = questions[step];
  const progress = Math.round((step / questions.length) * 100);

  const canGoNext = answers[question?.id] !== undefined;

  const handleAnswer = (value: LikertAnswer) => {
    setAnswers((prev) => ({ ...prev, [question.id]: value }));
  };

  const handleNext = () => {
    if (step < questions.length - 1) {
      setStep(step + 1);
    } else {
      setProfile(scoreProfile(answers));
    }
  };

  const handlePrev = () => {
    if (step > 0) setStep(step - 1);
  };

  const complete = useMemo(() => isComplete(answers), [answers]);

  if (profile) {
    return (
      <Results
        profile={profile}
        onRestart={() => {
          setAnswers({});
          setStep(0);
          setProfile(null);
        }}
      />
    );
  }

  return (
    <div className="mx-auto flex max-w-xl flex-col gap-6 p-6">
      <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-800">
        <div
          className="h-full rounded-full bg-indigo-500 transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="text-sm text-neutral-500">
        {step + 1} de {questions.length}
      </p>

      <h2 className="text-xl font-medium leading-snug">{question.text}</h2>

      <div className="flex flex-col gap-2">
        {LIKERT_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => handleAnswer(opt.value)}
            className={`rounded-lg border px-4 py-3 text-left transition-colors ${
              answers[question.id] === opt.value
                ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-950"
                : "border-neutral-300 hover:border-indigo-400 dark:border-neutral-700"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <div className="flex justify-between pt-2">
        <button
          onClick={handlePrev}
          disabled={step === 0}
          className="rounded-lg px-4 py-2 text-sm text-neutral-500 disabled:opacity-0"
        >
          Voltar
        </button>
        <button
          onClick={handleNext}
          disabled={!canGoNext}
          className="rounded-lg bg-indigo-600 px-6 py-2 text-sm font-medium text-white disabled:opacity-40"
        >
          {step === questions.length - 1 ? (complete ? "Ver resultado" : "Responda para continuar") : "Próxima"}
        </button>
      </div>
    </div>
  );
}
