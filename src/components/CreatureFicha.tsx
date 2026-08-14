"use client";

import { useState } from "react";
import { buildCreatureFicha } from "@/lib/ficha";
import { SoulProfile } from "@/lib/profile";
import { FICHA_STAGE_ORDER, FichaStage } from "@/lib/classSystem/buildSheet";

const FICHA_STAGE_LABELS: Record<FichaStage, string> = {
  rookie: "Rookie", champion: "Champion", ultimate: "Ultimate", mega: "Mega", ultra: "Ultra",
};

const ELEMENTO_LABELS: Record<string, string> = {
  fogo: "Fogo", agua: "Água", terra: "Terra", ar: "Ar", eletricidade: "Eletricidade",
  arcano: "Arcano", sombra: "Sombra", luz: "Luz", vileza: "Vileza", morte: "Morte",
  vida: "Vida", vigor: "Vigor", marcial: "Marcial", tempo: "Tempo", som: "Som",
  gravidade: "Gravidade", espaco: "Espaço",
};
const ESCOLA_LABELS: Record<string, string> = {
  combate_fisico: "Combate Físico", longo_alcance: "Longo Alcance", evocacao: "Evocação",
  conjuracao: "Conjuração", benca: "Bênção (Buff)", maldicao: "Maldição (Debuff)",
};
const RECURSO_LABELS: Record<string, string> = {
  mana: "Mana", fe: "Fé", furia: "Fúria", soullink: "Soul Link", ressonancia: "Ressonância",
};
const TALENTO_LABELS: Record<string, string> = {
  area_ampliada: "Área Ampliada", conjuracao_rapida: "Conjuração Rápida",
  alcance_estendido: "Alcance Estendido", canalizacao_profunda: "Canalização Profunda",
  economia_de_recurso: "Economia de Recurso", persistencia: "Persistência",
  impacto_imediato: "Impacto Imediato", dano_ao_longo_do_tempo: "Dano ao Longo do Tempo",
};
const PROFISSAO_LABELS: Record<string, string> = {
  ferreiro: "Ferreiro", tecelao: "Tecelão", artesao: "Artesão",
  joalheiro: "Joalheiro", alquimista: "Alquimista", curtidor: "Curtidor",
};

function PointRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span>{label}</span>
      <span className="tabular-nums font-medium text-indigo-600 dark:text-indigo-400">{value}</span>
    </div>
  );
}

export default function CreatureFicha({ profile }: { profile: SoulProfile }) {
  const [result, setResult] = useState<ReturnType<typeof buildCreatureFicha> | null>(null);
  const [stage, setStage] = useState<FichaStage>("rookie");

  if (!result) {
    return (
      <section className="flex flex-col gap-3">
        <div>
          <h3 className="text-lg font-semibold">Gerar ficha e criatura</h3>
          <p className="text-xs text-neutral-500">
            Usa o oráculo acima para montar uma ficha de personagem no class-system,
            escolher uma criatura do bestiário e gerar o prompt de uma criatura rookie
            totalmente nova.
          </p>
        </div>
        <button
          onClick={() => setResult(buildCreatureFicha(profile))}
          className="self-start rounded-lg bg-indigo-600 px-6 py-2 text-sm font-medium text-white"
        >
          Gerar ficha da criatura
        </button>
      </section>
    );
  }

  const { starterCompanion, bestiaryPick, rookie } = result;
  const ficha = result.fichaByStage[stage];

  return (
    <section className="flex flex-col gap-6">
      <div>
        <h3 className="text-lg font-semibold">Ficha e criatura</h3>
        <p className="text-xs text-neutral-500">
          Orçamento de personagem por estágio (convenção deste projeto — class-system não fixa
          um orçamento inicial): cresce a cada evolução (rookie → champion → ultimate → mega →
          ultra), na mesma lógica de distribuição de pontos, só que com mais pontos — um Ultra
          é uma ficha bem mais avançada que um Rookie, não só re-pintada.
        </p>
        <div className="mt-2 flex flex-wrap gap-1">
          {FICHA_STAGE_ORDER.map((s) => (
            <button
              key={s}
              onClick={() => setStage(s)}
              className={`rounded-lg border px-3 py-1 text-xs font-medium ${
                s === stage
                  ? "border-indigo-600 bg-indigo-600 text-white"
                  : "border-neutral-300 dark:border-neutral-700"
              }`}
            >
              {FICHA_STAGE_LABELS[s]}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-neutral-200 p-3 dark:border-neutral-800">
          <div className="mb-2 text-xs font-medium text-neutral-500">
            Elementos ({ficha.totals.elementos} pts)
          </div>
          {Object.entries(ficha.elementos)
            .sort((a, b) => (b[1] ?? 0) - (a[1] ?? 0))
            .map(([id, pts]) => (
              <PointRow key={id} label={ELEMENTO_LABELS[id] ?? id} value={pts ?? 0} />
            ))}
        </div>

        <div className="rounded-lg border border-neutral-200 p-3 dark:border-neutral-800">
          <div className="mb-2 text-xs font-medium text-neutral-500">
            Escolas ({ficha.totals.escolas} pts)
          </div>
          {Object.entries(ficha.escolas)
            .sort((a, b) => (b[1] ?? 0) - (a[1] ?? 0))
            .map(([id, pts]) => (
              <PointRow key={id} label={ESCOLA_LABELS[id] ?? id} value={pts ?? 0} />
            ))}
          <div className="mt-3 mb-2 text-xs font-medium text-neutral-500">
            Recurso ({ficha.totals.recursos} pts)
          </div>
          {Object.entries(ficha.recursos).map(([id, pts]) => (
            <PointRow key={id} label={RECURSO_LABELS[id] ?? id} value={pts ?? 0} />
          ))}
          <div className="mt-3 mb-2 text-xs font-medium text-neutral-500">
            Talentos ({ficha.totals.talentos} ranks)
          </div>
          {Object.entries(ficha.talentos).map(([id, ranks]) => (
            <PointRow key={id} label={TALENTO_LABELS[id] ?? id} value={ranks ?? 0} />
          ))}
          <div className="mt-3 mb-2 text-xs font-medium text-neutral-500">
            Profissão ({ficha.totals.profissoes} pts)
          </div>
          {Object.entries(ficha.profissoes).map(([id, pts]) => (
            <PointRow key={id} label={PROFISSAO_LABELS[id] ?? id} value={pts ?? 0} />
          ))}
        </div>
      </div>

      <div className="rounded-lg border border-neutral-200 p-3 dark:border-neutral-800">
        <div className="mb-1 text-xs font-medium text-neutral-500">
          Companheiro inicial (bestiário do class-system)
        </div>
        {starterCompanion ? (
          <>
            <div className="font-medium">{starterCompanion.criatura.nome}</div>
            <div className="text-xs text-neutral-500">{starterCompanion.criatura.descricao}</div>
            <div className="mt-1 text-xs text-neutral-400">
              Poder de captura {Math.round(starterCompanion.poder)} / exigido{" "}
              {starterCompanion.criatura.poderBase}
            </div>
          </>
        ) : (
          <div className="text-xs text-neutral-500">
            Nenhuma criatura do class-system é capturável ainda com esta ficha.
          </div>
        )}
      </div>

      <div className="rounded-lg border border-neutral-200 p-3 dark:border-neutral-800">
        <div className="mb-1 text-xs font-medium text-neutral-500">
          Criatura do bestiário (inspiração)
        </div>
        <div className="font-medium">
          {bestiaryPick.creature.nome}{" "}
          <span className="text-xs font-normal text-neutral-400">
            ({bestiaryPick.creature.origem}, pontuação {bestiaryPick.score})
          </span>
        </div>
        <div className="text-xs text-neutral-500">{bestiaryPick.creature.descricao}</div>
      </div>

      <div className="rounded-lg border border-indigo-200 bg-indigo-50 p-4 dark:border-indigo-900 dark:bg-indigo-950/30">
        <div className="mb-1 text-xs font-medium text-indigo-700 dark:text-indigo-300">
          Criatura rookie gerada
        </div>
        <div className="text-lg font-semibold">{rookie.name}</div>
        <div className="text-sm italic text-neutral-600 dark:text-neutral-400">
          {rookie.archetype.phrase.pt}
        </div>
        <p className="mt-2 text-sm">{rookie.bio.pt}</p>
        <div className="mt-3 text-xs font-medium text-neutral-500">Prompt de imagem (EN)</div>
        <pre className="mt-1 max-h-48 overflow-auto rounded-lg bg-neutral-900 p-3 text-xs whitespace-pre-wrap text-neutral-100">
          {rookie.imagePrompt}
        </pre>
      </div>

      <EvolutionChainSection chain={result.evolutionChain} />

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setResult(buildCreatureFicha(profile))}
          className="self-start rounded-lg border border-neutral-300 px-4 py-2 text-sm dark:border-neutral-700"
        >
          Gerar de novo (determinístico — deve dar o mesmo resultado)
        </button>
      </div>
    </section>
  );
}

const STAGE_LABELS: Record<string, string> = {
  "champion-virus": "Champion — Vírus (Poder)",
  "ultimate-virus": "Ultimate — Vírus (Poder)",
  "mega-virus": "Mega — Vírus (Poder)",
  "champion-data": "Champion — Data (Harmonia)",
  "ultimate-data": "Ultimate — Data (Harmonia)",
  "mega-data": "Mega — Data (Harmonia)",
  "champion-vaccine": "Champion — Vacina (Benevolência)",
  "ultimate-vaccine": "Ultimate — Vacina (Benevolência)",
  "mega-vaccine": "Mega — Vacina (Benevolência)",
  ultra: "Ultra (fusão das 3 linhas)",
};

function EvolutionChainSection({
  chain,
}: {
  chain: ReturnType<typeof buildCreatureFicha>["evolutionChain"];
}) {
  const [show, setShow] = useState(false);
  const nextStages = chain.filter((s) => s.stageId !== "rookie");

  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={() => setShow(!show)}
        className="self-start rounded-lg border border-neutral-300 px-4 py-2 text-sm dark:border-neutral-700"
      >
        {show ? "Ocultar" : "Mostrar"} prompts das próximas etapas (champion → ultimate → mega → ultra)
      </button>
      <p className="text-xs text-neutral-500">
        Só o texto — nenhuma imagem é gerada aqui. Cada prompt assume a imagem
        do estágio anterior como referência (image-to-image), igual à cadeia
        do Soulmon (<code>spritePrompts.ts</code>).
      </p>
      {show && (
        <div className="flex flex-col gap-3">
          {nextStages.map((step) => (
            <div key={step.stageId} className="rounded-lg border border-neutral-200 p-3 dark:border-neutral-800">
              <div className="mb-1 flex items-center justify-between">
                <span className="text-sm font-medium">{STAGE_LABELS[step.stageId] ?? step.stageId}</span>
                <span className="text-xs text-neutral-400">
                  ref: {step.referenceStageIds.join(", ") || "—"}
                </span>
              </div>
              <pre className="max-h-32 overflow-auto rounded-lg bg-neutral-900 p-2 text-xs whitespace-pre-wrap text-neutral-100">
                {step.prompt}
              </pre>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
