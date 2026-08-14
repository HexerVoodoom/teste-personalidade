export type BestiaryTamanho = "Miúdo" | "Pequeno" | "Médio" | "Grande" | "Enorme" | "Colossal";

export interface BestiaryCreature {
  nome: string;
  origem: string;
  descricao: string;
  bioma: string[];
  tamanho: BestiaryTamanho;
  hostilidade: number;
  tags: string[];
}

/**
 * Curated, trimmed copy of `besti-rio-`'s 30-entry seed
 * (`biblioteca_bestiario.json`), used here as a stand-in until that
 * repository's real cleanup happens (tags there are known-wrong in places —
 * e.g. the source data tags "Cão" with `Elemental de Fogo` and "Pikachu"
 * with `Planta`, both clearly autoTagger false positives). Corrections made
 * for this local copy:
 *
 * - Dropped tags with no textual basis in the creature's own description
 *   (Cão's "Elemental de Fogo", Pikachu/Rathalos/Owlbear/Chocobo/Agumon's
 *   stray "Planta", Dragão-azul's duplicate "Elemental de Fogo").
 * - Trimmed descriptions to one clean sentence — the source data carries
 *   verbatim wiki paragraphs with citation noise ("[Fonte: ...]").
 *
 * This is a local fix for a 30-item demo sample, not a substitute for
 * cleaning the real repository (`besti-rio-`), which has thousands more
 * entries and needs its own pass.
 */
export const BESTIARY_SEED: BestiaryCreature[] = [
  { nome: "Murloc", origem: "Warcraft", descricao: "Humanoide anfíbio costeiro que vive em bandos barulhentos.", bioma: ["Costeiro", "Pântano"], tamanho: "Pequeno", hostilidade: 7, tags: ["Anfíbio", "Humanóide"] },
  { nome: "Deathwing (Asa da Morte)", origem: "Warcraft", descricao: "Dragão corrompido pelo fogo elemental, cataclismo em forma de besta.", bioma: ["Vulcão", "Céus"], tamanho: "Colossal", hostilidade: 10, tags: ["Elemental de Lava", "Elemental de Fogo", "Dragão", "Alado", "Morto-vivo"] },
  { nome: "Pikachu", origem: "Pokemon", descricao: "Roedor elétrico de bochechas armazenadoras de energia.", bioma: ["Floresta", "Urbano"], tamanho: "Pequeno", hostilidade: 3, tags: ["Elemental Elétrico", "Mamífero"] },
  { nome: "Charizard", origem: "Pokemon", descricao: "Réptil alado que cospe fogo e habita regiões vulcânicas.", bioma: ["Vulcão", "Montanha"], tamanho: "Grande", hostilidade: 6, tags: ["Elemental de Fogo", "Alado", "Réptil"] },
  { nome: "Agumon", origem: "Digimon", descricao: "Pequeno réptil digital de chama laranja na cauda.", bioma: ["Mundo Digital", "Floresta"], tamanho: "Pequeno", hostilidade: 4, tags: ["Elemental de Fogo", "Réptil"] },
  { nome: "Chocobo", origem: "Final Fantasy", descricao: "Ave gigante domesticável, veloz e leal a quem a monta.", bioma: ["Planície", "Floresta"], tamanho: "Grande", hostilidade: 2, tags: ["Alado"] },
  { nome: "Tonberry", origem: "Final Fantasy", descricao: "Humanoide encapuzado, lento mas letal, que guarda rancor eterno.", bioma: ["Caverna", "Ruínas"], tamanho: "Pequeno", hostilidade: 9, tags: ["Humanóide"] },
  { nome: "Rathalos", origem: "Monster Hunter", descricao: "Wyvern-rei alado que domina o céu sobre seu território.", bioma: ["Floresta", "Montanha", "Vulcão"], tamanho: "Enorme", hostilidade: 8, tags: ["Dragão", "Alado", "Réptil"] },
  { nome: "Zergling", origem: "Starcraft", descricao: "Inseto de enxame, rápido e descartável, ataca em matilha.", bioma: ["Qualquer"], tamanho: "Pequeno", hostilidade: 10, tags: ["Inseto/Aracnídeo"] },
  { nome: "Balrog", origem: "Lord of the Rings", descricao: "Demônio de fogo e sombra das profundezas da terra.", bioma: ["Subterrâneo", "Caverna"], tamanho: "Enorme", hostilidade: 10, tags: ["Elemental de Fogo", "Elemental Sombrio", "Demônio"] },
  { nome: "Beholder", origem: "Dungeons & Dragons", descricao: "Aberração flutuante coberta de olhos, cada um com um poder mágico.", bioma: ["Subterrâneo", "Caverna"], tamanho: "Grande", hostilidade: 9, tags: ["Alienígena/Cósmico"] },
  { nome: "Owlbear (Urso-Coruja)", origem: "Dungeons & Dragons", descricao: "Cruza a fúria de um urso com os sentidos de uma coruja.", bioma: ["Floresta"], tamanho: "Grande", hostilidade: 8, tags: ["Besta/Fera", "Alado"] },
  { nome: "Dragão Vermelho (Ancião)", origem: "Dungeons & Dragons", descricao: "O mais ganancioso e orgulhoso dos dragões cromáticos.", bioma: ["Vulcão", "Montanha"], tamanho: "Colossal", hostilidade: 10, tags: ["Elemental de Fogo", "Dragão", "Réptil", "Alado"] },
  { nome: "Mind Flayer (Illithid)", origem: "Dungeons & Dragons", descricao: "Aberração psiônica de outro plano, devoradora de mentes.", bioma: ["Subterrâneo", "Submundo"], tamanho: "Médio", hostilidade: 9, tags: ["Elemental Sombrio", "Alienígena/Cósmico", "Humanóide"] },
  { nome: "Mimic (Mímico)", origem: "Dungeons & Dragons", descricao: "Predador que se disfarça de objeto inofensivo à espera de presas.", bioma: ["Ruínas", "Caverna", "Masmorra"], tamanho: "Médio", hostilidade: 8, tags: ["Geleia/Slime"] },
  { nome: "Gelatinous Cube (Cubo Gelatinoso)", origem: "Dungeons & Dragons", descricao: "Massa gelatinosa translúcida que dissolve tudo em seu caminho.", bioma: ["Masmorra", "Subterrâneo"], tamanho: "Grande", hostilidade: 7, tags: ["Geleia/Slime"] },
  { nome: "Tarrasque", origem: "Dungeons & Dragons", descricao: "Praga lendária capaz de devastar reinos inteiros sozinha.", bioma: ["Qualquer"], tamanho: "Colossal", hostilidade: 10, tags: ["Gigante/Titã", "Réptil"] },
  { nome: "Displacer Beast (Pantera Deslocadora)", origem: "Dungeons & Dragons", descricao: "Felino sombrio cuja imagem real fica sempre deslocada da visível.", bioma: ["Floresta", "Pântano"], tamanho: "Grande", hostilidade: 8, tags: ["Elemental Sombrio", "Besta/Fera"] },
  { nome: "Cão (Canis lupus familiaris)", origem: "Real Fauna", descricao: "Companheiro leal domesticado há milênios.", bioma: ["Urbano", "Planície"], tamanho: "Pequeno", hostilidade: 2, tags: ["Besta/Fera", "Mamífero"] },
  { nome: "Elefante Africano", origem: "Real Fauna", descricao: "O maior mamífero terrestre, memória e laços sociais fortes.", bioma: ["Savana"], tamanho: "Enorme", hostilidade: 4, tags: ["Mamífero"] },
  { nome: "Urso-d'água (Tardígrado)", origem: "Real Fauna", descricao: "Microanimal quase indestrutível, sobrevive ao vácuo do espaço.", bioma: ["Musgos", "Água", "Espaço"], tamanho: "Miúdo", hostilidade: 1, tags: ["Elemental de Água"] },
  { nome: "Axolote (Ambystoma mexicanum)", origem: "Real Fauna", descricao: "Salamandra aquática que nunca perde suas guelras externas.", bioma: ["Rios", "Lagos"], tamanho: "Pequeno", hostilidade: 1, tags: ["Elemental de Água", "Anfíbio"] },
  { nome: "Dragão-azul (Glaucus atlanticus)", origem: "Real Fauna", descricao: "Lesma-do-mar iridescente que flutua de barriga para cima.", bioma: ["Oceano"], tamanho: "Miúdo", hostilidade: 5, tags: ["Elemental de Água"] },
  { nome: "Peixe-gota (Blobfish)", origem: "Real Fauna", descricao: "Peixe de águas profundas, gelatinoso pela baixa pressão do habitat.", bioma: ["Abissal"], tamanho: "Pequeno", hostilidade: 1, tags: ["Elemental de Água", "Aquático"] },
  { nome: "Ocapi (Okapia johnstoni)", origem: "Real Fauna", descricao: "Parente florestal e solitário da girafa, listrado como uma zebra.", bioma: ["Floresta"], tamanho: "Grande", hostilidade: 2, tags: ["Mamífero"] },
  { nome: "Carvalho Sagrado (Quercus)", origem: "Real Flora", descricao: "Árvore centenária venerada em tradições ao redor do mundo.", bioma: ["Floresta", "Planície"], tamanho: "Enorme", hostilidade: 1, tags: ["Planta"] },
  { nome: "Sakura (Cerejeira)", origem: "Real Flora", descricao: "Árvore de flores rosadas efêmeras, símbolo de renovação.", bioma: ["Floresta", "Urbano"], tamanho: "Grande", hostilidade: 1, tags: ["Planta"] },
  { nome: "Flor-cadáver (Rafflesia arnoldii)", origem: "Real Flora", descricao: "A maior flor do mundo, cheira a carne podre para atrair polinizadores.", bioma: ["Floresta Tropical"], tamanho: "Pequeno", hostilidade: 3, tags: ["Planta"] },
  { nome: "Sangue-de-dragão (Dracaena cinnabari)", origem: "Real Flora", descricao: "Árvore de copa em guarda-chuva que sangra resina vermelha.", bioma: ["Deserto", "Montanha"], tamanho: "Grande", hostilidade: 1, tags: ["Planta"] },
  { nome: "Welwitschia mirabilis", origem: "Real Flora", descricao: "Planta do deserto namibiano que vive por mais de mil anos.", bioma: ["Deserto"], tamanho: "Médio", hostilidade: 1, tags: ["Planta"] },
];
