"use client";

import { useState } from "react";
import { items } from "@/lib/personality/questions";
import { Answers, LikertValue } from "@/lib/personality/types";

const AGREEMENT: { value: LikertValue; label: string }[] = [
  { value: 1, label: "Discordo totalmente" },
  { value: 2, label: "Discordo" },
  { value: 3, label: "Neutro" },
  { value: 4, label: "Concordo" },
  { value: 5, label: "Concordo totalmente" },
];

const FREQUENCY: { value: LikertValue; label: string }[] = [
  { value: 1, label: "Nunca" },
  { value: 2, label: "Raramente" },
  { value: 3, label: "Às vezes" },
  { value: 4, label: "Frequentemente" },
  { value: 5, label: "Quase sempre" },
];

const FORMAT_LABEL: Record<string, string> = {
  likert: "O quanto isso combina com você",
  frequency: "Com que frequência",
  "forced-choice": "Escolha o que combina mais",
  scenario: "Situação",
};

interface Props {
  answers: Answers;
  onChange: (answers: Answers) => void;
  onFinish: () => void;
  onBack: () => void;
}

export default function Quiz({ answers, onChange, onFinish, onBack }: Props) {
  const [step, setStep] = useState(0);
  const item = items[step];
  const answered = answers[item.id] !== undefined;
  const isLast = step === items.length - 1;
  const progress = Math.round(((step + (answered ? 1 : 0)) / items.length) * 100);

  const setAnswer = (value: Answers[string]) => {
    onChange({ ...answers, [item.id]: value });
  };

  const optionClass = (selected: boolean) =>
    `rounded-lg border px-4 py-3 text-left text-sm transition-colors ${
      selected
        ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-950"
        : "border-neutral-300 hover:border-indigo-400 dark:border-neutral-700"
    }`;

  return (
    <div className="mx-auto flex max-w-xl flex-col gap-6 p-6">
      <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-800">
        <div className="h-full rounded-full bg-indigo-500 transition-all" style={{ width: `${progress}%` }} />
      </div>
      <div className="flex items-baseline justify-between text-xs text-neutral-500">
        <span>{FORMAT_LABEL[item.kind]}</span>
        <span>
          {step + 1} de {items.length}
        </span>
      </div>

      {(item.kind === "likert" || item.kind === "frequency") && (
        <>
          <h2 className="text-lg font-medium leading-snug">{item.text}</h2>
          <div className="flex flex-col gap-2">
            {(item.kind === "frequency" ? FREQUENCY : AGREEMENT).map((option) => {
              const current = answers[item.id];
              const selected = current?.kind === "likert" && current.value === option.value;
              return (
                <button
                  key={option.value}
                  onClick={() => setAnswer({ kind: "likert", value: option.value })}
                  className={optionClass(selected)}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </>
      )}

      {item.kind === "forced-choice" && (
        <>
          <h2 className="text-lg font-medium leading-snug">{item.prompt}</h2>
          <div className="flex flex-col gap-2">
            {(["a", "b"] as const).map((side) => {
              const current = answers[item.id];
              const selected = current?.kind === "forced-choice" && current.choice === side;
              return (
                <button
                  key={side}
                  onClick={() => setAnswer({ kind: "forced-choice", choice: side })}
                  className={optionClass(selected)}
                >
                  {item[side].text}
                </button>
              );
            })}
          </div>
          <p className="text-xs text-neutral-500">
            Não existe opção melhor — escolha a que descreve você com mais honestidade.
          </p>
        </>
      )}

      {item.kind === "scenario" && (
        <>
          <h2 className="text-lg font-medium leading-snug">{item.situation}</h2>
          <p className="text-sm text-neutral-500">O que você provavelmente faria?</p>
          <div className="flex flex-col gap-2">
            {item.options.map((option) => {
              const current = answers[item.id];
              const selected = current?.kind === "scenario" && current.optionId === option.id;
              return (
                <button
                  key={option.id}
                  onClick={() => setAnswer({ kind: "scenario", optionId: option.id })}
                  className={optionClass(selected)}
                >
                  {option.text}
                </button>
              );
            })}
          </div>
        </>
      )}

      <div className="flex justify-between pt-2">
        <button
          onClick={() => (step === 0 ? onBack() : setStep(step - 1))}
          className="rounded-lg px-4 py-2 text-sm text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200"
        >
          Voltar
        </button>
        <button
          onClick={() => (isLast ? onFinish() : setStep(step + 1))}
          disabled={!answered}
          className="rounded-lg bg-indigo-600 px-6 py-2 text-sm font-medium text-white disabled:opacity-40"
        >
          {isLast ? "Ver resultado" : "Próxima"}
        </button>
      </div>
    </div>
  );
}
