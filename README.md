# Teste de Personalidade — Soulmon

Primeira etapa do projeto Soulmon: o teste que gera o perfil que mais tarde vai
alimentar o bestiário e o class-system para criar a criatura do usuário.

> ## ⚠️ O oráculo MUDOU DE CASA
>
> O motor deste projeto — teste psicométrico, mapa astral, numerologia e a
> derivação dos eixos (`src/lib/personality`, `astrology`, `numerology`,
> `onboarding/cities`, `oracle`) — foi portado para o Soulmon, em
> `src/utils/soulProfile/`, e **é lá que ele roda de verdade agora**: o ritual
> de nascimento e a página do Oráculo do app usam esse motor. Ver
> `Soulmon/docs/ORACULO.md`.
>
> **A partir daí, o Soulmon é a fonte da verdade do oráculo.** Mudou uma regra
> de leitura (item do teste, coeficiente de eixo, cálculo do mapa)? Muda **lá**,
> e só depois traz para cá se este protótipo precisar. Regra copiada é regra que
> diverge em silêncio — e aqui existem duas cópias, então a disciplina é a única
> coisa que as mantém iguais.
>
> O que continua sendo trabalho DESTE repositório: a ponte com o class-system e
> o bestiário (`src/lib/classSystem`, `bestiary`, `creatureGen`, `ficha.ts`) —
> ficha de personagem, captura, seleção de criatura. Isso o Soulmon não
> consome.

Gera três camadas a partir de um onboarding curto e de 20 itens:

- **Perfil psicométrico** — Big Five + Honestidade-Humildade (HEXACO), com
  escores por faceta e índices de validade de resposta.
- **Mapa astral completo** — posições geocêntricas reais, Ascendente,
  Meio-do-Céu, casas Placidus, aspectos e distribuição por elemento/modalidade.
- **Mapa numerológico completo** — numerologia pitagórica com caminho de vida,
  expressão, motivação, desafios, pináculos e dívidas cármicas.

Tudo roda no navegador. Nenhum dado sai do dispositivo.

## Rodando

```bash
npm install
npm run dev     # http://localhost:3000
npm test        # 96 testes
npm run build
```

## Como funciona

O usuário informa nome completo, data, hora e cidade de nascimento, responde ao
questionário, e o resultado é um `SoulProfile` — um JSON que já é o contrato de
entrada pensado para o bestiário e o class-system do Soulmon.

```
Onboarding ─┬─> mapa astral       (data + hora + cidade)
            └─> mapa numerológico (nome + data)
Questionário ──> perfil psicométrico
                        │
                        └──> oráculo (ElementId/RoleId/AlignmentId/RealmId)
                                    ──> [bestiário / class-system]
```

O oráculo (`src/lib/oracle`) fala o mesmo vocabulário que o `oracle.ts` do
Soulmon já usa — 8 elementos, 5 papéis, 3 alinhamentos, 9 reinos — e é pensado
para **substituir** aquele arquivo assim que estiver maduro. Cada eixo é uma
função determinística e documentada dos traços psicométricos, dos eixos
junguianos, da distribuição de elementos do mapa astral e dos números centrais
da numerologia. Ver [`docs/fundamentacao.md`](docs/fundamentacao.md) para a
justificativa de cada fórmula e para os achados da leitura dos repositórios do
Soulmon, do bestiário e do class-system.

Um botão em "Ficha e criatura" liga tudo isso a um resultado concreto e
testável: `buildCreatureFicha()` monta uma ficha de personagem no vocabulário
do class-system, avalia se ela consegue capturar uma criatura do bestiário
próprio do class-system (afinidade elemental + Evocação, fórmula real), escolhe
uma criatura do bestiário como inspiração (faixa coerente + sorteio
determinístico), e gera uma criatura **rookie** nova usando o prompt-base real
do `oracle.ts` do Soulmon (`composeSpritePrompt`) e seus bancos de palavras.

## Estrutura

```
src/lib/personality/   itens, scoring, facetas, índices de validade
src/lib/astrology/     efemérides, ângulos, casas Placidus, aspectos
src/lib/numerology/    numerologia pitagórica
src/lib/onboarding/    tabela de cidades com fuso IANA
src/lib/oracle/        elemento/papel/alinhamento/reino (vocabulário do Soulmon)
src/lib/classSystem/   ficha de personagem + captura (vocabulário do class-system)
src/lib/bestiary/      seed local do besti-rio- + seleção por faixa+aleatoriedade
src/lib/creatureGen/   gerador de criatura rookie (prompt-base do Soulmon)
src/lib/profile.ts     junta as três camadas + o oráculo
src/lib/ficha.ts       pipeline: oráculo → ficha → criatura do bestiário → rookie
src/components/        onboarding, quiz, resultados
```

## Precisão dos cálculos astrológicos

As posições planetárias vêm de [`astronomy-engine`](https://github.com/cosinekitty/astronomy)
e são rotacionadas para a eclíptica verdadeira da data. São verificadas em teste
contra efemérides publicadas (tolerância de 0,05° nos dez corpos).

O instante UTC é resolvido a partir do fuso IANA da cidade usando a tz database
do runtime, o que honra as regras históricas de horário de verão — errar isso
desloca o Ascendente em ~15°, e há teste cobrindo o caso do horário de verão
brasileiro.

Onde o cálculo não é possível, o sistema degrada explicitamente em vez de
inventar precisão: sem horário de nascimento, o Ascendente e as casas ficam
indisponíveis; acima dos círculos polares, onde Placidus é matematicamente
indefinido, as casas caem para Signos Inteiros. Nos dois casos o usuário é
avisado.

## Próximo passo

- ~~Amadurecer o oráculo até ele poder substituir de fato o `oracle.ts` do
  Soulmon~~ — **feito**: o motor foi portado para
  `Soulmon/src/utils/soulProfile/` e substituiu a metade "leitura" do
  `oracle.ts` (signo por faixa de datas, ascendente chutado pela hora,
  horóscopo chinês/védico e as 6 perguntas do quiz). A metade criativa
  (arquétipo, famílias, as 11 formas, prompts de sprite) continua no
  `oracle.ts` e não foi tocada.
- Corrigir o bestiário (`besti-rio-`): tags erradas e descrições poluídas,
  num repositório separado.
- Ligar `oracle.classElements` (os 17 elementos do class-system) a uma API de
  distribuição real, em vez de só expor os escores. **Este é o trabalho que
  sobra aqui** — o Soulmon não consome os elementos do class-system.
