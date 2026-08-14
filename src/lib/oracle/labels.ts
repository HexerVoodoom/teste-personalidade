import { AlignmentId, ElementId, RealmId, RoleId } from "./types";

/** Display names, mirroring Soulmon's `ELEMENT_INFO`/`ROLE_INFO`/etc. so the
 *  two projects read the same when shown side by side. */
export const elementLabels: Record<ElementId, { name: string; emoji: string }> = {
  agua: { name: "Água", emoji: "💧" },
  fogo: { name: "Fogo", emoji: "🔥" },
  terra: { name: "Terra", emoji: "⛰️" },
  ar: { name: "Ar", emoji: "🌪️" },
  sombra: { name: "Sombra", emoji: "🌑" },
  luz: { name: "Luz", emoji: "✨" },
  planta: { name: "Planta", emoji: "🌿" },
  industrial: { name: "Industrial", emoji: "⚙️" },
};

export const roleLabels: Record<RoleId, { name: string; emoji: string }> = {
  suporte: { name: "Suporte", emoji: "💖" },
  tanque: { name: "Tanque", emoji: "🛡️" },
  fisico: { name: "Dano físico", emoji: "⚔️" },
  magico: { name: "Dano mágico", emoji: "🔮" },
  alcance: { name: "Longo alcance", emoji: "🏹" },
};

export const alignmentLabels: Record<AlignmentId, { name: string; emoji: string }> = {
  poder: { name: "Poder", emoji: "👑" },
  harmonia: { name: "Harmonia", emoji: "☯️" },
  benevolencia: { name: "Benevolência", emoji: "🕊️" },
};

export const realmLabels: Record<RealmId, { name: string; emoji: string }> = {
  deserto: { name: "Deserto Árido", emoji: "🏜️" },
  picos: { name: "Picos Tempestuosos", emoji: "🌩️" },
  oceano: { name: "Oceano Profundo", emoji: "🌊" },
  pantano: { name: "Pântanos Mortais", emoji: "🦠" },
  floresta: { name: "Floresta Selvagem", emoji: "🌲" },
  cavernas: { name: "Cavernas Rochosas", emoji: "🪨" },
  gelo: { name: "Desertos Gelados", emoji: "🧊" },
  campina: { name: "Campina Serena", emoji: "🌼" },
  akasha: { name: "Reino de Akasha", emoji: "🌗" },
};
