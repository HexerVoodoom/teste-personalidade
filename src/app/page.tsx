import Quiz from "@/components/Quiz";

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-50 font-sans dark:bg-black">
      <main className="mx-auto w-full max-w-3xl py-12">
        <header className="mb-8 px-6 text-center">
          <h1 className="text-3xl font-semibold tracking-tight">Teste de Personalidade</h1>
          <p className="mt-2 text-sm text-neutral-500">
            Baseado no modelo Big Five e na tipologia junguiana. Responda com sinceridade —
            não existe resposta certa ou errada.
          </p>
        </header>
        <Quiz />
      </main>
    </div>
  );
}
