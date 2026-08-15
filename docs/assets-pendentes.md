# Assets de imagem pendentes

Levantamento de toda imagem que o app ainda precisa (nenhuma existe hoje — a
geração de imagem é 100% não-implementada; o pipeline só produz os prompts em
texto). Registrado aqui pra gerar depois, quando tivermos acesso a uma API de
geração de imagem (Gemini ou outra) nesta sessão remota — sem chave de API ou
navegador logado, não tem como gerar nada agora.

## Por que nada foi gerado ainda

- Não existe `<img>`/`<Image>` em nenhum componente de `src/app`/`src/components`.
- `generateRookieCreature` (`src/lib/creatureGen/rookie.ts:119-126`) e
  `buildEvolutionChain` (`src/lib/creatureGen/evolutionChain.ts:75`) só montam
  o **prompt em texto** (`composeSpritePrompt`) — nada chama uma API de imagem
  com esse prompt.
- `src/components/CreatureFicha.tsx` renderiza esses prompts em blocos
  `<pre>`, com o aviso explícito "Só o texto — nenhuma imagem é gerada aqui"
  (linha ~232).
- Este ambiente remoto não tem sessão logada do Google/Gemini nem chave de
  API configurada — ver decisão em `AGENTS.md`/conversa: geração via
  navegador exigiria login interativo que não é possível mostrar nesta sessão
  (sem tela compartilhada). Precisa de uma `GEMINI_API_KEY` (ou similar) pra
  automatizar isso sem navegador.

## Lista de assets

| # | Asset | Tipo | Onde renderiza | Fonte do prompt/conteúdo |
|---|---|---|---|---|
| 1 | Sprite da criatura rookie | Por usuário (gerado a partir do prompt) | `CreatureFicha.tsx:176-188` | `rookie.imagePrompt` (`creatureGen/rookie.ts`) |
| 2 | Sprites das evoluções (champion/ultimate/mega/ultra × 3 linhas) | Por usuário, encadeado image-to-image a partir do sprite rookie | `CreatureFicha.tsx:195-253` (`EvolutionChainSection`) | `step.prompt` (`creatureGen/evolutionChain.ts`), cada estágio referencia o anterior via `referenceStageIds` |
| 3 | Ícone da criatura do bestiário (inspiração) | Fixo, um por entrada do bestiário (400 no pool) | `CreatureFicha.tsx:162-171` | Não tem prompt ainda — precisaria ser derivado de `bestiary/pool.json`/`seed.ts` |
| 4 | Favicon / logo do app | Fixo | `src/app/layout.tsx` (metadata) | Hoje é o favicon genérico do Next.js — precisa ser substituído |
| 5 | Fundo/chrome decorativo da UI | Fixo | Não existe hoje em `src/app` (só CSS em `globals.css`) | A definir |
| 6 | **Cradle/berço de incubação** (conceito novo) | Fixo, com variantes customizáveis (skins/molduras) | Não existe hoje — seria um novo passo de onboarding/resultado ("nascimento"/incubação da criatura) antes ou junto da revelação do rookie | A definir — pedido do usuário, ainda sem UI nem prompt desenhado |
| 7 | Elementos decorativos customizáveis (além do cradle) | Fixo, set de opções que o usuário escolhe | A definir — mencionado pelo usuário como "outros elementos decorativos" sem especificar quais | A definir |

## Itens 6 e 7 precisam de escopo antes de gerar

O usuário pediu "craddle e outros elementos decorativos" customizáveis, mas
esse conceito não existe em nenhum lugar do código ou dos docs hoje — não é
só imagem faltando, é uma funcionalidade nova (tela de incubação/nascimento
com customização visual). Antes de gerar essas imagens específicas, falta
definir:

- Onde essa tela entra no fluxo (antes do questionário? depois, junto da
  revelação da criatura?).
- Quantas variantes de cradle/decoração oferecer, e o que cada uma
  representa (elemento? papel? puramente estético?).
- Se a escolha do usuário afeta algo mecânico (ficha, oráculo) ou é 100%
  cosmética.

## Próximo passo

Quando tivermos uma `GEMINI_API_KEY` (ou outra API de geração de imagem)
disponível nesta sessão, os itens 1-5 já têm prompt/fonte de dados prontos
pra gerar direto. Os itens 6-7 precisam de uma rodada de definição de escopo
com o usuário antes.
