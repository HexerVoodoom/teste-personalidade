"use client";

import { useState } from "react";
import { formatPosition } from "@/lib/astrology/chart";
import { jungAxisLabels, numberMeanings, traitLabels } from "@/lib/personality/labels";
import { TRAIT_DIMENSIONS, JUNG_AXES } from "@/lib/personality/types";
import { NumberResult } from "@/lib/numerology/numerology";
import { alignmentLabels, elementLabels, realmLabels, roleLabels } from "@/lib/oracle/labels";
import { ALIGNMENT_ORDER, ELEMENT_ORDER, REALM_ORDER, ROLE_ORDER } from "@/lib/oracle/types";
import { SoulProfile } from "@/lib/profile";
import CreatureFicha from "@/components/CreatureFicha";

function Bar({ label, score, low, high }: { label: string; score: number; low: string; high: string }) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-baseline justify-between text-sm">
        <span className="font-medium">{label}</span>
        <span className="tabular-nums text-neutral-500">{score}</span>
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

function Section({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-4">
      <div>
        <h3 className="text-lg font-semibold">{title}</h3>
        {subtitle && <p className="text-xs text-neutral-500">{subtitle}</p>}
      </div>
      {children}
    </section>
  );
}

function NumberCard({ label, result, hint }: { label: string; result: NumberResult; hint: string }) {
  return (
    <div className="rounded-lg border border-neutral-200 p-3 dark:border-neutral-800">
      <div className="flex items-baseline justify-between">
        <span className="text-sm font-medium">{label}</span>
        <span className="text-2xl font-semibold tabular-nums text-indigo-600 dark:text-indigo-400">
          {result.value}
        </span>
      </div>
      <p className="mt-1 text-xs text-neutral-500">{numberMeanings[result.value] ?? hint}</p>
      {result.isMaster && (
        <span className="mt-2 inline-block rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-800 dark:bg-amber-950 dark:text-amber-200">
          número mestre
        </span>
      )}
      {result.karmicDebt && (
        <span className="mt-2 ml-1 inline-block rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-medium text-rose-800 dark:bg-rose-950 dark:text-rose-200">
          dívida cármica {result.karmicDebt}
        </span>
      )}
    </div>
  );
}

export default function Results({ profile, onRestart }: { profile: SoulProfile; onRestart: () => void }) {
  const [showJson, setShowJson] = useState(false);
  const { psychometric, astrology, numerology, oracle, onboarding } = profile;

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-10 p-6">
      <header>
        <h2 className="text-2xl font-semibold">{onboarding.fullName}</h2>
        <p className="text-sm text-neutral-500">
          {new Date(`${onboarding.birthDate}T12:00:00`).toLocaleDateString("pt-BR")}
          {!onboarding.timeUnknown && ` às ${onboarding.birthTime}`} · {onboarding.placeLabel}
        </p>
      </header>

      {!psychometric.validity.trustworthy && (
        <div className="rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm dark:border-amber-900 dark:bg-amber-950/40">
          <p className="font-medium">Atenção ao padrão de respostas</p>
          <ul className="mt-2 list-disc pl-5 text-xs text-neutral-700 dark:text-neutral-300">
            {psychometric.validity.flags.map((flag) => (
              <li key={flag}>{flag}</li>
            ))}
          </ul>
        </div>
      )}

      <Section
        title="Perfil psicométrico"
        subtitle="Big Five (Costa & McCrae) + Honestidade-Humildade (HEXACO). Esta é a camada com validação empírica."
      >
        {TRAIT_DIMENSIONS.map((dim) => {
          const trait = psychometric.traits[dim];
          const meta = traitLabels[dim];
          return (
            <div key={dim} className="flex flex-col gap-2">
              <Bar label={meta.name} score={trait.score} low={meta.low} high={meta.high} />
              <p className="text-xs text-neutral-500">{meta.blurb}</p>
              <div className="flex flex-wrap gap-2 pl-1">
                {trait.facets.map((facet) => (
                  <span
                    key={facet.facet}
                    className="rounded-md bg-neutral-100 px-2 py-0.5 text-xs text-neutral-600 dark:bg-neutral-900 dark:text-neutral-400"
                  >
                    {facet.facet}: <span className="tabular-nums font-medium">{facet.score}</span>
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </Section>

      <Section
        title={`Tipologia junguiana · ${psychometric.jung.code}`}
        subtitle="Camada complementar. A tipologia tem evidência psicométrica mais fraca que o Big Five, por isso reportamos a clareza de cada eixo."
      >
        {JUNG_AXES.map((axis) => {
          const data = psychometric.jung.axes[axis];
          const meta = jungAxisLabels[axis];
          const weak = psychometric.jung.weakAxes.includes(axis);
          return (
            <div key={axis} className="flex flex-col gap-1">
              <Bar label={meta.name} score={data.score} low={meta.poles[1]} high={meta.poles[0]} />
              <span className={`text-xs ${weak ? "text-amber-600 dark:text-amber-400" : "text-neutral-400"}`}>
                Clareza {data.clarity}
                {weak && " — preferência fraca, essa letra pode virar em um novo teste."}
              </span>
            </div>
          );
        })}
      </Section>

      <Section
        title="Mapa astral"
        subtitle={`Posições geocêntricas reais para ${new Date(astrology.utcDate).toUTCString()}. Casas: ${
          astrology.houseSystem === "placidus" ? "Placidus" : "Signos Inteiros"
        }.`}
      >
        {astrology.warnings.map((warning) => (
          <p key={warning} className="rounded-lg bg-neutral-100 p-3 text-xs text-neutral-600 dark:bg-neutral-900 dark:text-neutral-400">
            {warning}
          </p>
        ))}

        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Sol", value: astrology.bigThree.sun },
            { label: "Lua", value: astrology.bigThree.moon },
            { label: "Ascendente", value: astrology.bigThree.ascendant ?? "—" },
          ].map((entry) => (
            <div key={entry.label} className="rounded-lg border border-neutral-200 p-3 text-center dark:border-neutral-800">
              <div className="text-xs text-neutral-500">{entry.label}</div>
              <div className="mt-1 font-medium">{entry.value}</div>
            </div>
          ))}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[420px] text-sm">
            <thead>
              <tr className="border-b border-neutral-200 text-left text-xs text-neutral-500 dark:border-neutral-800">
                <th className="py-2 font-medium">Astro</th>
                <th className="py-2 font-medium">Posição</th>
                <th className="py-2 font-medium">Casa</th>
              </tr>
            </thead>
            <tbody>
              {astrology.bodies.map((body) => (
                <tr key={body.body} className="border-b border-neutral-100 dark:border-neutral-900">
                  <td className="py-2">
                    {body.body}
                    {body.retrograde && <span className="ml-1 text-xs text-amber-600 dark:text-amber-400">℞</span>}
                  </td>
                  <td className="py-2 tabular-nums">{formatPosition(body.longitude)}</td>
                  <td className="py-2 tabular-nums">{onboarding.timeUnknown ? "—" : body.house}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {(["elements", "modalities", "polarities"] as const).map((key) => (
            <div key={key}>
              <div className="mb-2 text-xs font-medium text-neutral-500">
                {key === "elements" ? "Elementos" : key === "modalities" ? "Modalidades" : "Polaridades"}
              </div>
              {Object.entries(astrology.distribution[key]).map(([name, value]) => (
                <div key={name} className="flex justify-between text-xs">
                  <span className="capitalize">{name}</span>
                  <span className="tabular-nums text-neutral-500">{value}</span>
                </div>
              ))}
            </div>
          ))}
        </div>

        {astrology.aspects.length > 0 && (
          <div>
            <div className="mb-2 text-xs font-medium text-neutral-500">
              Aspectos mais exatos
            </div>
            <div className="flex flex-wrap gap-2">
              {astrology.aspects.slice(0, 10).map((aspect) => (
                <span
                  key={`${aspect.a}-${aspect.b}-${aspect.aspect}`}
                  className="rounded-md bg-neutral-100 px-2 py-1 text-xs dark:bg-neutral-900"
                >
                  {aspect.a} {aspect.aspect} {aspect.b}
                  <span className="ml-1 text-neutral-400">{aspect.orb}°</span>
                </span>
              ))}
            </div>
          </div>
        )}
      </Section>

      <Section
        title="Mapa numerológico"
        subtitle={`Sistema pitagórico sobre "${numerology.normalizedName}".`}
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <NumberCard label="Caminho de vida" result={numerology.lifePath} hint="a lição central da vida" />
          <NumberCard label="Expressão / Destino" result={numerology.expression} hint="talentos disponíveis" />
          <NumberCard label="Motivação (alma)" result={numerology.soulUrge} hint="o que move por dentro" />
          <NumberCard label="Personalidade" result={numerology.personality} hint="como os outros te veem" />
          <NumberCard label="Dia natalício" result={numerology.birthday} hint="um talento específico" />
          <NumberCard label="Maturidade" result={numerology.maturity} hint="para onde a vida converge" />
          <NumberCard label="Equilíbrio" result={numerology.balance} hint="apoio sob estresse" />
          <NumberCard
            label={`Ano pessoal ${numerology.personalYearReference}`}
            result={numerology.personalYear}
            hint="o tema do ciclo atual"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <div className="mb-1 text-xs font-medium text-neutral-500">Desafios</div>
            {numerology.challenges.map((challenge) => (
              <div key={challenge.index} className="flex justify-between text-xs">
                <span>{challenge.label}</span>
                <span className="tabular-nums font-medium">{challenge.value}</span>
              </div>
            ))}
          </div>
          <div>
            <div className="mb-1 text-xs font-medium text-neutral-500">Pináculos</div>
            {numerology.pinnacles.map((pinnacle) => (
              <div key={pinnacle.index} className="flex justify-between text-xs">
                <span>
                  {pinnacle.startAge}
                  {pinnacle.endAge === null ? "+ anos" : `–${pinnacle.endAge} anos`}
                </span>
                <span className="tabular-nums font-medium">{pinnacle.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap gap-4 text-xs">
          <span>
            <span className="text-neutral-500">Lições cármicas: </span>
            {numerology.karmicLessons.length ? numerology.karmicLessons.join(", ") : "nenhuma"}
          </span>
          <span>
            <span className="text-neutral-500">Paixão oculta: </span>
            {numerology.hiddenPassion.join(", ") || "—"}
          </span>
          {numerology.karmicDebts.length > 0 && (
            <span>
              <span className="text-neutral-500">Dívidas cármicas: </span>
              {numerology.karmicDebts.join(", ")}
            </span>
          )}
        </div>
      </Section>

      <Section
        title="Oráculo"
        subtitle="Elemento, papel, alinhamento e reino no vocabulário do Soulmon — derivados diretamente do perfil psicométrico, do mapa astral e do mapa numerológico acima. É o contrato de saída para o bestiário e o class-system."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg border border-neutral-200 p-3 dark:border-neutral-800">
            <div className="mb-1 text-xs font-medium text-neutral-500">Elemento dominante</div>
            <div className="text-lg font-semibold">
              {elementLabels[oracle.dominantElement].emoji} {elementLabels[oracle.dominantElement].name}
            </div>
          </div>
          <div className="rounded-lg border border-neutral-200 p-3 dark:border-neutral-800">
            <div className="mb-1 text-xs font-medium text-neutral-500">Papel dominante</div>
            <div className="text-lg font-semibold">
              {roleLabels[oracle.dominantRole].emoji} {roleLabels[oracle.dominantRole].name}
            </div>
          </div>
          <div className="rounded-lg border border-neutral-200 p-3 dark:border-neutral-800">
            <div className="mb-1 text-xs font-medium text-neutral-500">Alinhamento dominante</div>
            <div className="text-lg font-semibold">
              {alignmentLabels[oracle.dominantAlignment].emoji} {alignmentLabels[oracle.dominantAlignment].name}
            </div>
          </div>
          <div className="rounded-lg border border-neutral-200 p-3 dark:border-neutral-800">
            <div className="mb-1 text-xs font-medium text-neutral-500">Reino dominante</div>
            <div className="text-lg font-semibold">
              {realmLabels[oracle.dominantRealm].emoji} {realmLabels[oracle.dominantRealm].name}
            </div>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <div className="text-xs font-medium text-neutral-500">Elementos</div>
            {ELEMENT_ORDER.map((el) => (
              <Bar
                key={el}
                label={`${elementLabels[el].emoji} ${elementLabels[el].name}`}
                score={Math.round(oracle.elements[el])}
                low=""
                high=""
              />
            ))}
          </div>
          <div className="flex flex-col gap-2">
            <div className="text-xs font-medium text-neutral-500">Papéis</div>
            {ROLE_ORDER.map((role) => (
              <Bar
                key={role}
                label={`${roleLabels[role].emoji} ${roleLabels[role].name}`}
                score={Math.round(oracle.roles[role])}
                low=""
                high=""
              />
            ))}
            <div className="mt-2 text-xs font-medium text-neutral-500">Alinhamentos</div>
            {ALIGNMENT_ORDER.map((alignment) => (
              <Bar
                key={alignment}
                label={`${alignmentLabels[alignment].emoji} ${alignmentLabels[alignment].name}`}
                score={Math.round(oracle.alignments[alignment])}
                low=""
                high=""
              />
            ))}
          </div>
        </div>

        <div>
          <div className="mb-2 text-xs font-medium text-neutral-500">Reinos</div>
          <div className="flex flex-wrap gap-2">
            {REALM_ORDER.map((realm) => (
              <span
                key={realm}
                className="rounded-full bg-neutral-100 px-3 py-1 text-xs dark:bg-neutral-900"
              >
                {realmLabels[realm].emoji} {realmLabels[realm].name}
                <span className="ml-1 text-neutral-400">{Math.round(oracle.realms[realm])}</span>
              </span>
            ))}
          </div>
        </div>
      </Section>

      <CreatureFicha profile={profile} />

      <Section title="Exportar" subtitle="Este JSON é o contrato de entrada para o bestiário e o class-system.">
        <button
          onClick={() => setShowJson(!showJson)}
          className="self-start rounded-lg border border-neutral-300 px-4 py-2 text-sm dark:border-neutral-700"
        >
          {showJson ? "Ocultar JSON" : "Mostrar JSON"}
        </button>
        {showJson && (
          <pre className="max-h-96 overflow-auto rounded-lg bg-neutral-900 p-4 text-xs text-neutral-100">
            {JSON.stringify(profile, null, 2)}
          </pre>
        )}
      </Section>

      <button
        onClick={onRestart}
        className="self-start rounded-lg border border-neutral-300 px-4 py-2 text-sm dark:border-neutral-700"
      >
        Refazer
      </button>
    </div>
  );
}
