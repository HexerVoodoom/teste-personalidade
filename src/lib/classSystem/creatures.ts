import { CriaturaDef, ElementoBaseId, FamiliaCriatura } from "./types";

/**
 * Copied verbatim from `class-system/src/registry/criaturas.ts` — the
 * class-system's own small (26-entry), mechanically-real capturable-creature
 * registry, distinct from the large external besti-rio- bestiary. This is
 * the registry `poderCaptura`/`avaliarCaptura` (in `./capture.ts`) actually
 * operate against.
 */
function c(
  id: string, nome: string, familia: FamiliaCriatura,
  afinidades: ElementoBaseId[], poderBase: number, descricao: string
): CriaturaDef {
  return { id, nome, familia, afinidades, poderBase, descricao };
}

export const CRIATURAS: Record<string, CriaturaDef> = Object.fromEntries(
  [
    c("lobo", "Lobo Cinzento", "besta", ["vida", "vigor"], 24, "Caçador de matilha, rápido e leal."),
    c("urso", "Urso das Cavernas", "besta", ["vida", "vigor"], 42, "Força bruta e resistência."),
    c("felino", "Pantera Sombria", "besta", ["vida", "sombra"], 38, "Predador furtivo das florestas escuras."),
    c("javali", "Javali de Presa", "besta", ["vigor", "terra"], 30, "Investida imparável."),
    c("falcao", "Falcão Real", "ave", ["ar", "vida"], 26, "Olhos aguçados e mergulho veloz."),
    c("coruja", "Coruja Arcana", "ave", ["ar", "arcano"], 34, "Voa em silêncio; sente magia."),
    c("serpente_marinha", "Serpente Marinha", "aquatica", ["agua"], 48, "Constritora das correntes profundas."),
    c("tubarao", "Tubarão Abissal", "aquatica", ["agua", "sombra"], 52, "Frenesi das profundezas."),
    c("salamandra", "Salamandra", "ignea", ["fogo"], 30, "Lagarto que trilha em brasa."),
    c("cao_de_lava", "Cão de Lava", "ignea", ["fogo", "terra"], 46, "Matilha incandescente."),
    c("fenix_menor", "Fênix Menor", "ignea", ["fogo", "vida"], 72, "Renasce das próprias cinzas."),
    c("ghoul", "Ghoul", "morto_vivo", ["morte"], 28, "Devorador de cadáveres."),
    c("cavaleiro_morto", "Cavaleiro Morto", "morto_vivo", ["morte", "marcial"], 58, "Guerreiro que a morte não deteve."),
    c("sombra_rastejante", "Sombra Rastejante", "aberracao", ["sombra"], 32, "Vulto que se cola às paredes."),
    c("olho_vil", "Olho Vil", "aberracao", ["vileza", "arcano"], 50, "Muitos olhos, muitas maldições."),
    c("trevo_carnivoro", "Trevo Carnívoro", "planta", ["vida", "terra"], 22, "Devora o incauto que se aproxima."),
    c("ent", "Ent Ancião", "planta", ["vida", "terra"], 64, "Guardião centenário da floresta."),
    c("fada", "Fada Cintilante", "espirito", ["arcano", "luz"], 26, "Pequena, veloz e travessa."),
    c("anjo_menor", "Anjo Menor", "espirito", ["luz"], 68, "Mensageiro radiante."),
    c("espectro", "Espectro Errante", "espirito", ["morte", "arcano"], 44, "Alma presa entre mundos."),
    c("golem_pedra", "Golem de Pedra", "construto", ["terra"], 54, "Muralha que anda."),
    c("automato", "Autômato Voltaico", "construto", ["eletricidade", "marcial"], 60, "Engenho movido a raios."),
    c("imp", "Imp", "demonio", ["vileza"], 30, "Pequeno demônio zombeteiro."),
    c("demonio_maior", "Demônio Maior", "demonio", ["vileza", "fogo"], 80, "Pactos são selados com sangue."),
    c("wyvern", "Wyvern", "draconico", ["ar", "fogo"], 90, "Primo alado dos dragões."),
    c("dragao_jovem", "Dragão Jovem", "draconico", ["fogo", "arcano"], 120, "Ainda jovem — e já aterrador."),
  ].map((def) => [def.id, def])
);
