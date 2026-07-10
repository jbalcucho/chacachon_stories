import type { StoryAccentCode } from "@/lib/story-accent";

/**
 * Fragmentos de cuentos curados como few-shot para imitar tono y ritmo.
 * Fuente: cuentos/*.md — versiones neutras o por acento según corresponda.
 * Ampliar al refinar cada cuento publicado (docs/biblia-editorial.md §10).
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
  opening: `En Bogotá vivía la familia Chacachón: José, a quien todos llaman Chacachón; Julie, o Pauleta; y los niños Nicolás —Nico— y Simón —Simónchin—. En el apartamento olía a café de la mañana y a pan tostado. Afuera la ciudad seguía despierta: un bus a lo lejos, la llovizna fina en la ventana. Nico ya buscaba la tablet antes de abrir bien los ojos.`,
  dialogue: `—Ya es hora de ir a dormir —dijo Pauleta, con voz tranquila pero firme—. Cuando terminen este juego, apagan la tablet y van a la cama.
—¿En serio? —preguntó Nico—. ¿Aunque me falte poco para ganar?
—En serio —respondió Chacachón, sin levantar la vista del partido en mute—. Ya no más pantallas esta noche.`,
  regulation: REGULATION_EXAMPLE,
};

const BOGOTA_ROLO_EXAMPLES: FewShotSet = {
  opening: `En Bogotá vivía la familia Chacachón: José —Chacachón—, Julie —Pauleta—, y los niños Nico y Simónchin. Bogotá siempre tiene buses por todos lados, TransMilenio lleno y trancones de esos que no perdonan. En el apartamento, Pauleta organizaba uniformes del colegio mientras Josefina, la aspiradora robot, zumbaba por el pasillo.`,
  dialogue: `—Parces, pilas: ya es hora de ir a dormir —dijo Pauleta—. Cuando terminen este round, apagan la tablet y van directo a la cama.
—¿En serio, bro? —dijo Nico—. ¿Aunque esté a un golpe de ganar?
—En serio, parce —dijo Chacachón—. Ya no más tablet. Duérmanse o les apago, mijo.`,
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
—Sin pelafustear —respondió Chacachón—. Pilas: Operación A Dormir empieza ya.`,
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
    "Apertura de ejemplo (mundo sensorial):",
    ex.opening,
    "",
    "Diálogo de ejemplo:",
    ex.dialogue,
    "",
    "Regulación emocional de ejemplo (muestra el cuerpo y cómo se calma, no lo resuelvas por magia):",
    ex.regulation,
  ].join("\n");
}
