# Teste de Personalidade — Soulmon

Primeira etapa do projeto Soulmon: o teste que gera o perfil que mais tarde vai
alimentar o bestiário e o class-system para criar a criatura do usuário.

Gera três camadas a partir de um onboarding curto e de 54 itens:

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
npm test        # 63 testes
npm run build
```

## Como funciona

O usuário informa nome completo, data, hora e cidade de nascimento, responde ao
questionário, e o resultado é um `SoulProfile` — um JSON que já é o contrato de
entrada pensado para os outros dois projetos.

```
Onboarding ─┬─> mapa astral    (data + hora + cidade)
            └─> mapa numerológico (nome + data)
Questionário ──> perfil psicométrico
                        │
                        └──> mergedTags  ──> [bestiário / class-system]
```

As três camadas são fundidas em um único ranking de tags, cada camada
normalizada antes de ser pesada para que nenhuma domine só por ter mais tags. O
peso é deliberadamente desigual: o psicométrico vale 1.0, o astrológico 0.45 e o
numerológico 0.3, porque só o primeiro tem validação empírica. Ver
[`docs/fundamentacao.md`](docs/fundamentacao.md).

## Estrutura

```
src/lib/personality/   itens, scoring, facetas, índices de validade
src/lib/astrology/     efemérides, ângulos, casas Placidus, aspectos
src/lib/numerology/    numerologia pitagórica
src/lib/onboarding/    tabela de cidades com fuso IANA
src/lib/profile.ts     fusão das três camadas
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

Ler os repositórios do Soulmon (bestiário, class-system, prompt base e
onboarding) e substituir o vocabulário provisório de tags pelo vocabulário real
do bestiário. A mecânica de fusão já está testada e é agnóstica ao vocabulário —
só a tabela de tags muda.
