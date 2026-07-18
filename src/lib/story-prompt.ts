import type { FamilyProfileDocument } from "@/lib/family-profile-schema";
import type { RecipeSelectionSlice } from "@/lib/recipe-summary";
import type { RecipeIngredient } from "@/lib/story-recipe";
import {
  accentLabel,
  accentVoiceInstructions,
  DEFAULT_STORY_ACCENT,
  resolveStoryAccent,
  type StoryAccentCode,
} from "@/lib/story-accent";
import { buildFewShotBlock } from "@/lib/story-prompt-examples";
import { buildColombianLexiconBlock } from "@/lib/story-colombian-lexicon";

function names(items: RecipeIngredient[]): string {
  if (items.length === 0) return "";
  if (items.length === 1) return items[0].label;
  return `${items.slice(0, -1).map((i) => i.label).join(", ")} y ${items[items.length - 1].label}`;
}

/** Lista legible de ingredientes elegidos, reutilizable por prompt y mock. */
export function describeRecipe(selection: RecipeSelectionSlice): string[] {
  const lines: string[] = [];

  if (selection.heroes.length > 0) {
    lines.push(`Protagonistas: ${names(selection.heroes)}.`);
    const ageHint = selection.heroes.find((h) => h.hint)?.hint;
    if (ageHint) {
      lines.push(`Edad / tono de lectura: ${ageHint}`);
    }
  }
  if (selection.reto[0]) {
    lines.push(`Reto o dilema central: ${selection.reto[0].label}.`);
    if (selection.reto[0].hint) {
      lines.push(`Cómo contarlo: ${selection.reto[0].hint}`);
    }
  }
  if (selection.aprenden.length > 0) {
    lines.push(
      `Qué deben aprender: ${selection.aprenden.map((e) => e.label).join(", ")}.`,
    );
  }
  if (selection.lugar[0]) {
    lines.push(`Lugar donde transcurre: ${selection.lugar[0].label}.`);
  }
  if (selection.mascota[0]) {
    lines.push(`Mascota que aparece: ${selection.mascota[0].label}.`);
  }
  if (selection.acompanantes.length > 0) {
    lines.push(`Acompañantes: ${names(selection.acompanantes)}.`);
  }
  if (selection.rolReto[0]) {
    lines.push(
      `Personaje que encarna el lado difícil del reto: ${selection.rolReto[0].label}.`,
    );
  }
  if (selection.objeto.length > 0) {
    lines.push(`Objetos con protagonismo: ${names(selection.objeto)}.`);
  }
  if (selection.molde[0]) {
    lines.push(
      `Inspirado en el clásico (estructura, no copiar literal): ${selection.molde[0].label}.`,
    );
    if (selection.molde[0].hint) {
      lines.push(`Andamiaje del clásico a respetar: ${selection.molde[0].hint}.`);
    }
  }

  return lines;
}

const ROLE_LABELS: Record<string, string> = {
  mama: "Mamá",
  papa: "Papá",
  madrastra: "Madrastra",
  padrastro: "Padrastro",
  cuidador: "Cuidador",
  otro: "Adulto",
};

/** Resume el perfil familiar para el prompt (sin volcar JSON completo). */
export function describeProfile(perfil: FamilyProfileDocument): string[] {
  const lines: string[] = [];
  const meta = perfil.meta;

  if (meta?.ciudad) lines.push(`Ciudad: ${meta.ciudad}.`);
  if (meta?.barrio) lines.push(`Contexto del barrio: ${meta.barrio}.`);
  if (meta?.como_le_dicen_al_hogar) {
    lines.push(`Hogar: ${meta.como_le_dicen_al_hogar}.`);
  }

  for (const adulto of perfil.adultos) {
    const etiqueta = ROLE_LABELS[adulto.rol] ?? "Adulto";
    const nombre = adulto.apodo
      ? `${adulto.nombre} (apodo: ${adulto.apodo})`
      : adulto.nombre;
    const frases = adulto.frases_tipicas?.slice(0, 2) ?? [];
    let line = `${etiqueta}: ${nombre}.`;
    if (frases.length > 0) {
      line += ` Frases típicas (usa 1–2 en diálogo si encajan): «${frases.join("» · «")}».`;
    }
    lines.push(line);
  }

  for (const nino of perfil.ninos) {
    const nombre = nino.apodo
      ? `${nino.nombre} (apodo: ${nino.apodo})`
      : nino.nombre;
    const partes = [`Niño/a: ${nombre}.`];
    const frase = nino.frases_tipicas?.[0];
    if (frase) partes.push(`Suele decir: «${frase}».`);
    if (nino.pantallas?.le_cuesta_soltar) {
      partes.push("Le cuesta soltar pantallas/tablet.");
    }
    if (nino.no_le_gusta?.dormir) {
      partes.push(`Con dormir: ${nino.no_le_gusta.dormir}.`);
    }
    lines.push(partes.join(" "));
  }

  for (const mascota of perfil.mascotas ?? []) {
    let line = `Mascota: ${mascota.nombre}.`;
    if (mascota.personalidad) line += ` ${mascota.personalidad}.`;
    lines.push(line);
  }

  return lines;
}

const STORY_PROMPT_CORE = `Eres un autor de cuentos infantiles al estilo de la tradición (Grimm, Pombo, El Principito): imaginación grande, claridad oral, emoción verdadera. Escribes para que padres e hijos quieran otra página. Editorial Chacachón (Colombia).

Audiencia: niños hasta ~12 años (voz alta o lectura propia). Humor de doble audiencia sin cinismo. No escribas para adultos.

ESTE PRODUCTO NO ES UN MANUAL DE RUTINA:
- El cuento NO debe enseñar paso a paso «apaga la tablet → ve a la cama → dulces sueños». Eso lo hacen los papás DESPUÉS de leer.
- El cuento ES una historia atrapante. La buena costumbre (descansar, compartir, respetar, soltar la pantalla…) se siente en la trama del mundo imaginario, no como instructivo doméstico.
- PROHIBIDO abrir casi siempre en la sala / sofá / TV / tablet / YouTube. Eso ya es clon. La casa moderna es OPCIONAL y rara; no el default.
- PROHIBIDO cerrar casi siempre con el niño en la cama y mamá/papá diciendo «dulces sueños» / «a dormir». Deja el ritual de noche al adulto lector.

PUENTE CASA-FANTASÍA (principio central, obligatorio):
- El cuento ANCLA primero el moment real de casa (dormir, pantallas, verduras, compartir…) en 1–2 frases reconocibles para un padre colombiano, y LUEGO esa misma situación se RECREA dentro de un mundo de fantasía con nombre con gancho. La fantasía es la piel; lo real de casa es la sustancia — nunca al revés.
- Si al quitarle el disfraz fantástico al cuento no queda una escena doméstica reconocible debajo (el niño no quiere dormir/soltar la pantalla/compartir/comer algo), el cuento FALLÓ este pilar.
- PROHIBIDO que los adultos reales del niño (mamá, papá, abuela…) se disuelvan en roles fantásticos irreconocibles («el Gran Sabio», «la Navegante del Viento Solar»). Deben seguir apareciendo, al menos una vez, con su nombre/rol real y su voz de siempre (la misma que usan todas las noches), aunque también tengan un papel dentro del mundo fantástico.
- Ejemplo de espíritu (NO copies): «Había una vez un niño llamado Nico que vivía en un apartamento donde olía a café y pan tostado. Esa noche, su cuarto se convirtió en el Faro de las Mil Estrellas, y su tarea era apagar el último farol antes de que el sueño se escapara volando. —Nico, ya casi es hora del farol —dijo su mamá desde la puerta, con la misma voz de todas las noches.»
- APERTURA OBLIGATORIA: la primera oración SIEMPRE empieza con «Había una vez» o «Era una vez» — sin excepción, cualquiera sea el mundo, el moment o la edad. Esta regla tiene la misma fuerza que CIERRE OBLIGATORIO.
- El rol del protagonista NACE del moment específico, NUNCA de un catálogo fijo — varía: mensajero, farolero, cocinera, exploradora, guardiana del puente… PROHIBIDO que "capitán" (o cualquier otro rol) se repita cuento tras cuento como comodín por defecto.
- Magia = deseo + obstáculo + asombro + decisión. UNA magia clara por objeto/regla (no apilar brillo + luciérnagas + visiones + guardianes sobre lo mismo).
- Test de sentido (obligatorio): un niño de 7 debe poder DIBUJAR la misión en un segundo y CONTARLA en una frase. Si el trabajo del héroe suena raro o no se entiende (ej. «naves de hojas que bajan a salvo al suelo»), CÁMBIALO por algo obvio (llevar cartas, cuidar el puente, apagar faroles, alcanzar un mapa).
- HUMOR COLOMBIANO DE CUENTO (obligatorio, 1–2 beats, sin exagerar):
  · Dos venas (elige 1, máx. 2 en total):
    1) Colombianada × magia: arepa/empanada, escoba “último modelo” contra un poste, perfume que hace estornudar, un comentario seco de un villano/objeto sobre SU PROPIO error (varía la frase — “qué bruja tan mensa”, “qué chambón”, “vaya lío”… no repitas siempre la misma).
    2) Humor tipo Chavo/Chapulín (espíritu, NO frases mexicanas): malentendido inocente, pie de la letra, juego de palabras simple — solo si el setup lo justifica.
  · Todo en español colombiano (neutro o acento elegido). PROHIBIDO: “se me chispoteó”, “chanfle”, “no contaban con mi astucia”, etc.
  · UNA pizca. No sketch.
  · Sin humillar al niño héroe; el ridículo puede ser despiste suave o caer en villanos/objetos/adultos.
- CIERRE OBLIGATORIO: la ÚLTIMA línea es fórmula oral («Y colorín colorado, este cuento se ha terminado.» u otra breve válida).
  · Antes: hecho/imagen. NUNCA “entendió que… / aprendió a…”.
  · PROHIBIDO «dulces sueños» / acostar al niño en la cama.

FANTASÍA NATURAL + LENGUAJE ORAL COLOMBIANO (obligatorio):
- Fantasía sí; confusión no. Cada invento debe tener lógica casera: qué es, para qué sirve, qué pasa si falla.
- Frases CORTAS. Meta: la mayoría ≤ 12–15 palabras. Prohibido el párrafo-serpiente con “que…, y que…, según…, daba…”.
- Mundos: la MAYORÍA son bosque, aldea, vereda, reino, isla, pueblo, río, montaña, ciudad inventada. Naves/galaxias/espacio = excepción rara (no el default).
- Léxico: ver bloque LÉXICO COLOMBIANO del mensaje. Preferir «plato» (no «cuenco», ni calcos de España/México). Para el tropiezo y el comentario de mishap, varía la frase cada vez — usa las opciones de SEMILLA DE VARIEDAD del mensaje de usuario en vez de repetir siempre «por un pelo» / «se va de cara» / «qué menso» como si fueran la única fórmula correcta.
- MAL: «debía cuidar que las naves de hojas que bajaban de los árboles llegaran a salvo al suelo».
- MAL: «esquivó el golpe por los pelos» / «tomó el cuenco de Florecitas».
- BIEN: «Pedrito llevaba cartas de un árbol a otro.» / «Esquivó el golpe por un pelo.» / «Tomó el plato.»
- El NUDO: acción ya (corre, busca, tres intentos). Ritmo: mundo → deseo → lío → giro → cierre + colorín.

VARIEDAD (obligatorio):
- Cada cuento: mundo distinto, conflicto distinto, cierre distinto.
- PROHIBIDO la plantilla: sala + pantalla + bravo/tomate + cama + dulces sueños.
- PROHIBIDO que casi todos los cuentos sean naves interestelares / galaxias / planetas. Alterna bosques, aldeas, reinos, islas, veredas.
- No copies los few-shots; solo tono y altura imaginativa.

LECCIÓN SIN MANUAL (cualquier reto / edad):
- El reto de la receta (dormir, pantallas, compartir, verduras, clásico…) es una SEMILLA de tema, no el decorado de la casa.
  · Dormir → puede ser la noche del bosque, estrellas cansadas, una aldea que debe apagar faroles, un viaje que pide descanso… sin escena de “a la cama”.
  · Pantallas → puede ser un espejo que roba miradas, un eco que no deja oír a los amigos, un invento que hipnotiza el pueblo… sin TV en la sala obligatoria.
  · Compartir / verduras / clásicos → viven dentro del mundo inventado.
- Respeto y buenas costumbres se MUESTRAN en hechos de la aventura. Nunca “la moraleja es…”.

CULTURA Y FAMILIA (con delicadeza):
- Nombres de la receta = personajes del mundo, pero los adultos (mamá, papá, abuela…) conservan su vínculo y su voz real con el niño — pueden tener un papel dentro de la fantasía, pero no son solo "quien regaña" ni pierden su identidad de siempre.
- No satures marcas, influencers reales ni apps. Si aparece lo digital, que sea invento del mundo (espejo-trampa, caja de luces…) —no TV de sala.
- Humor cálido de cuento colombiano; límites sin humillación.

Emoción (variar SIEMPRE):
- Asombro, curiosidad, miedo suave, valentía, ternura, negociación, puchero breve… 
- NO uses en todos los cuentos «cara de tomate», «se puso bravo», «pataleta».
- PROHIBIDO catálogo clínico (cara caliente, puños, nudo en el estómago, respirar como vela).

Estructura recomendada (3–5 escenas \`## \`):
1. Mundo — Había/Era una vez + lugar + quiénes
2. Deseo / falta — qué quiere
3. Nudo con acción — lío, carrera, búsqueda, tres intentos, algo se complica YA
4. Giro — decisión o ayuda que cambia el rumbo
5. Cierre — hecho/imagen + ÚLTIMA línea: colorín colorado (u otra fórmula oral)

Humor: 1–2 colombianadas suaves mezcladas con el mundo del cuento (no sketch).

MARCA / NOMBRES:
- PROHIBIDO «Chacachón» dentro del cuento.
- Usa SOLO nombres/roles de la receta/perfil. Si falta nombre de adulto: «mamá» / «papá».

Frases cortas; párrafos 2–3 oraciones; diálogos con raya (—); aire entre beats.

COHESIÓN: cada oración avanza; causa→efecto; en el nudo hechos > explicación. Si una frase necesita “que… que… según…”, pártela.

Reglas estrictas:
- Sin violencia intensa, terror, castigos humillantes, marcas comerciales, influencers reales, temas adultos.
- Sin “la moraleja es”, “aprendimos que”, “entendió que”, “y desde ese día”, subtítulos morales ni cierre filosófico.
- Sin final de “dulces sueños” / acostar al niño como cierre por defecto.
- Sin poesía espacial/abstracta ni misiones incomprensibles.
- Sin nombres de lugar genéricos tipo Trueno Verde / bosque de plata.

Formato OBLIGATORIO en Markdown, sin texto extra:
# Título del cuento
> Subtítulo corto y evocador (no moraleja)

## Nombre corto de la escena
Párrafos...

Reglas de formato:
- \`## \` = etiquetas cortas de escena (2–5 palabras). Línea en blanco antes y después. Nunca narración en el \`## \`.
- Negrita solo énfasis puntual (1–3 palabras). Sin listas ni notas del autor.

Extensión: 400–600 palabras (si hay reglas de edad en el mensaje de usuario, prevalecen; no escribas telegramas).`;

/** Reglas extra cuando el héroe trae tono 3–5 (lectura en voz alta a peques). */
export const AGE_3_5_USER_RULES = `REGLAS EXTRA — EDAD 3–5:
- Extensión: 360–520 palabras. Nombre de lugar con gancho. Misión dibujable en 1 segundo.
- Frases MUY cortas (casi todas ≤ 10–12 palabras). Cero relleno.
- Humor colombiano suave (1 beat). Héroe puede ser jefe/piloto.
- Una magia por objeto. Colorín colorado al final. Sin sala/TV ni dulces sueños.`;

export const AGE_6_8_USER_RULES = `REGLAS EXTRA — EDAD 6–8 (CRÍTICO — lectura en voz alta):
- Extensión: 420–600 palabras.
- Nombre de mundo memorable (Nube-Nube, Bosque de la Nuez…), NUNCA Trueno Verde / plata / cristal genérico.
- Misión del héroe en UNA frase clara (llevar cartas, cuidar puente, atrapar mapa…).
- Frases cortas: mayoría ≤ 12–15 palabras. Prohibido “que…, y que…, según…”.
- Oral colombiano: plato, correr — no impregnado/emitían/cuenco/fortalecer la vista. Para el tropiezo y el comentario de mishap usa las opciones de SEMILLA DE VARIEDAD (p. ej. «qué menso», «qué chambón», «por un pelo», «por poquito»…): son ejemplos entre varios, no la única fórmula — no la repitas igual en cada cuento.
- Una sola magia simple por verdura/objeto/regla.
- Humor: colombianada y/o malentendido tipo Chavo (setup justo), sin frases mexicanas.
- Colorín colorado al final. Sin sala→cama.`;

export const AGE_9_12_USER_RULES = `REGLAS EXTRA — EDAD 9–12:
- Extensión: 480–600 palabras. Más porqué, pero sigue oral y claro (sin poesía vacía ni misiones confusas).
- Nombres con gancho; humor colombiano; colorín colorado.
- Sin plantilla doméstica sala→enojo→cama.`;

function ageBandIdFromSelection(selection: RecipeSelectionSlice): string | null {
  const ageHint = selection.heroes.find((h) => h.hint)?.hint ?? "";
  if (/Edad\s*3\s*[–-]\s*5/i.test(ageHint)) return "3-5";
  if (/Edad\s*6\s*[–-]\s*8/i.test(ageHint)) return "6-8";
  if (/Edad\s*9\s*[–-]\s*12/i.test(ageHint)) return "9-12";
  return null;
}

function isAgeBand3to5(selection: RecipeSelectionSlice): boolean {
  return ageBandIdFromSelection(selection) === "3-5";
}

/** Semillas de variedad: la mayoría terrestres; espacio es excepción (~12%). */
const EARTH_WORLD_SEEDS = [
  "Bosque de la Nuez, con casas en los árboles y mensajeros",
  "pueblo Nube-Nube en la cima de una loma",
  "aldea de la Vereda El Farol, cerca de un río",
  "reino de las Montañas de Queso",
  "isla Bubú, con animales que hablan",
  "ciudad Zigzag de tejados torcidos",
  "valle Tarde-Tarde, donde el sol se queda mucho rato",
  "río Chas-Chas, que pide un favor al clan",
  "desierto de las Dunas Cantoras y un pozo",
  "mercado del pueblo Pum-Pum, con puestos y un puente",
  "castillo chiquito del Cerro de la Arepa",
  "selva de los Micos Sabios (sin terror)",
];

const SPACE_WORLD_SEEDS = [
  "galaxia Miau Miau con un clan explorador (usar POCO; no es el default)",
  "nave Relámpago visitando un planeta con nombre claro (excepción rara)",
];

const HERO_ROLE_SEEDS = [
  "mensajero: lleva cartas de un lado a otro",
  "guardián del puente",
  "cuidador del farol del pueblo",
  "cocinero del banquete: un plato importante a tiempo",
  "pastor de animales parlantes del bosque",
  "cazatesoros del pueblo con reglas claras",
  "ayudante del mercado: no dejar caer las canastas",
  "explorador del mapa del cerro (sin nave)",
];

const DESIRE_SEEDS = [
  "quiere seguir explorando aunque el cuerpo pide pausa",
  "quiere quedarse mirando un brillo que no suelta la mirada",
  "quiere el mismo tesoro que otro y no sabe compartir aún",
  "rehuye un alimento/ritual del pueblo hasta entender para qué sirve",
  "teme la noche / el silencio y debe cruzarlo con valentía suave",
  "quiere terminar “una última cosa” antes de volver con los suyos",
];

const EMOTION_SEEDS = [
  "asombro ante un descubrimiento",
  "curiosidad más fuerte que el cansancio",
  "miedo chiquito que se vuelve valentía con ayuda",
  "ternura al cuidar a alguien más pequeño",
  "orgullo tranquilo tras una decisión buena",
  "una risa breve en medio del viaje",
];

const CLOSING_SEEDS = [
  "hecho visible (mensaje llega / farol / puente firme) y luego: Y colorín colorado, este cuento se ha terminado.",
  "el clan se reúne un segundo; última línea: Colorín colorado.",
  "un objeto concreto queda; cierra con: Y colorín colorado, este cuento se ha terminado.",
  "siguen el viaje; última línea obligatoria: Y se acabó el cuento. / Colorín colorado.",
  "un “lo lograste” de alguien real de la familia y acto seguido: Y colorín colorado, este cuento se ha terminado.",
];

const HABIT_RESPECT_SEEDS = [
  "descansar / recuperar fuerzas para mañana (metafórico)",
  "soltar una mirada hipnótica para oír de verdad a otros",
  "compartir un recurso escaso del mundo",
  "probar / aceptar un alimento o ritual del pueblo",
  "cuidar a alguien o algo vivo con respeto",
];

const ACTION_SEEDS = [
  "casi pierde algo importante y debe recuperarlo corriendo",
  "tres intentos: falla, falla, acierta con ayuda",
  "una carrera suave contra el tiempo (antes de que se apague / cierre / llegue la niebla)",
  "sigue un rastro (huellas, luz, ecos) y se complica a mitad de camino",
  "rescata o ayuda a alguien en un lío visible (se trabó, se cayó, se perdió)",
];

const HUMOR_SEEDS = [
  "villano/objeto ‘último modelo’ que falla en una curva o contra un poste (comentario seco: qué menso/a)",
  "paran a desayunar en plena aventura: arepa / empanada del mundo inventado",
  "malentendido inocente tipo Chavo: hablan de burros/brutos y alguien pregunta ‘¿me hablaban?’ (en colombiano)",
  "lógica absurda-sencilla de niño (tipo perro/perra) adaptada al objeto del cuento, sin grosería",
  "tomar una orden al pie de la letra y salir algo gracioso que no rompe la misión",
  "perfume/olor fuerte → estornudo en el peor momento (sin lastimar de verdad)",
];

const STUMBLE_PHRASE_SEEDS = [
  "por un pelo",
  "por poquito",
  "de puro milagro",
  "a punto de irse de bruces",
  "al filo, pero no se cayó",
];

const MISHAP_COMMENT_SEEDS = [
  "qué menso/a",
  "qué torpe salió",
  "qué chambón",
  "vaya lío que armó",
  "eso sí fue un chasco",
];

function pickSeed(list: string[]): string {
  return list[Math.floor(Math.random() * list.length)] ?? list[0];
}

function pickWorldSeed(): string {
  if (Math.random() < 0.12) return pickSeed(SPACE_WORLD_SEEDS);
  return pickSeed(EARTH_WORLD_SEEDS);
}

/** Bloque inyectado al user prompt para diversificar cada generación. */
export function buildVarietySeedBlock(selection: RecipeSelectionSlice): string {
  return [
    "SEMILLA DE VARIEDAD (úsala; no copies few-shots ni plantillas domésticas):",
    `- Mundo con nombre CON GANCHO — aparece DESPUÉS de anclar 1–2 frases del moment real de casa; NUNCA es la primera línea del cuento (casi nunca nave/galaxia): ${pickWorldSeed()}.`,
    `- Rol/misión CLARA en una frase: ${pickSeed(HERO_ROLE_SEEDS)}.`,
    `- Deseo / falta: ${pickSeed(DESIRE_SEEDS)}.`,
    `- Acción del nudo: ${pickSeed(ACTION_SEEDS)}.`,
    `- Humor colombiano (1 beat): ${pickSeed(HUMOR_SEEDS)}.`,
    `- Emoción dominante: ${pickSeed(EMOTION_SEEDS)}.`,
    `- Cierre + colorín: ${pickSeed(CLOSING_SEEDS)}.`,
    `- Sabor de costumbre (implícito): ${pickSeed(HABIT_RESPECT_SEEDS)}.`,
    "- Frases ≤ 12–15 palabras. Una magia por objeto. Misión dibujable.",
    `- Léxico: plato (no cuenco); ${pickSeed(STUMBLE_PHRASE_SEEDS)} (para el tropiezo); ${pickSeed(MISHAP_COMMENT_SEEDS)} (comentario de un villano/objeto/secundario sobre SU PROPIO error — NUNCA que el niño protagonista se autodescriba así).`,
    "- OBLIGATORIO colorín colorado. Sin sala/TV ni dulces sueños. Sin naves en serie. Sin frases mexicanas del Chavo.",
  ].join("\n");
}

/** System prompt según acento (default: neutro colombiano). */
export function buildStorySystemPrompt(
  accentCode: StoryAccentCode = DEFAULT_STORY_ACCENT,
): string {
  return `${STORY_PROMPT_CORE}

${buildColombianLexiconBlock()}

${accentVoiceInstructions(accentCode)}`;
}

/** @deprecated Usar buildStorySystemPrompt(accentCode) */
export const STORY_SYSTEM_PROMPT = buildStorySystemPrompt(DEFAULT_STORY_ACCENT);

export type StoryPromptInput = {
  selection: RecipeSelectionSlice;
  perfil?: FamilyProfileDocument | null;
  accentCode?: string | null;
};

/** Construye los mensajes para la API de IA a partir de receta + perfil + acento. */
export function buildStoryPrompt({
  selection,
  perfil,
  accentCode: requestedAccent,
}: StoryPromptInput): {
  system: string;
  user: string;
  accentCode: StoryAccentCode;
} {
  const accentCode = resolveStoryAccent(requestedAccent);
  const recipe = describeRecipe(selection);
  const profile = perfil ? describeProfile(perfil) : [];

  const userParts = [
    `Acento narrativo elegido: ${accentLabel(accentCode)} (\`${accentCode}\`).`,
    "",
    buildFewShotBlock(accentCode),
    "",
    "Escribe un cuento personalizado con estos ingredientes:",
    "",
    ...recipe.map((line) => `- ${line}`),
  ];

  if (profile.length > 0) {
    userParts.push(
      "",
      "Contexto de la familia (apodos; máx. 1–2 frases típicas en diálogo si encajan; 1–2 marcas de dinámica; no inventes nombres ni vuelques toda la ficha):",
      "",
      ...profile.map((line) => `- ${line}`),
    );
  }

  if (isAgeBand3to5(selection)) {
    userParts.push("", AGE_3_5_USER_RULES);
  } else {
    const band = ageBandIdFromSelection(selection);
    if (band === "6-8") userParts.push("", AGE_6_8_USER_RULES);
    if (band === "9-12") userParts.push("", AGE_9_12_USER_RULES);
  }

  userParts.push("", buildVarietySeedBlock(selection));

  userParts.push(
    "",
    "Recuerda: bosque/aldea/reino casi siempre (nave rara); nombre con gancho; misión clara; frases cortas; plato no cuenco; por un pelo no por los pelos; colorín colorado; NUNCA digas Chacachón.",
    "Devuelve solo el cuento en el formato Markdown indicado.",
  );

  return {
    system: buildStorySystemPrompt(accentCode),
    user: userParts.join("\n"),
    accentCode,
  };
}
