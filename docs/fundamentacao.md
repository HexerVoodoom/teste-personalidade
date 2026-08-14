# Fundamentação teórica

Este teste combina dois modelos com base empírica consolidada em psicologia:

## 1. Big Five / Modelo dos Cinco Grandes Fatores (OCEAN)
Modelo dimensional com o maior corpo de evidência psicométrica e validação
transcultural entre os instrumentos de personalidade.

- Costa, P. T., & McCrae, R. R. (1992). *Revised NEO Personality Inventory
  (NEO-PI-R) and NEO Five-Factor Inventory (NEO-FFI) manual.*
- Goldberg, L. R. (1993). The structure of phenotypic personality traits.
  *American Psychologist, 48*(1), 26–34.
- Goldberg, L. R. et al. (2006). The International Personality Item Pool
  (IPIP) — banco de itens público usado como referência de estilo para a
  redação dos itens deste teste (os itens em si são originais).

Traços medidos: Abertura à experiência, Conscienciosidade, Extroversão,
Amabilidade, Neuroticismo — cada um com 3 facetas simplificadas e 2 itens
por faceta (1 direto + 1 invertido) para reduzir viés de aquiescência.

## 2. Tipologia junguiana (eixos ao estilo MBTI)
Fundamentada na teoria de tipos psicológicos de Carl Jung, operacionalizada
por instrumentos de tipologia:

- Jung, C. G. (1921). *Psychological Types.*
- Myers, I. B., & Myers, P. B. (1980). *Gifts Differing: Understanding
  Personality Type.*

Eixos medidos: Extroversão–Introversão (EI), Sensação–Intuição (SN),
Pensamento–Sentimento (TF), Julgamento–Percepção (JP), compostos em um
código de 4 letras (ex.: INFJ).

Observação: a tipologia junguiana é popular e usada aqui como camada
complementar de "sabor"/narrativa, mas tem evidência psicométrica mais
fraca que o Big Five (medidas categóricas, baixa estabilidade teste-reteste
em alguns eixos). Por isso o Big Five é o motor principal de pontuação, e
os eixos junguianos servem como camada narrativa e de tags adicionais.

## Outras referências consideradas (não incluídas na v1)
- HEXACO (Lee & Ashton, 2004) — adiciona o fator Honestidade-Humildade.
  Candidato natural para uma v2, útil para tags de "moralidade"/"lealdade"
  de criaturas.
- Eneagrama — popular, mas evidência empírica fraca; poderia ser oferecido
  como camada opcional/narrativa, nunca como base científica do sistema.

## Arquitetura pensada para integração futura (Soulmon)
Este projeto foi escrito como serviço/lib isolada e não depende dos
projetos Soulmon (bestiário e class-system), pois eles não estavam
disponíveis nesta sessão. Para deixar a integração fácil depois:

- `src/lib/personality/types.ts` define `PersonalityProfile`, que já
  expõe `traitPoints` (mapa flat de pontos 0-100 por dimensão) — pensado
  como o contrato de exportação para popular pontos no class-system.
- `Question.tags` e `TraitScore.tags` carregam uma taxonomia provisória
  de arquétipos (elemento/papel, ex.: `"fogo"`, `"suporte"`,
  `"estrategista"`) que deve ser **substituída** pelas tags reais do
  bestiário assim que os repositórios do Soulmon (evolução, prompt base,
  onboarding, bestiário, class-system) forem lidos.
- `PersonalityProfile.dominantTags` já resume as tags mais fortes do
  usuário — é o candidato natural para alimentar a escolha de criatura.

Próximo passo sugerido: anexar os repositórios do Soulmon e escrever um
mapeador `traitPoints/dominantTags -> pontos do bestiário/class-system`
em vez de reinventar a taxonomia de tags aqui.
