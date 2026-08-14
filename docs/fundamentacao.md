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

## 4. Integração com o Soulmon

Este projeto **não depende** dos repositórios do Soulmon (bestiário,
class-system, prompt base/onboarding), que não estavam disponíveis quando ele
foi escrito. O contrato de saída já existe e está estável:

- `SoulProfile.psychometric.traitPoints` — mapa flat 0-100 por traço e por eixo
  junguiano. É o candidato natural para popular pontos no class-system.
- `SoulProfile.mergedTags` — ranking de tags já fundido entre as três camadas,
  com o peso e as camadas de origem de cada tag. É o candidato natural para
  selecionar a criatura no bestiário.
- Cada camada também expõe seu `tagWeights` bruto, caso a fusão precise ser
  refeita com outros pesos.

O vocabulário de tags atual (`fogo`, `terra`, `guardião`, `estrategista`, …) é
**provisório e existe para ser substituído**. O próximo passo é ler as tags
reais do bestiário e do class-system e trocar o vocabulário, mantendo a
mecânica de fusão — que já está testada e é agnóstica ao vocabulário.

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
