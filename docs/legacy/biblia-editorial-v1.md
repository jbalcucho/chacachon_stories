> **Retirada 2026-07-14.** Reemplazada por `docs/biblia-editorial.md` (v2), que resuelve la
> contradicción interna de esta versión (mundo narrativo "casa" vs. prompt en producción
> "fantasía"), la numeración duplicada (§10 antes de §9), el conflicto "7 pilares" en §1 vs.
> "cinco pilares" en el footer, y unifica el rango de palabras (350–600 aquí vs. 400–700 en
> `story-prompt.ts`) a 400–600. Se conserva solo como referencia histórica — no usar como spec.

# Biblia editorial — Chacachón

> Reglas de voz, estructura y calidad para cuentos generados por IA y curados a mano.  
> Complementa [GuiaAcentos.md](../../GuiaAcentos.md) (dialecto) y alimenta `src/lib/story-prompt.ts`.

**Audiencia (este entregable):** cuentos **familiares** pensados para niños de hasta **~12 años** (lectura en voz alta o lectura propia según la edad), con humor de **doble audiencia**: el niño sigue la trama; el adulto reconoce la cotidianidad familiar (hogar, colegio, ciudad colombiana). Cualquier edad puede disfrutarlos; el foco editorial y de producto es la infancia / preadolescencia temprana.

**Fuera de alcance por ahora:** versiones explícitamente para adultos. Quedan para una fase posterior; no mezclar tono adulto en el corpus ni en el prompt de generación de este MVP.

---

## 1. Qué hace único a un cuento Chacachón

Un cuento Chacachón **no** es un resumen genérico de "un niño aprendió X". Es:

1. **Mundo reconocible y sensorial (pertenencia + cognición corporizada):** el cuento ocurre en un mundo que el niño *podría habitar* —casa, colegio, barrio, ciudad del perfil— con **1–3 anclas sensoriales concretas** por escena (olor a café o lluvia, textura del pasto o del pelaje, sonido de las llaves, frío en las manos). El cerebro asimila mejor lo que *siente*; evita lo abstracto ("era bonito", "estaba triste" → muéstralo en el cuerpo). Lo colombiano entra cuando el perfil o el lugar lo piden; **no forzar Bogotá** ni saturar objetos/jerga como checklist de marca. Prioridad: **familia → lugar del perfil → Colombia → genérico cálido**.
2. **Personal (reconocimiento familiar):** el cuento hace sentir *esta* familia, no "unos niños genéricos". Usar **exactamente** nombres y apodos de la receta/perfil; dar **agencia** al protagonista (hace, decide, siente — no solo aparece nombrado); integrar **1–2 marcas de dinámica** (quién pone el límite, quién alivia, rol de la mascota) y como máximo **1–2 frases típicas** en diálogo. No volcar el perfil entero ni inventar parientes o datos que el usuario no dio. Sin perfil (demo): personalizar con la receta; no fingir "tu familia" si es modo demo.
3. **Pedagógico sin sermón (aprendizaje en la piel):** el **reto** es el conflicto que el niño reconoce (deseo, miedo suave, frustración); la **lección** de la receta es solo la semilla del cierre y se **muestra** en lo que hacen o sienten, no se declara. Preferir cambio de conducta o de vínculo (apaga, pide la mano, se queda) antes que explicación adulta. Permitir **una** frase de insight del niño si suena a él, no a maestro. Prohibido: "la moraleja es…", "aprendimos que…", monólogos correctivos largos, subtítulos o escenas morales.
4. **Cálido y cómico (humor de reconocimiento):** el humor nace de la **situación cotidiana** (rutina, mascota, malentendido suave), no de chistes sueltos ni de ridiculizar al niño. **Doble audiencia:** el niño sigue la gracia de lo que pasa; el adulto sonríe al verse. **Calor:** límites firmes sin humillación; cansancio parental permitido, cinismo o sarcasmo hiriente no. **Densidad:** 1–2 momentos cómicos memorables por cuento bastan. Prohibido: burla cruel, grosería, clasismo, reírse *del* niño como tonto.
5. **Ritmo de lectura en voz alta (oído primero):** el cuento debe poder leerse en familia sin atascarse. Frases en su mayoría **cortas o medias**; párrafos de **2–4 oraciones**; diálogos con raya (`—`), turnos breves, alternando narración y voz. Dejar **aire** entre beats (no un muro de texto). El cierre baja el volumen (calma, no clímax nuevo). Evitar: oraciones kilométricas, párrafos de media página, cascadas de nombres, onomatopeyas en exceso. Formato: Markdown limpio (`#`, `>`, `##`, `—`).
6. **Toque mágico de cuento:** la apertura casi siempre usa **«Había una vez…»** o **«Era una vez…»** y enseguida ancla el mundo del niño. Cotidianidad sí; informe doméstico seco, no. Cohesión: cada oración avanza; sin redundancia ni párrafos pegados sin causa–efecto.
7. **Sin marca dentro del texto:** el lector no conoce «Chacachón». No presentar familia/marca Chacachón en el cuento; solo nombres de la receta/perfil.

Referencias canónicas: el corpus de demos se vació (jul 2026). Usar los **pilares** de esta sección y los few-shots en `src/lib/story-prompt-examples.ts` hasta publicar el próximo cuento curado.

## 2. Estructura narrativa

### Andamiaje recomendado (generación IA y QA)

Para lectura familiar en voz alta, el default es un arco de **3 a 5 escenas** con `##` :

```
1. MUNDO     — Dónde estamos, quién es quién, tono del día
2. RETO      — El dilema aparece; tensión acorde a la edad (sin terror)
3. COMPLICACIÓN — Intento fallido o momento difícil (opcional si el cuento es corto)
4. GIRO      — Decisión, ayuda, objeto o personaje que cambia el rumbo
5. CIERRE    — Calma, vínculo restaurado; la lección queda implícita
```

Es **andamiaje**, no camisa de fuerza: un cuento corto puede fusionar mundo+reto o saltarse la complicación. Variantes válidas cuando la receta lo pida (p. ej. molde clásico de tres intentos, día acumulativo).

### Mínimo obligatorio (calidad)

Da igual el número exacto de `##` si se cumplen estas tres:

1. **Deseo o conflicto claro** — el niño entiende qué se quiere o qué duele.
2. **Causa–efecto** — lo que pasa sigue de lo que hicieron los personajes (no una lista de eventos sueltos).
3. **Cierre en calma** — el arco emocional aterriza; la lección se *siente*, no se predica.

### Extensión


| Métrica             | Objetivo                                                                              |
| ------------------- | ------------------------------------------------------------------------------------- |
| Palabras            | **350 – 600** (default lectura en voz alta; más solo si la receta/molde lo justifica) |
| Escenas (`##`)      | **3 – 5** recomendadas                                                                |
| Tiempo de lectura   | **5 – 8 minutos** en voz alta                                                         |
| Párrafos por escena | 2 – 4                                                                                 |


### Título y subtítulo

- **Título:** evocador, con nombre del protagonista o del reto cuando encaje.  
Ej.: *La misión secreta de Nico: el guardián de la noche* · *El día sin pantallas de Nico*.
- **Subtítulo** (`> …`): una línea que promete emoción o lugar. No repite la moraleja.

---

## 3. Voz y registro (tier 1)

**Default en generación IA y en** `/crear`**:** `neutro` — español claro, cálido y comprensible en todo Colombia.  
Los acentos regionales (rolo, cachaco, santandereano, costeño, paisa, pastuso, etc.) son **opcionales**; el usuario los elige al confirmar la receta. Ver [GuiaAcentos.md](../../GuiaAcentos.md).

El `codigo_acento` del perfil familiar **no** impone el acento del cuento generado salvo que el usuario lo elija en el wizard.

### Neutro (default)

- Español latinoamericano natural; máximo 0–1 modismo local por párrafo.
- Cotidianidad colombiana sin saturar jerga: casa, colegio, familia, ciudad.
- Detalles sensoriales concretos (olores, sonidos del hogar, clima).

### Acentos opcionales

Si el usuario elige un acento  aplicar las reglas de densidad de [GuiaAcentos.md](../../GuiaAcentos.md) (2–4 marcas por párrafo en tier 1).

### Sí usar

- Narrador cercano (*"En la casa olía a…"*).
- Diálogos cortos con raya (`—`) y emoción reconocible; turnos breves.
- Anclas de pertenencia: olores, sonidos, clima, gestos de rutina familiar.
- Humor de **reconocimiento**: situación cotidiana (rutina, mascota, malentendido suave), no chiste suelto ni sketch.
- Calor en el vínculo: límite firme sin humillar; cansancio parental sin cinismo hiriente.
- Párrafos de 2–4 oraciones; aire entre beats para lectura en voz alta.

### No usar

- Sermones explícitos (*"la moraleja es que…"*, *"lo que aprendimos hoy…"*).
- Violencia, miedo intenso, castigos humillantes, muerte, armas.
- Marcas comerciales, política, religión doctrinal.
- Insultos, clasismo, burla a barrios o estratos.
- Burla *del* niño (tonto, llorón, "boleta" como humillación); reír *con* la situación familiar sí.
- Saturar gags o modismos hasta volver el cuento un sketch.
- Oraciones kilométricas, párrafos muro, cascadas de nombres u onomatopeyas en exceso.
- Cierre que abre un clímax nuevo en vez de bajar el volumen.
- Saturación de modismos u objetos "locales" (caricatura / postcard).
- Forzar Bogotá u otra ciudad si el perfil o la receta apuntan a otro lugar.
- Fantasía desconectada del mundo del niño **salvo** que el usuario eligió un lugar fantástico o un molde clásico.

### Moraleja (detalle del pilar §1.3)

- En la mente del lector adulto puede resumirse en **una frase**; en el texto del cuento, **no**.
- Alineada con **«Qué aprenden»**; el **reto** es el conflicto vivido, no el discurso.
- Sermón disfrazado también cuenta: monólogo largo de mamá/papá, "y desde ese día…", título/subtítulo moral, escena tipo "La moraleja".
- Insight del niño al cierre (una línea, en su voz) **sí** puede; cartilla del adulto **no**.

---

## 4. Uso de los ingredientes de la receta

Cada zona del wizard en `/crear/adaptar` tiene un trabajo narrativo:


| Ingrediente         | Rol en la historia                                                                         |
| ------------------- | ------------------------------------------------------------------------------------------ |
| **Protagonistas**   | Llevan la acción; usar **exactamente** esos nombres.                                       |
| **Reto**            | Conflicto que el niño reconoce; debe sentirse en el nudo (no como sermón del adulto). |
| **Qué aprenden**    | Semilla **solo** del cierre; nunca frase moral pegada ni monólogo correctivo.          |
| **Lugar**           | Escenario dominante; detalles concretos (no "un lugar bonito").                            |
| **Mascota**         | Al menos un momento cómico o de apoyo.                                                     |
| **Acompañantes**    | Diálogo o reacción que tensiona o ayuda.                                                   |
| **Rol de reto**     | "Lobo" simbólico: quien encarna el lado difícil (sin villano terrorífico).                 |
| **Objeto especial** | Detalle con payoff en el giro o cierre.                                                    |
| **Molde clásico**   | Estructura inspirada (tres intentos, viaje, regreso) sin copiar copyrighted plot verbatim. |


Si falta un ingrediente opcional, **no inventar** personajes nuevos con nombre propio.

---

## 5. Perfil familiar (cuando se inyecte al prompt)

El perfil alimenta el **reconocimiento familiar** (§1.2), no un dump de ficha.

Prioridad de datos del JSONB (`PerfilFamiliar.md`):

1. Nombres y **apodos** de niños y adultos (el apodo manda en diálogo si existe).
2. Ciudad / barrio (`meta.ciudad`) — ancla de lugar, no postcard.
3. Mascotas con personalidad breve — un momento, no biografía.
4. **Frases típicas** de mamá/papá/niños (**máx. 1–2 por cuento**, en diálogo).
5. Gustos o "no le gusta" **solo** si refuerzan el reto (ej. dormir, pantallas).

**No:** inventar hermanos, colegios, direcciones, emails ni datos sensibles; no listar a toda la familia en el primer párrafo si no actúan.

---

## 6. Ejemplos: así sí vs así no

### Apertura

**❌ Así no**

> Nico era un niño que a veces no quería dormir. Un día aprendió que dormir es importante.

**❌ Tampoco** (marca desconocida / lista de familia)

> En Bogotá vivía la familia Chacachón: José, Julie, Nico…

**❌ Tampoco** (sensorial suelto + acción repetida)

> El sol iluminaba las motas de polvo. Nico estaba buscando en el sofá. Debajo de los cojines solo encontró una moneda…

**✅ Así sí**

> Había una vez un niño llamado Nico que vivía en un apartamento donde olía a café y a pan tostado. Afuera todavía bostezaba la ciudad: un bus lejos, llovizna fina en la ventana. Nico ya tenía la mano en la tablet antes de abrir bien los ojos.

### Diálogo y reto

**❌ Así no**

> —Debes dormir —le dijo mamá. —Está bien —dijo Nico, y durmió.

**✅ Así sí**

> —Hoy toca dormir temprano, mi vida —dijo Pauleta, con esa calma que pesa más que un grito.  
> —¿En serio? ¿Ni un ratito de YouTube? —preguntó Nico, y la voz le salió más chiquita de lo que quería.

### Cierre / lección

**❌ Así no**

> Y Nico aprendió que la calma es buena. Fin.

**✅ Así sí**

> Nico apagó la luz sin pelear. Bingo se acomodó al pie de la cama. Afuera Bogotá seguía, pero adentro ya era hora del nono — y por primera vez en la noche, el silencio no le dio miedo.

---

## 7. Checklist de calidad (revisión humana o QA)

Antes de dar por bueno un cuento generado (o revisar demos con `npm run validate:quality`):


- [ ] ¿Empieza con «Había una vez» / «Era una vez» (o equivalente mágico claro)?
- [ ] ¿Hay cohesión causa–efecto, sin párrafos redundantes o sueltos?
- [ ] ¿Evita nombrar «Chacachón» / familia marca dentro del texto?
- [ ] ¿Se siente el mundo del niño (familia + lugar del perfil), sin postcard ni plantilla genérica?
- [ ] ¿Un niño de hasta ~12 años entiende qué pasó sin explicación adulta?
- [ ] ¿El adulto puede sonreír *y* el niño entiende la gracia (humor de reconocimiento, no burla del niño)?
- [ ] ¿Hay ~1–2 momentos cómicos, sin saturar gags?
- [ ] ¿El reto de la receta es el corazón del conflicto?
- [ ] ¿El niño *vivió* la lección (cambio/vínculo) o un adulto la explicó?
- [ ] ¿La lección se siente al final sin que la digan (ni en subtítulo/escena moral)?
- [ ] ¿Se siente *esta* familia (nombres exactos, agencia del niño, 1–2 marcas de dinámica) sin volcar el perfil?
- [ ] ¿Hay deseo/conflicto claro, causa–efecto y cierre en calma?
- [ ] ¿350–600 palabras y ~3–5 escenas (o variante justificada por la receta)?
- [ ] ¿Máximo 3–4 modismos por párrafo?
- [ ] ¿Sin violencia, miedo fuerte ni sermón?
- [ ] ¿Se lee en voz alta sin tropezar (frases medias, párrafos cortos, diálogo con `—`, cierre más quieto)?
- [ ] ¿Formato Markdown válido para el lector (`#`, `>`, `##`, `—`)?

---

## 8. Relación con el código


| Artefacto                           | Función                                                  |
| ----------------------------------- | -------------------------------------------------------- |
| `docs/biblia-editorial.md`          | **Fuente de verdad editorial** (este archivo)            |
| [GuiaAcentos.md](../../GuiaAcentos.md) | Matiz dialectal y tiers                                  |
| `src/lib/story-accent.ts`           | Códigos de acento, default `neutro`, opciones del wizard |
| `src/lib/story-prompt-examples.ts`  | Fragmentos few-shot de cuentos curados                   |
| `src/lib/story-prompt.ts`           | System prompt + mensaje usuario → API                    |
| `src/lib/story-mock.ts`             | Fallback sin IA (no sustituye calidad)                   |
| `src/lib/story-quality.ts`          | Rúbrica automática (palabras, escenas, sermón, sensorial) |
| `docs/ia-generacion.md`             | Infra, keys, Vercel, persistencia                        |
| `docs/guia-neuroeducacion-cuentos.md` | Referencia neuro (adopción selectiva; no sustituye §1–7) |


**Próximo paso técnico:** mantener `buildStorySystemPrompt()` y `buildFewShotBlock()` alineados con este doc;
`buildStoryPrompt()` inyecta receta + perfil + acento elegido (jul 2026).

---

## 10. Cuentos curados como corpus de referencia

Los cuentos en `cuentos/*.md` no son "entrenamiento" del modelo en el sentido de fine-tuning; son **few-shot editorial**:

1. **Refinar** cada cuento publicado (tono, ritmo, checklist §7).
2. **Etiquetar** variantes por `codigo_acento` cuando existan (neutro vs regional).
3. **Extraer** fragmentos cortos (apertura + diálogo) a `src/lib/story-prompt-examples.ts`.
4. **No copiar** tramas literalmente en generación — solo imitar voz y nivel de detalle.

Al añadir un cuento nuevo, agregar al menos un par de fragmentos neutros; si hay versión dialectal curada, añadirla al mapa `BY_ACCENT`.

---

## 9. Iteración del prompt (proceso recomendado)

1. Elegir **3 recetas fijas** de prueba (dormir, pantallas, respeto).
2. Generar con Gemini y guardar los 3 markdowns.
3. Comparar lado a lado con el checklist §7 (y con el próximo demo curado cuando exista).
4. Ajustar **una regla a la vez** en `story-prompt.ts`.
5. Repetir hasta que un lector externo (otro adulto) diga "esto sí es Chacachón".

No subir temperatura ni tokens como primer recurso; primero claridad de reglas y contexto de perfil.

---

*Última actualización: julio 2026 — cinco pilares afinados (pertenencia, reconocimiento, aprendizaje en la piel, humor de reconocimiento, oído primero).*
