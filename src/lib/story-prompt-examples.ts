import type { StoryAccentCode } from "@/lib/story-accent";

/**
 * Few-shots: fantasía natural, frases cortas, oral colombiano, humor local.
 */
type FewShotSet = {
  opening: string;
  dialogue: string;
  adventure: string;
};

const NEUTRO_EXAMPLES: FewShotSet = {
  opening: `Había una vez un bosque llamado Bosque de la Nuez. Ahí Pedrito era capitán de los mensajeros. Su trabajo era llevar cartas de un árbol a otro sin que el viento se las robe. Con él iban su hermano y sus papás.`,
  dialogue: `—Pedrito —dijo papá—, antes de la ronda de la noche toca el plato de brócoli.
—En el bosque le decimos Florecitas Verdes —sonrió mamá—. Saben un poquito amargas.
—Hago la cara rara, pero me las como —dijo Pedrito.`,
  adventure: `Una carta se le escapó. ¡El viento!
Pedrito corrió. Tropezó. Casi se va de cara.
—¡Qué capitán tan menso! —dijo una ardilla.
Iba la bruja del cerro en escoba último modelo y, en la curva, contra un poste.
—Qué bruja tan mensa —dijo Pedrito, y siguió.
Alcanzó el mapa. Volvió. Se comió el brócoli sin discurso.

Y colorín colorado, este cuento se ha terminado.`,
};

const BOGOTA_ROLO_EXAMPLES: FewShotSet = {
  opening: `Había una vez una ciudad llamada Zigzag. Nico era capitán de un equipo que encontraba mapas. Su trabajo era claro: si el mapa se pierde, lo busca. Con él iba su familia.`,
  dialogue: `—Parce, pilas —dijo papá—: esta noche el mapa se duerme temprano.
—¿Aunque falte un callejón? —preguntó Nico.
—Aunque falte —guiñó mamá.`,
  adventure: `El villano llegó en moto “última generación”. En la curva… ¡pam! Contra un poste.
—Qué boleta —dijo Nico.
Alguien habló de unos burros en la esquina.
—¿Me hablaban? —preguntó Nico, serio.
Se rieron. Nico agarró el mapa al segundo intento.

Y colorín colorado, este cuento se ha terminado.`,
};

const BOGOTA_NINOS_EXAMPLES: FewShotSet = {
  opening: NEUTRO_EXAMPLES.opening,
  dialogue: BOGOTA_ROLO_EXAMPLES.dialogue,
  adventure: BOGOTA_ROLO_EXAMPLES.adventure,
};

const BOGOTA_CACHACO_EXAMPLES: FewShotSet = {
  opening: BOGOTA_ROLO_EXAMPLES.opening,
  dialogue: `—Listo, chino —dijo papá—: toca el plato y luego la ronda.
—Ah carachas —murmuró Nico—. ¿Tan pronto?
—Sin pelafustear —sonrió mamá.`,
  adventure: `La bruja iba en escoba último modelo. En la curva, de cara al poste.
—Qué mensa —dijo Nico.
Luego pararon: arepa y dos empanadas. Nico terminó la misión del mapa.

Y colorín colorado, este cuento se ha terminado.`,
};

const BY_ACCENT: Record<StoryAccentCode, FewShotSet> = {
  neutro: NEUTRO_EXAMPLES,
  bogota_rolo: BOGOTA_ROLO_EXAMPLES,
  bogota_ninos: BOGOTA_NINOS_EXAMPLES,
  bogota_cachaco: BOGOTA_CACHACO_EXAMPLES,
};

export function buildFewShotBlock(accentCode: StoryAccentCode): string {
  const ex = BY_ACCENT[accentCode];
  return [
    "Estilo de referencia (NO copies trama; imita frases cortas + misión clara + oral colombiano):",
    "",
    "Apertura: nombre con gancho + trabajo dibujable (no poesía, no sala/TV):",
    ex.opening,
    "",
    "Diálogo oral:",
    ex.dialogue,
    "",
    "Aventura corta + 1 humor local; cierra con colorín colorado:",
    ex.adventure,
  ].join("\n");
}
