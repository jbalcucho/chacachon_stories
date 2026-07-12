/**
 * Léxico oral colombiano para cuentos (neutro / familiar).
 * No forzar refranes: usarlos solo si caen naturales.
 * Objetivo: evitar español de España/México/IA y calcos raros.
 */

/** Palabras/formas preferidas (casa colombiana). */
export const COLOMBIAN_PREFER = [
  "plato (no cuenco)",
  "vaso / pocillo",
  "casi se va de cara / se pegó una embarrada",
  "por un pelo (no «por los pelos»)",
  "de una / ya mismo",
  "qué menso / qué bobada",
  "hacía un calor / hacía un frío",
  "trancón (si hay camino/ciudad)",
  "arepa, empanada, caldo, panela (si hay comida)",
  "colegio (no «escuela» a la mexicana, salvo que encaje)",
  "mamá / papá / los papás",
  "se puso bravo (con moderación) / se enojó",
  "pilas (si el acento lo permite)",
];

/** Evitar: poco naturales en Colombia o calcos. */
export const COLOMBIAN_AVOID = [
  "cuenco",
  "por los pelos (usar «por un pelo»)",
  "vale (español de España)",
  "tío/tía como muletilla (España)",
  "guácala → mejor «qué asco» / «qué recochino»",
  "órale / chido / padre (México)",
  "impregnado, emitían, intensamente",
  "fortalecer la vista / visión necesaria",
  "corrientes del aire (si puedes decir «viento»)",
  "base militar / guardia nocturna pomposa",
  "mar de plata / vacío infinito / árboles de plata",
];

/**
 * Dichos/modismos comunes en tono de cuento oral.
 * Espíritu: claridad para niños; 0–1 por cuento si encaja.
 */
export const COLOMBIAN_DICHOS = [
  "por un pelo (casi le pasa)",
  "más vale tarde que nunca (solo si no suena a moraleja)",
  "no hay mal que por bien no venga (muy raro; casi nunca)",
  "al que madruga… (evitar sermón)",
  "se fue de cara / se pegó el tortazo",
  "quedó como un tomate (cara; no abusarlo)",
  "ni de vainas / ni locos (suave)",
  "eso sí es un problema / un lío",
  "de una vez / de una",
  "no sea bobito / no diga bobadas (cariño, sin humillar)",
];

/** Bloque listo para inyectar en el system/user prompt. */
export function buildColombianLexiconBlock(): string {
  return [
    "LÉXICO COLOMBIANO (obligatorio — oral de casa, no diccionario):",
    "- Escribe como lo contaría un papá/mamá en Colombia. Fantasía sí; extranjerismos y calcos no.",
    "- Preferir: " + COLOMBIAN_PREFER.slice(0, 10).join("; ") + ".",
    "- Evitar: " + COLOMBIAN_AVOID.join("; ") + ".",
    "- Dichos (máx. 0–1 por cuento, solo si caen solos): " +
      COLOMBIAN_DICHOS.slice(0, 6).join("; ") +
      ".",
    "- No satures modismos. Claridad > “sonar colombiano a la fuerza”.",
    "- Ejemplo MAL: «esquivó el golpe por los pelos» / «tomó el cuenco».",
    "- Ejemplo BIEN: «esquivó el golpe por un pelo» / «tomó el plato».",
  ].join("\n");
}
