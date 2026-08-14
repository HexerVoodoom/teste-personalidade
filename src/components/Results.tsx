"use client";

import { bigFiveLabels, jungAxisLabels } from "@/lib/personality/labels";
import { PersonalityProfile } from "@/lib/personality/types";

function Bar({ label, score, low, high }: { label: string; score: number; low: string; high: string }) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-baseline justify-between text-sm">
        <span className="font-medium">{label}</span>
        <span className="text-neutral-500">{score}/100</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-800">
        <div className="h-full rounded-full bg-indigo-500" style={{ width: `${score}%` }} />
      </div>
      <div className="flex justify-between text-xs text-neutral-400">
        <span>{low}</span>
        <span>{high}</span>
      </div>
    </div>
  );
}

export default function Results({
  profile,
  onRestart,
}: {
  profile: PersonalityProfile;
  onRestart: () => void;
}) {
  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-8 p-6">
      <div>
        <h2 className="text-2xl font-semibold">Seu perfil</h2>
        <p className="text-neutral-500">
          Tipo junguiano: <span className="font-mono text-lg font-semibold">{profile.jung.code}</span>
        </p>
      </div>

      <section className="flex flex-col gap-4">
        <h3 className="text-lg font-medium">Big Five</h3>
        {Object.values(profile.bigFive).map((t) => (
          <Bar
            key={t.dimension}
            label={bigFiveLabels[t.dimension as keyof typeof bigFiveLabels].name}
            score={t.score}
            low={bigFiveLabels[t.dimension as keyof typeof bigFiveLabels].low}
            high={bigFiveLabels[t.dimension as keyof typeof bigFiveLabels].high}
          />
        ))}
      </section>

      <section className="flex flex-col gap-4">
        <h3 className="text-lg font-medium">Eixos junguianos</h3>
        {Object.entries(profile.jung.axes).map(([axis, data]) => {
          const meta = jungAxisLabels[axis as keyof typeof jungAxisLabels];
          return (
            <Bar
              key={axis}
              label={meta.name}
              score={data.score}
              low={meta.poles[1]}
              high={meta.poles[0]}
            />
          );
        })}
      </section>

      <section className="flex flex-col gap-2">
        <h3 className="text-lg font-medium">Tags dominantes</h3>
        <p className="text-xs text-neutral-500">
          Taxonomia provisória — servirá de ponte para a distribuição de pontos no
          class-system e no bestiário do Soulmon.
        </p>
        <div className="flex flex-wrap gap-2">
          {profile.dominantTags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-indigo-100 px-3 py-1 text-sm text-indigo-800 dark:bg-indigo-950 dark:text-indigo-200"
            >
              {tag}
            </span>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-2">
        <h3 className="text-lg font-medium">Exportar perfil (JSON)</h3>
        <pre className="max-h-64 overflow-auto rounded-lg bg-neutral-900 p-4 text-xs text-neutral-100">
          {JSON.stringify(profile, null, 2)}
        </pre>
      </section>

      <button
        onClick={onRestart}
        className="self-start rounded-lg border border-neutral-300 px-4 py-2 text-sm dark:border-neutral-700"
      >
        Refazer o teste
      </button>
    </div>
  );
}
