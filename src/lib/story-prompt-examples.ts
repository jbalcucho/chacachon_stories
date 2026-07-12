import type { StoryAccentCode } from "@/lib/story-accent";

/**
 * Fragmentos de cuentos curados como few-shot para imitar tono y ritmo.
 * Fuente: cuentos/*.md — versiones neutras o por acento según corresponda.
 * Ampliar al refinar cada cuento publicado (docs/biblia-editorial.md §10).
 *
 * Importante: no uses «Chacachón» como personaje en estos ejemplos
 * (el lector del trial no conoce la marca).
 */
type FewShotSet = {
  opening: string;
  dialogue: string;
  /** Modelado de regulación emocional visible (biblia §1.3). */
  regulation: string;
};

const REGULATION_EXAMPLE = `Nico sintió que la cara se le ponía caliente. Cerró los puños arrugando la sábana y el nudo del estómago se le hizo más grande. Quería protestar fuerte. Pero cerró los ojos, tomó aire por la nariz hasta llenar el pecho y lo soltó despacio por la boca, como apagando una vela lejana. Los hombros le bajaron.
—Bueno… —murmuró, con la voz más chiquita de lo que quería—. ¿Pero me ayudas?`;

const NEUTRO_EXAMPLES: FewShotSet = {
  opening: `Había una vez un niño llamado Nico que vivía en un apartamento donde olía a café de la mañana y a pan tostado. Afuera la ciudad seguía despierta: un bus a lo lejos, la llovizna fina en la ventana. Nico ya buscaba la tablet antes de abrir bien los ojos.`,
  dialogue: `—Ya es hora de ir a dormir —dijo mamá, con voz tranquila pero firme—. Cuando terminen este juego, apagan la tablet y van a la cama.
—¿En serio? —preguntó Nico—. ¿Aunque me falte poco para ganar?
—En serio —respondió papá, sin levantar la vista del partido en mute—. Ya no más pantallas esta noche.`,
  regulation: REGULATION_EXAMPLE,
};

const BOGOTA_ROLO_EXAMPLES: FewShotSet = {
  opening: `Había una vez, en un apartamento de Bogotá, un niño llamado Nico que oía buses lejos y llovizna en la ventana. Pauleta organizaba uniformes del colegio mientras la aspiradora robot zumbaba por el pasillo. Nico ya tenía ganas de un round más en la tablet.`,
  dialogue: `—Parces, pilas: ya es hora de ir a dormir —dijo Pauleta—. Cuando terminen este round, apagan la tablet y van directo a la cama.
—¿En serio, bro? —dijo Nico—. ¿Aunque esté a un golpe de ganar?
—En serio, parce —dijo papá—. Ya no más tablet. Duérmanse o les apago, mijo.`,
  regulation: REGULATION_EXAMPLE,
};

const BOGOTA_NINOS_EXAMPLES: FewShotSet = {
  opening: NEUTRO_EXAMPLES.opening,
  dialogue: BOGOTA_ROLO_EXAMPLES.dialogue,
  regulation: REGULATION_EXAMPLE,
};

const BOGOTA_CACHACO_EXAMPLES: FewShotSet = {
  opening: BOGOTA_ROLO_EXAMPLES.opening,
  dialogue: `—Listo, chinos, ya es hora del nono —dijo Pauleta, sin dejar de doblar un uniforme—. Apaguen el visor y vayan pa la cama.
—Ah carachas —murmuró Nico—. ¿Y si termino este nivel?
—Sin pelafustear —respondió papá—. Pilas: Operación A Dormir empieza ya.`,
  regulation: REGULATION_EXAMPLE,
};

const BY_ACCENT: Record<StoryAccentCode, FewShotSet> = {
  neutro: NEUTRO_EXAMPLES,
  bogota_rolo: BOGOTA_ROLO_EXAMPLES,
  bogota_ninos: BOGOTA_NINOS_EXAMPLES,
  bogota_cachaco: BOGOTA_CACHACO_EXAMPLES,
};

/** Bloque few-shot para el mensaje de usuario (imitar estilo, no copiar trama). */
export function buildFewShotBlock(accentCode: StoryAccentCode): string {
  const ex = BY_ACCENT[accentCode];
  return [
    "Escribe en un estilo similar a estos fragmentos de referencia (NO copies la trama; solo tono, ritmo y nivel de detalle):",
    "",
    "Apertura de ejemplo (Había una vez + mundo sensorial, sin marcas):",
    ex.opening,
    "",
    "Diálogo de ejemplo:",
    ex.dialogue,
    "",
    "Regulación emocional de ejemplo (muestra el cuerpo y cómo se calma; cada frase avanza):",
    ex.regulation,
  ].join("\n");
}
