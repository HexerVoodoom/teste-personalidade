# Fundamentação

Este projeto tem **três camadas independentes**, e a separação entre elas é
deliberada e estrutural, não cosmética.

| Camada | Base | Validade empírica | Peso na fusão |
|---|---|---|---|
| Psicométrica | Big Five + HEXACO | Alta | 1.00 |
| Astrológica | Efemérides reais + astrologia tropical | Nenhuma (simbólica) | 0.45 |
| Numerológica | Numerologia pitagórica | Nenhuma (simbólica) | 0.30 |

A camada psicométrica é a única com evidência científica. As outras duas são
sistemas simbólicos: os **cálculos** astronômicos são corretos e verificáveis,
mas a **interpretação** astrológica e numerológica não tem poder preditivo
demonstrado. Elas estão aqui porque geram sabor narrativo denso e determinístico
para a criatura — não porque digam algo verdadeiro sobre a pessoa. O código
reflete isso: os pesos em `LAYER_WEIGHTS` (`src/lib/profile.ts`) garantem que o
psicométrico domine a distribuição de tags.

---

## 1. Camada psicométrica

### Modelo de traços

**Big Five / Modelo dos Cinco Grandes Fatores** — o modelo dimensional com o
maior corpo de evidência psicométrica e replicação transcultural.

- Costa, P. T., & McCrae, R. R. (1992). *Revised NEO Personality Inventory
  (NEO-PI-R) and NEO Five-Factor Inventory (NEO-FFI) professional manual.*
- Goldberg, L. R. (1993). The structure of phenotypic personality traits.
  *American Psychologist, 48*(1), 26–34.
- Goldberg, L. R., et al. (2006). The International Personality Item Pool and
  the future of public-domain personality measures. *Journal of Research in
  Personality, 40*(1), 84–96.

**HEXACO — o sexto fator, Honestidade-Humildade.**

- Ashton, M. C., & Lee, K. (2007). Empirical, theoretical, and practical
  advantages of the HEXACO model of personality structure. *Personality and
  Social Psychology Review, 11*(2), 150–166.
- Lee, K., & Ashton, M. C. (2004). Psychometric properties of the HEXACO
  Personality Inventory. *Multivariate Behavioral Research, 39*(2), 329–358.

O sexto fator emerge de forma consistente em estudos lexicais em várias línguas
e separa "ser gentil" (Amabilidade) de "ser íntegro" (Honestidade-Humildade) —
uma distinção que importa quando a saída alimenta algo parecido com alinhamento
de criatura.

### Decisões de instrumento

Cada uma resolve um problema real de psicometria:

1. **Facetas, não só fatores.** Cada fator é medido por 3 facetas estreitas
   (ex.: Conscienciosidade = organização, persistência, prudência). Duas pessoas
   com o mesmo escore de fator podem diferir muito nas facetas, e essa variância
   é justamente o que dá granularidade para distribuir pontos depois.

2. **Chaveamento balanceado.** Cada faceta tem um item direto e um item
   invertido. É o controle padrão para o viés de aquiescência: quem concorda com
   tudo cai perto do meio da escala em vez de estourar todos os traços. Há um
   teste automatizado que garante esse balanceamento (`scoring.test.ts`).

3. **Formatos variados.** Concordância Likert, frequência, escolha forçada
   (ipsativa) e cenários situacionais. A variedade reduz *straight-lining*
   (responder tudo igual por tédio), e a escolha forçada resiste à
   desejabilidade social porque as duas opções são igualmente apresentáveis.

4. **Ordem intercalada.** Nenhuma sequência tem mais de 3 itens do mesmo
   formato seguidos — a condição que mais confiavelmente produz resposta
   descuidada em inventários longos.

5. **Índices de validade.** Aquiescência, inconsistência (pares de itens que
   deveriam concordar após inversão), resposta extrema e resposta no ponto
   médio. Nenhum deles mede personalidade; eles medem se o protocolo pode ser
   lido como um resultado de personalidade. Quando algum estoura, a interface
   avisa antes de mostrar o perfil.

### Tipologia junguiana

- Jung, C. G. (1921). *Psychologische Typen.*
- Myers, I. B., & Myers, P. B. (1980). *Gifts Differing: Understanding
  Personality Type.*

Medida por itens de escolha forçada nos quatro eixos (EI, SN, TF, JP),
compondo um código de 4 letras.

**Ressalva explícita, refletida no código:** a tipologia tem evidência
psicométrica bem mais fraca que o Big Five — as medidas são categóricas quando
os traços subjacentes são contínuos, e a estabilidade teste-reteste de algumas
letras é baixa. Por isso o sistema reporta a **clareza** de cada eixo: um eixo
decidido por 2 votos a 1 é sinalizado como preferência fraca, porque é quase
cara-ou-coroa. O Big Five continua sendo o motor principal.

### Modelos considerados e não incluídos

- **Eneagrama** — popular, mas com evidência empírica fraca e estrutura fatorial
  não replicada. Poderia entrar como camada declaradamente narrativa (junto de
  astrologia e numerologia), nunca como base psicométrica.
- **Escalas clínicas (MMPI, PID-5)** — inadequadas: medem psicopatologia, não
  personalidade normal, e não devem ser aplicadas fora de contexto clínico.

---

## 2. Camada astrológica

Os cálculos são astronomicamente corretos e testados; a interpretação é
simbólica.

**Efemérides.** Posições geocêntricas via
[`astronomy-engine`](https://github.com/cosinekitty/astronomy) (VSOP87/ELP),
rotacionadas para a **eclíptica verdadeira da data** (`Rotation_EQJ_ECT`), que é
o referencial da astrologia tropical. Validado contra efemérides publicadas para
2000-01-01 12:00 UT com tolerância de 0,05° em todos os dez corpos.

**Fuso horário.** O instante UTC do nascimento é resolvido a partir da hora
local e do fuso IANA usando a tz database do próprio runtime, o que honra as
regras históricas de horário de verão. Isso não é detalhe: um nascimento em
janeiro de 1994 em São Paulo estava em UTC-2, não UTC-3, e errar isso desloca o
Ascendente em ~15°. Há teste cobrindo exatamente esse caso.

**Ângulos e casas.** Ascendente e Meio-do-Céu por fórmula fechada; casas
intermediárias por **Placidus**, resolvidas por iteração de ponto fixo sobre a
relação de semi-arco (o MC está em AR = RAMC, o Ascendente em RAMC + (90 + DA), e
as cúspides 11/12 e 2/3 dividem esses arcos em terços). A formulação é
autoconsistente: fazer a fração valer 1 reproduz exatamente o Ascendente
calculado pela fórmula fechada, e no equador — onde a diferença ascensional se
anula — as cúspides caem em passos iguais de ascensão reta. Ambos viram teste.

Placidus é **genuinamente indefinido** acima dos círculos polares (o arco-seno
não tem solução). Nesse caso o sistema cai para **Signos Inteiros** e avisa, em
vez de emitir `NaN`.

**Nodo lunar.** Nodo Norte médio pela série de Meeus (*Astronomical Algorithms*,
cap. 47).

**Horário desconhecido.** Se o usuário não souber a hora, o sistema usa meio-dia
local, **desativa** Ascendente/MC/casas e avisa que a Lua pode variar ~6°. Ele
não finge precisão que não tem.

---

## 3. Camada numerológica

Numerologia pitagórica clássica (A=1…I=9, J=1…R=9, S=1…Z=8). Diacríticos do
português são reduzidos à letra base (JOSÉ → JOSE, GONÇALVES → GONCALVES),
conforme a prática brasileira.

Números calculados: Caminho de Vida, Expressão/Destino, Motivação (vogais),
Personalidade (consoantes), Dia Natalício, Maturidade, Equilíbrio, Ano Pessoal,
Lições Cármicas, Paixão Oculta, 4 Desafios, 4 Pináculos e Dívidas Cármicas
(13/14/16/19). Números mestres (11/22/33) são preservados na redução, exceto nos
desafios, onde por convenção sempre se reduz a um dígito.

**Regra do Y.** O Y conta como vogal apenas quando carrega o som vocálico — ou
seja, quando não é adjacente a outra vogal (SYLVIA → vogal; MAYA → consoante).
Regra documentada e testada, já que a convenção varia entre praticantes.

Uma invariante é testada explicitamente: vogais + consoantes devem sempre somar
exatamente o total da Expressão, para qualquer nome.

---

## 4. Integração com o Soulmon — o oráculo (`src/lib/oracle`)

Os quatro repositórios do ecossistema Soulmon (Soulmon, bestiário,
class-system, onboarding) foram lidos. Achados relevantes:

- O Soulmon **já tem** seu próprio motor de leitura mística
  (`src/utils/oracle.ts`): numerologia + zodíaco + horóscopo chinês/védico +
  quiz, pontuando 8 `ElementId` (água/fogo/terra/ar/sombra/luz/planta/
  industrial), 5 `RoleId` (suporte/tanque/físico/mágico/alcance) e 3
  `AlignmentId` (poder/harmonia/benevolência ≈ vírus/data/vacina). Este
  projeto duplicava parcialmente esse trabalho com um vocabulário próprio
  inventado — por isso ele foi removido (ver abaixo).
- O **bestiário** (`besti-rio-`) guarda milhares de criaturas em JSON estático
  com atributos numéricos (`forca/inteligencia/velocidade/magia`, 1-10) e tags
  categóricas por regex — sem pesos. Está marcado para correção (tags erradas,
  descrições poluídas) num repositório separado.
- O **class-system** tem 17 elementos base, 6 escolas, 5 recursos, 30 talentos
  e 29+ arquétipos emergentes, com uma API de distribuição manual de pontos
  (`investirElemento`/`investirEscola`/…) — mas nenhuma lógica automática que
  receba um input externo e distribua pontos sozinha.

Por decisão explícita: este projeto vai **substituir** o `oracle.ts` do
Soulmon, mas até esse novo oráculo estar pronto ele permanece aqui, não é
movido para o repositório do Soulmon.

### O que o oráculo faz

`generateOracleAxes()` (`src/lib/oracle/generate.ts`) recebe os traços 0-100
já computados (Big Five + HEXACO), os eixos junguianos, a distribuição de
elementos/polaridades do mapa astral e os números centrais da numerologia, e
devolve exatamente o formato que o `oracle.ts` do Soulmon já usa —
`ElementId`/`RoleId`/`AlignmentId`/`RealmId` — para ser um substituto
compatível. Cada fórmula é documentada e determinística (sem hash/RNG, porque
os inputs aqui já são contínuos, diferente das poucas categorias discretas que
o `oracle.ts` original lê). Exemplos:

- `terra`/`tanque` sobem com Conscienciosidade; `fogo`/`fisico` com
  Extroversão (faceta assertividade); `agua`/`suporte` com Amabilidade;
  `ar`/`magico` com Abertura + intuição junguiana (N).
- `sombra` sobe com Neuroticismo e Honestidade-Humildade baixa; `luz` sobe com
  Honestidade-Humildade alta.
- Reinos (`RealmId`) são função pura dos elementos, reaproveitando a tabela de
  pesos `REALM_WEIGHTS` do próprio `oracle.ts` — afinidade de bioma é
  geografia do mundo, não personalidade, então não há razão para recalculá-la.
- Uma ponte provisória para os 17 elementos do class-system copia os 6
  elementos com nome idêntico (`fogo água terra ar sombra luz`) e deixa os
  outros 11 (`eletricidade arcano vileza morte vida vigor marcial tempo som
  gravidade espaco`) com peso baixo e documentado como "não modelado" — eles
  não têm âncora nos dados atuais e não deveriam ser inventados.

### Por que o vocabulário de tags anterior foi removido

A primeira versão deste projeto tinha um vocabulário de tags inventado
(`fogo, terra, guardião, estrategista, vanguarda, soberano, precisão,
instável, explorador, criador, encantamento, caos, …`) espalhado pelos itens
do questionário, pelo mapa astral e pela numerologia, fundidos num
`mergedTags`. Depois de ler os três repos, ficou claro que metade desse
vocabulário não correspondia a nada real em nenhum sistema — era analogia,
não integração. Ele foi removido de `questions.ts`, `astrology/types.ts` e
`numerology.ts`, e substituído pelo oráculo acima, que usa **só** vocabulário
que já existe em pelo menos um dos repos do Soulmon.

---

## Limites honestos

- Autorrelato mede autoimagem, não comportamento. Escores altos de
  Conscienciosidade predizem menos do que se imagina sobre o que a pessoa faz.
- Este teste **não é validado**: os itens são originais e nunca passaram por
  análise fatorial, calibração de item ou normatização em amostra. Ele é
  construído *segundo* princípios psicométricos, o que não é a mesma coisa que
  ser um instrumento validado.
- Nada aqui serve para uso clínico, diagnóstico ou decisão de seleção.
- Astrologia e numerologia não têm validade preditiva. Estão aqui por serem
  geradores simbólicos ricos e determinísticos, e o código as pesa de acordo.

## 5. Pipeline completo de teste: onboarding → ficha → criatura (`src/lib/ficha.ts`)

Para poder testar o oráculo de ponta a ponta, `buildCreatureFicha()` liga as
peças acima a um resultado concreto:

1. **Ficha de personagem** (`src/lib/classSystem/`): `buildFicha()` distribui
   pontos em elementos/escolas/recurso/talentos a partir de `oracle`, usando
   o método do maior resto para que a soma bata exatamente com um orçamento.
   O class-system não define um orçamento inicial fixo (é um sistema de
   compra de pontos em aberto), então este projeto define um **orçamento de
   rookie** documentado (`ROOKIE_BUDGET`): 12 pts em elementos, 6 pts
   distribuídos entre escolas + 2 fixos em Evocação (para já poder capturar
   no primeiro dia), 3 pts no recurso do papel dominante, e 2 ranks entre os
   8 talentos sem pré-requisito. É uma convenção deste projeto, não uma regra
   do class-system — deve ser revista quando um sistema de evolução/nível
   real existir.
2. **Companheiro inicial**: a fórmula real de captura do class-system
   (`poderCaptura`/`avaliarCaptura`, copiada de `evocacao.ts`) roda contra o
   registro próprio de 26 criaturas do class-system (`criaturas.ts`, também
   copiado), então a ficha só "pega" uma criatura se realmente tiver afinidade
   elemental e pontos em Evocação suficientes — é mecânica de verdade, não
   só flavor.
3. **Criatura do bestiário**: `selectBestiaryCreature()` pontua um conjunto de
   candidatas pela combinação de elemento/reino/alinhamento/papel dominantes
   do oráculo, reduz para a faixa (`range`) de candidatas com pontuação mais
   próxima do máximo, e faz um sorteio com seed determinística (mesmo
   algoritmo `hashString`/`mulberry32` do `oracle.ts` do Soulmon) dentro dessa
   faixa — coerente com as respostas, mas com fator aleatório real. Usa uma
   cópia local, **corrigida**, do seed de 30 criaturas do `besti-rio-`
   (`biblioteca_bestiario.json`): a fonte original tem tags claramente erradas
   (ex.: "Cão" com `Elemental de Fogo`, "Pikachu" com `Planta`) e descrições
   com ruído de citação de wiki — corrigidas nesta cópia local, mas isso
   **não substitui** a limpeza real do repositório `besti-rio-`, que tem
   milhares de criaturas a mais e precisa de sua própria passada.
4. **Criatura rookie**: `generateRookieCreature()` usa o prompt-base real do
   Soulmon (`composeSpritePrompt`, copiado verbatim de `oracle.ts`) e os
   bancos de palavras reais (`NOUNS_BY_ELEMENT`, `ADJECTIVES_BY_ROLE`,
   `ADJECTIVES_BY_ELEMENT`, `ELEMENT_PALETTES`, `ALIGNMENT_ACCENT`,
   `ROOKIE_LOOK`), gerando nome, arquétipo, bio PT/EN e prompt de imagem —
   **só o estágio rookie**, como pedido. A criatura do bestiário entra como
   inspiração/semente (o mesmo papel que `favoriteCreature` já tem no
   onboarding do Soulmon), não como cópia. A máquina de família/fusão de
   ~2000 linhas que gera as 3 linhas de evolução (Vírus/Data/Vacina) do
   `oracle.ts` original **não foi portada** — fora de escopo para "só
   rookie".

Tudo é determinístico por usuário (mesma seed = mesmo resultado, seguindo a
mesma filosofia do `oracle.ts`), verificado com 23 testes novos cobrindo: os
orçamentos batendo exatamente, a matemática de captura (afinidade E Evocação,
não uma OU outra), a faixa+aleatoriedade da seleção do bestiário (tendência
correta, não determinismo absoluto), e o pipeline inteiro sobrevivendo a
serialização JSON.
