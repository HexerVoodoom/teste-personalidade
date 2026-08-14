"use client";

import { useState } from "react";
import { buildCreatureFicha } from "@/lib/ficha";
import { SoulProfile } from "@/lib/profile";
import { ROOKIE_BUDGET } from "@/lib/classSystem/buildSheet";

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

  const { ficha, starterCompanion, bestiaryPick, rookie } = result;

  return (
    <section className="flex flex-col gap-6">
      <div>
        <h3 className="text-lg font-semibold">Ficha e criatura</h3>
        <p className="text-xs text-neutral-500">
          Orçamento de personagem rookie (convenção deste projeto — class-system não
          fixa um orçamento inicial): {ROOKIE_BUDGET.elementos} pts em elementos,{" "}
          {ROOKIE_BUDGET.escolasDistribuidas + ROOKIE_BUDGET.evocacaoFixo} em escolas,{" "}
          {ROOKIE_BUDGET.recursos} em recurso, {ROOKIE_BUDGET.talentoRanks} ranks de talento.
        </p>
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

      <button
        onClick={() => setResult(buildCreatureFicha(profile))}
        className="self-start rounded-lg border border-neutral-300 px-4 py-2 text-sm dark:border-neutral-700"
      >
        Gerar de novo (determinístico — deve dar o mesmo resultado)
      </button>
    </section>
  );
}
