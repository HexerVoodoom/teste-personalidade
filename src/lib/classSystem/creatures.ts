/**
 * Registro de criaturas capturáveis — vem do **repositório real** do
 * class-system, não de uma cópia.
 *
 * Este arquivo já foi 32 entradas copiadas à mão ("copied verbatim from
 * class-system/src/registry/criaturas.ts"). O registro real cresceu desde
 * então, e a cópia não acompanhou — que é exatamente o que uma cópia faz.
 *
 * É contra ESTE registro que `poderCaptura`/`avaliarCaptura` (`./capture.ts`)
 * operam. Ele é pequeno e mecanicamente real, e não se confunde com o
 * bestiário grande do `besti-rio-`, que é outra coisa: inspiração visual, não
 * mecânica de captura.
 */
export { CRIATURAS, FAMILIAS, criaturas } from 'class-system';
export type { CriaturaDef, FamiliaCriatura } from 'class-system';
