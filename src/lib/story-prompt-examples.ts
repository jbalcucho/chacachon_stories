import type { StoryAccentCode } from "@/lib/story-accent";

/**
 * Few-shots: fantasía natural, frases cortas, oral colombiano, humor local.
 */
type FewShotSet = {
  opening: string;
  dialogue: string;
  adventure: string;
};

// Fragmentos reales extraídos del corpus semilla curado (cuentos/joaquin-el-rincon-oscuro.md),
// el mejor puntuado (100/100) de la primera camada — Fase 2 del plan de trabajo.
const NEUTRO_EXAMPLES: FewShotSet = {
  opening: `Había una vez un niño llamado Joaquín que vivía en un apartamento con olor a café y a libros viejos. Esa noche, el pasillo largo se convirtió en el Reino del Rincón Oscuro, un lugar donde las sombras bailaban como fantasmas. Joaquín tenía una misión: recuperar el Peluche Perdido que se había quedado atrapado detrás del armario grande.`,
  dialogue: `—Tranquilo, Rocky —susurró Joaquín.
—¡Qué sombra tan mensa! —dijo Rocky, ladrándole a la pared—. ¡Solo es el perchero de papá con los abrigos!
Joaquín miró bien. Rocky tenía razón. La sombra era un malentendido de la luz.`,
  adventure: `De repente, desde la cocina, se escuchó la voz de mamá.
—Joaquín, ¿estás bien? ¿Necesitas ayuda con el rincón?
Era la misma voz de siempre, la que lo llamaba a merendar o a ponerse el saco. Joaquín sonrió, iluminando el camino de vuelta con su linterna. Ya no había monstruos, solo el pasillo de su casa.

Y colorín colorado, este cuento se ha terminado.`,
};

// Apertura real extraída de cuentos/isabella-el-valle-de-los-ecos.md (corpus semilla, Fase 2).
const BOGOTA_ROLO_EXAMPLES: FewShotSet = {
  opening: `Había una vez una niña llamada Isabella que vivía en un apartamento con ventanas altas que daban a los tejados de la ciudad. Una tarde, su tablet se iluminó con un resplandor extraño y, de repente, la sala se transformó. Las paredes se cubrieron de enredaderas luminosas y el piso se convirtió en el Valle de los Ecos Perdidos.`,
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
