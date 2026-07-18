import type { StoryAccentCode } from "@/lib/story-accent";

/**
 * Few-shots: fantasía natural, frases cortas, oral colombiano, humor local.
 * Fragmentos reales extraídos del corpus semilla curado (Fase 2 del plan de trabajo),
 * revisados contra biblia-editorial.md §6 antes de publicarse aquí.
 */
type FewShotSet = {
  opening: string;
  dialogue: string;
  adventure: string;
  source: string; // slug del cuento de origen, para trazabilidad
};

const JOAQUIN: FewShotSet = {
  source: "joaquin-el-rincon-oscuro",
  opening: `Había una vez un niño llamado Joaquín que vivía en un apartamento con olor a café y a libros viejos. Esa noche, el pasillo largo se convirtió en el Reino del Rincón Oscuro, un lugar donde las sombras bailaban como fantasmas. Joaquín tenía una misión: recuperar el Peluche Perdido que se había quedado atrapado detrás del armario grande.`,
  dialogue: `—Tranquilo, Rocky —susurró Joaquín.
—¡Qué sombra tan mensa! —dijo Rocky, ladrándole a la pared—. ¡Solo es el perchero de papá con los abrigos!
Joaquín miró bien. Rocky tenía razón. La sombra era un malentendido de la luz.`,
  adventure: `De repente, desde la cocina, se escuchó la voz de mamá.
—Joaquín, ¿estás bien? ¿Necesitas ayuda con el rincón?
La voz subía por el pasillo junto con un olorcito a chocolate caliente. Joaquín sonrió, iluminando el camino de vuelta con su linterna. Ya no había monstruos, solo el pasillo de su casa.

Y colorín colorado, este cuento se ha terminado.`,
};

const CAPERUCITA: FewShotSet = {
  source: "caperucita-el-camino-del-mandado",
  opening: `Había una vez una niña llamada Rafaela que vivía en una casa con olor a leña y café recién colado. Esa mañana, su abuela le encargó un mandado real: llevarle un plato de caldo a la vecina, que llevaba dos días en cama con gripa. Era la primera vez que Rafaela cruzaba la vereda ella sola. Apenas puso el pie en el camino de tierra, los árboles crecieron altísimos a su alrededor, y el sendero se convirtió en el Bosque del Rumor.`,
  dialogue: `—¿Es usted el guardián de este camino? —preguntó ella.
El zorro, que esperaba una pelea, se quedó tieso. Pensó que le habían preguntado por un "camión" de carga que pasaba cerca.
—¿Un camión? ¡Aquí no hay ninguna mula de carga, niña! —respondió el zorro muy confundido.`,
  adventure: `El bosque, poco a poco, volvió a ser el camino de tierra de siempre. Rafaela tocó la puerta de la vecina con el plato todavía caliente entre las manos.
—Gracias, mi niña, qué caldo tan rico —dijo la vecina desde su cama, con una sonrisa débil pero agradecida.
Rafaela caminó de regreso, sintiendo el sol de la tarde en la espalda. Su abuela la esperaba sentada en el andén, y Rafaela se sentó a su lado a contarle el camino, sin perderse ni un detalle.

Y colorín colorado, este cuento se ha terminado.`,
};

const RICITOS: FewShotSet = {
  source: "ricitos-las-cosas-prestadas",
  opening: `Había una vez una niña llamada Renata que vivía en una casita rodeada de cafetales. Esa tarde, su mamá había dejado tres platos de dulce enfriándose en la ventana, con la advertencia de no tocarlos hasta después de la comida. Renata tenía hambre, y en vez de esperar o preguntar, salió a caminar por la vereda para no pensar en ellos. Apenas pisó el camino de tierra, los cafetales crecieron altísimos, y la vereda se convirtió en la Vereda de las Mil Delicias.`,
  dialogue: `—Señores Osos, qué pena con ustedes —dijo Renata, hablando bonito—. Tomé sus cosas sin preguntar.
Los osos la miraron con calma.
—Si hablas bonito, las cosas saben mejor —dijo Oso Grande.`,
  adventure: `Desde el camino, se escuchó el silbido corto que su mamá usaba para llamarla a comer.
—¡Renata, ven a casa a terminar la tarea!
Renata reconoció el silbido enseguida. Al llegar, vio los tres platos de dulce todavía en la ventana, esperándola. Esta vez se sentó en el andén a esperar a que su mamá se los ofreciera.

Y colorín colorado, este cuento se ha terminado.`,
};

const CERDITOS: FewShotSet = {
  source: "cerditos-la-torre-bien-hecha",
  opening: `Había una vez una niña llamada Mariana que vivía en un apartamento donde el piso siempre estaba fresco bajo los pies descalzos. Esa tarde, su habitación se transformó en la Ciudad de Ladrillia, un reino donde las piezas de Lego eran las piedras de construcción más valiosas del mundo. Mariana era la Gran Arquitecta y su misión era clara: construir una muralla firme para proteger a los ciudadanos de plástico antes de que cayera el sol.`,
  dialogue: `—Mariana, ¿vas bien? Estas piezas encajan mejor si no las apuras —dijo su papá.
Él le dio un pocillo con agua y se sentó en el piso junto a ella, sin prisa.`,
  adventure: `Mariana contempló su obra. Los ciudadanos de plástico estaban protegidos en sus torres bien puestas, lejos del caos de antes. Ya no había prisa, solo la satisfacción de haber hecho el trabajo como debía ser, con cada pieza en su sitio. Mariana sonrió, escuchando el silencio tranquilo de su habitación que ahora parecía un verdadero palacio.

Colorín colorado, este cuento se ha terminado.`,
};

const TOMAS: FewShotSet = {
  source: "tomas-el-espejo-de-los-ecos",
  opening: `Había una vez un niño llamado Tomás que todos los sábados visitaba la casa de sus abuelos, donde siempre olía a leña recién prendida. Esa tarde llegó con su tablet en la mano, sin querer soltarla ni un segundo.`,
  dialogue: `—Se está apagando —dijo el niño—. Por favor, ayúdame a encenderlo.
Tomás miró su espejo. Era muy brillante. El farol se veía aburrido.`,
  adventure: `Los árboles se convirtieron de nuevo en las sillas del comedor. La tablet estaba sobre la mesa, oscura y callada. Tomás la dejó ahí. Se acercó a la abuela Lola.
—¿Ya están las arepas? —preguntó.
La abuela le dio un abrazo con olor a leña y maíz. Tomás cerró los ojos un segundo, oliendo el maíz tostado, y no pensó en la tablet ni una sola vez mientras comían las arepas calientes.

Y colorín colorado, este cuento se ha terminado.`,
};

// Rotación: variedad genuina en cada generación en vez de un único ejemplo fijo.
const NEUTRO_POOL: FewShotSet[] = [JOAQUIN, CAPERUCITA, RICITOS, CERDITOS, TOMAS];

function pickNeutroExample(): FewShotSet {
  return NEUTRO_POOL[Math.floor(Math.random() * NEUTRO_POOL.length)];
}

// Acentos regionales: sin curaduría propia todavía. Caen a neutro (rotado)
// en vez de usar contenido de plantilla genérica sin trazabilidad a un cuento real.
// TODO Fase futura: curar versiones dialectales reales de estos 4 cuentos.

const BY_ACCENT: Record<StoryAccentCode, () => FewShotSet> = {
  neutro: pickNeutroExample,
  bogota_rolo: pickNeutroExample,
  bogota_ninos: pickNeutroExample,
  bogota_cachaco: pickNeutroExample,
};

export function buildFewShotBlock(accentCode: StoryAccentCode): string {
  const ex = BY_ACCENT[accentCode]();
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
