import TestFlow from "@/components/TestFlow";

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-50 font-sans dark:bg-black">
      <main className="mx-auto w-full max-w-3xl py-12">
        <header className="mb-8 px-6 text-center">
          <h1 className="text-3xl font-semibold tracking-tight">Teste de Personalidade</h1>
          <p className="mx-auto mt-2 max-w-lg text-sm text-neutral-500">
            Perfil psicométrico com base no Big Five e no HEXACO, tipologia
            junguiana, mapa astral e mapa numerológico — tudo calculado no seu
            navegador.
          </p>
        </header>
        <TestFlow />
      </main>
    </div>
  );
}
