# Guía de Acentos y Registros — Chacachón

> Referencia para escritores, prompts de IA y curación de `textos_localizados`.  
> Objetivo: sonar auténticamente local sin caricaturizar. Versión 1.0 — Junio 2026.

---

## 1. Para qué sirve este documento

Esta guía es parte del **contexto de producto** de Chacachón. Alimenta tres frentes:

1. **Escritura humana** de cuentos pregenerados.
2. **System prompts** de Claude al crear o revisar variantes dialectales.
3. **Validación editorial** antes de publicar filas en `textos_localizados` (campo `codigo_acento`).

Cada expresión incluye un **tier de moderación** alineado con el schema:

| Tier | Audiencia | Tono |
|---|---|---|
| **1** | Infantil (default) | Cálido, claro, sin vulgaridad ni clasismo |
| **2** | Adolescente + humor parental | Más callejero, ironía, referencias cotidianas |
| **3** | Stand-up adulto | Sátira fuerte; nunca en SEO ni metadatos públicos |

---

## 2. Principio de oro: autenticidad sin sobreactuación

El acento **no** se logra saturando modismos. Se logra con tres capas:

1. **Densidad controlada:** máximo **2–4 marcas dialectales por párrafo** (no por frase).
2. **Situación local:** trancón, TransMilenio, corrientazo, visor/tablet, hora del nono.
3. **Doble audiencia:** el niño entiende la trama; el adulto capta el chiste de cotidianidad.

### Checklist anti-caricatura (revisar cada página)

- [ ] ¿El niño entiende la acción sin conocer la jerga?
- [ ] ¿Hay máximo 3–4 modismos en el párrafo?
- [ ] ¿La moraleja sigue clara?
- [ ] ¿Evité insultos, clasismo, vulgaridad y burla a barrios/estratos?
- [ ] ¿Suena a **una voz coherente**, no a diccionario de slang?
- [ ] ¿El tier de la página coincide con las palabras usadas?

### Señales de sobreactuación (evitar)

```
❌ "Parce, mi rey, ah carachas, qué boleta, el pelafustán está chirriado, veci, la plena..."
✅ "Ah carachas, mi rey — otra vez pelafusteando. Si sigue chirriado, mañana la boleta está dura."
```

---

## 3. Códigos de acento (`codigo_acento`)

Valores recomendados para la BD, de menor a mayor carga dialectal:

| `codigo_acento` | Registro | Uso en MVP |
|---|---|---|
| `neutro` | Español estándar latinoamericano | Narrador base, fallback |
| `bogota_rolo` | Bogotano cotidiano (mezcla rolo + cachaco) | Acento familiar, generaciones mixtas |
| `bogota_cachaco` | Rolo tradicional / generacional | Abuelos, nostalgia, tier 1–2 |
| `bogota_ninos` | Ñero/barrio actual suavizado, 5–10 años | **Default tier 1** — vocabulario de hoy |
| `bogota_gomelo` | Bogotá alto estrato / juvenil | Contraste cómico, tier 1–2 |
| `bogota_nero_lite` | Calle bogotana suavizada | Personajes adultos cómicos, tier 1–2 |
| `costa_caribe` | Costeño (futuro) | Segundo acento post-MVP |
| `paisa` | Antioqueño (futuro) | Tercer acento post-MVP |

**MVP:** publicar primero `neutro` + `bogota_rolo`. Los demás cuando haya QA editorial.

---

## 4. Registros bogotanos

> **Ojo editorial:** no todo lo que suena "bogotano" es lo mismo. Hay tres capas distintas. Mezclarlas hace que un cuento ñero suene a abuelo cachaco.

| Capa | `codigo_acento` | Quién lo dice hoy | Ejemplos |
|---|---|---|---|
| **Ñero / barrio actual** | `bogota_ninos`, `bogota_nero_lite` | Niños, jóvenes, barrio, 2020s | parce, pilas, boleta, melo, de una, bacano, en serio |
| **Rolo mixto** | `bogota_rolo` | Familia bogotana general | parce, pilo, boleta, full, TransMilenio |
| **Rolo cachaco** | `bogota_cachaco` (o rolo tier cachaco) | Abuelos, papás nostálgicos, humor generacional | nono, ah carachas, pelafustán, chirriado, enguayabado, chino |

### Palabras mal ubicadas (corrección de equipo)

| Palabra | No es ñero actual | Es rolo cachaco | Alternativa ñero/ninos |
|---|---|---|---|
| **nono** | ✓ | ✓ | a dormir, a la cama, irse a dormir |
| **pelafustear** | ✓ | ✓ | dar vueltas, enredar, no hacer caso |
| **chirriado** | ✓ | ✓ | bravo, molesto, enojado |
| **ah carachas** | ✓ | ✓ | en serio?, uy no, qué |
| **enguayabado** | ✓ | ✓ | con sueño, mamado de sueño |
| **chino** (niño) | parcial | ✓ | niño, parce pequeño, el menor |

---

### 4.1 Rolo (`bogota_rolo`) — acento familiar mixto

Bogotano estándar. Mezcla natural: papá puede sonar cachaco, niños más actuales. Usar palabras cachacas solo en diálogo de adultos mayores o en variante rolo explícita.

#### Glosario rolo universal — tier 1

| Expresión | Significado | Ejemplo en cuento |
|---|---|---|
| **parce / parcero** | Amigo, compañero | "Parce, ya es hora." |
| **chévere / bacano** | Bueno, agradable | "Qué bacano el cuento de hoy." |
| **guácala** | Rechazo cómico | "¡Guácala, eso es brócoli!" |
| **boleta** | Problema, lío | "Mañana hay boleta en el colegio." |
| **pilo/a** | Listo, despierto | "Ni pilo." |
| **fresco** | Tranquilo | "Quedó fresco." |
| **qué pena** | Disculpa ligera | "Qué pena, se nos pasó la hora." |
| **harto** | Mucho | "Con harto sueño." |
| **de una** | De acuerdo, listo | "De una, apagamos el visor." |
| **mi rey** | Trato cariñoso | "Listo, mi rey." |

#### Glosario rolo cachaco — solo en `bogota_rolo` (adultos / nostalgia)

| Expresión | Significado | Alternativa ñero/ninos |
|---|---|---|
| **nono** | Dormir | a dormir, a la cama |
| **chino/a** | Niño pequeño (cariñoso) | el menor, parce pequeño |
| **ah carachas** | Sorpresa | ¿en serio?, uy no |
| **pelafustán** | Andar sin rumbo | dar vueltas, enredar |
| **chirriado** | Enojado | bravo, molesto |
| **enguayabado** | Con sueño | con harto sueño |
| **sumercé** | Usted (respeto) | — |

#### Glosario rolo — tier 2

| Expresión | Significado | Nota |
|---|---|---|
| **mamar gallo** | Bromear, no hacer caso | Tier 1 alternativa: "hacer el payaso" |
| **berraco/a** | Increíble, fuerte | Tier 1 alternativa: "súper" |
| **una chimba** | Algo muy bueno | Tier 1 alternativa: "una belleza" |
| **me enguayabé** | Me dormí / me ganó el sueño | Contexto adulto cómico |
| **dar papaya** | Dejarse en evidencia | Metáfora, explicar con contexto |
| **papaya partida** | Situación vulnerable | Solo tier 2+, con cuidado |
| **jeta** | Cara / descaro | "Con esa jeta de que no tiene sueño" |
| **la media hora** | Mucho tiempo | "Pelafusteó la media hora" |

#### Situaciones bogotanas (sin jerga extra)

- Trancón en la **Autopista Norte** o la **calle 100**
- **TransMilenio** lleno a la hora pico; **buses** y **SITP** en la avenida
- **Corrientazo** del barrio
- Lluvia de las **5 pm**
- "Subir el cerro" (cuesta, esfuerzo)
- Oleaje en estación, paradero cerca del edificio

---

### 4.2 Gomelo (`bogota_gomelo`) — ironía de estrato

Contraste cómico para padres. El niño sigue entendiendo la historia.

| Expresión | Tier | Uso natural |
|---|---|---|
| **man** | 1–2 | "Man, ya son las ocho." |
| **parchar** | 1–2 | "Parchar con el tablet" |
| **vacano** | 1 | "Qué vacano el robot de la casa." |
| **full** | 1–2 | "Full cansado." |
| **literal** | 2 | "Literal no hay caso." |
| **estar en otra** | 1 | Niño distraído con pantalla — ideal tier 1 |
| **qué heavy** | 2 | "Qué heavy el trancón espacial." |
| **random** | 2 | Usar con moderación (muletilla gastada) |
| **cringe** | 3 | Solo tier 3 |

**Reglas gomelo:**
- No ridiculizar al personaje por ser gomelo.
- Máximo **1 anglicismo por párrafo**.
- Funciona mejor en **diálogo de papá/mamá**, no en narrador omnisciente.

---

### 4.3 Ñero lite (`bogota_nero_lite`) — barrio actual, humor parental

Energía de barrio **de hoy**. Sin palabras cachacas. Tier 2. Ideal para papás/mamás que suenan al barrio real.

| Ñero actual (tier 1–2) | Más callejero (tier 2) | Significado |
|---|---|---|
| parce | veci | amigo |
| en serio | la plena | ¿de verdad? |
| bacano | chimba | algo bueno |
| boleta | boleta | problema |
| pilas | pilas | atento |
| melo | melo | bien, sin problema |
| duro | duro | difícil / pesado |
| dar vueltas | enredar | no hacer caso |
| bravo / molesto | — | enojado (no "chirriado") |
| a dormir / a la cama | pa la cama | ir a dormir (no "nono") |
| camellar | camellar | trabajar duro |
| mamar gallo | mamar gallo | bromear (tier 2) |

**Regla ñero:** prohibido mezclar con cachaco en la misma variante (`nono`, `ah carachas`, `pelafustán`, `chirriado`).

---

### 4.4 Niños 5–10 (`bogota_ninos`) — ñero actual, bajo calibre

Vocabulario que un niño bogotano **usa y escucha hoy**: en el colegio, con amigos, con papás jóvenes. Tier 1. Frases cortas. **Sin cachaco.**

#### Glosario permitido

| Expresión | Significado | Nota |
|---|---|---|
| **parce / parces / parceero** | Amigo, compañero | Universal hoy; *parceero* más enfático |
| **bacano / chévere / chimba** | Bueno, cool | *Chimba* intercambiable con *bacano* en tier 1 |
| **bro** | Hermano, compa (niños/jóvenes) | Entre hermanos o amigos del colegio |
| **mijo** | Cariño de papá/mamá al niño | Diálogo de adultos: "Duérmanse, mijo" |
| **pilas** | Atento | "Pilas con la hora" |
| **boleta** | Problema, enredo | Con contexto claro |
| **fresco / melo** | Bien, sin problema | "Quedó melo" |
| **de una** | Listo, de acuerdo | Muy usado |
| **listo** | OK, ya | Universal |
| **duro** | Difícil, pesado | "El trancón está duro" |
| **en serio?** | ¿De verdad? | Reemplaza "ah carachas" |
| **bravo / molesto** | Enojado | Reemplaza "chirriado" |
| **dar vueltas** | Ir de un lado a otro sin hacer caso | Reemplaza "pelafustear" |
| **a dormir / a la cama** | Ir a dormir | Reemplaza "nono" |
| **harto** | Mucho | "Con harto sueño" |

#### No usar en `bogota_ninos`

**Cachaco:** `nono`, `ah carachas`, `pelafustear`, `chirriado`, `enguayabado`, `chino`, `sumercé`.  
**Calle pesado:** `veci`, `la plena`, `jeta`, `mamar gallo`, `dar papaya`, `ese man`, groserías.  
**Rebuscado:** palabras que el niño no diría en el 2020s.

#### Densidad

**1–2 modismos por párrafo.** Priorizar claridad sobre sabor.

#### Ejemplo (misma escena, tres registros)

| Acento | Texto |
|---|---|
| `neutro` | Los dos hermanos no querían apagar el visor para ir a dormir. |
| `bogota_ninos` | Los dos parces no querían apagar el visor para ir a dormir. Pilas: ya era tarde. |
| `bogota_rolo` | Los dos chinos no querían apagar el visor para ir a hacer nono. Ah carachas, otra vez pelafusteando. |
| `bogota_nero_lite` | Parce, pilas: si no apagan ese visor, mañana la boleta está dura. |

---

## 5. Frases bogotanas clásicas (detalle editorial)

Expresiones que dan sabor rolo auténtico. Incluyen las que el equipo identificó como prioritarias.

### Mi rey

| Campo | Detalle |
|---|---|
| **Significado** | Trato cariñoso, a veces irónico-suave. "Listo, mi rey." |
| **Tier** | 1 (con tono cálido) · 2 (irónico hacia adulto que no coopera) |
| **Función en cuento** | Papá/mamá al niño, o adulto a adulto en escena cómica |
| **Cuidado** | Puede sonar condescendiente si se abusa. Máx. 1 vez por escena |
| **Ejemplo tier 1** | "Listo mi rey, última página y a hacer nono." |
| **Ejemplo tier 2** | "Ay mi rey, otra vez con el visor a las nueve." |

### Ah carachas

| Campo | Detalle |
|---|---|
| **Registro** | **Rolo cachaco** — no ñero actual |
| **Significado** | Sorpresa, resignación cómica, "no me digas" |
| **Alternativa ñero/ninos** | "¿En serio?", "Uy no", "¿Qué?" |
| **Tier** | 1–2 en `bogota_rolo` |
| **Ejemplo cachaco** | "¿Ah carachas? ¿Ahora el robot también tiene sueño?" |

### Pelafustán / pelafustear

| Campo | Detalle |
|---|---|
| **Registro** | **Rolo cachaco** — no ñero actual |
| **Significado** | Andar sin rumbo; dar largas |
| **Alternativa ñero/ninos** | "Dar vueltas", "enredar", "no hacer caso" |
| **Ejemplo cachaco** | "{{niño_1}} llevaba diez minutos pelafusteando entre el baño y la sala." |

### Chirriado

| Campo | Detalle |
|---|---|
| **Registro** | **Rolo cachaco** — no ñero actual |
| **Significado** | Enojado, de mal genio |
| **Alternativa ñero/ninos** | "Bravo", "molesto", "enojado" |
| **Ejemplo cachaco** | "Se puso chirriado cuando apagaron el visor." |

### Nono

| Campo | Detalle |
|---|---|
| **Registro** | **Rolo cachaco** — no ñero actual |
| **Significado** | Dormir (coloquial infantil generacional) |
| **Alternativa ñero/ninos** | "A dormir", "a la cama", "irse a dormir" |
| **Ejemplo cachaco** | "Listo mi rey, última página y a hacer nono." |

### Otras frases bogotanas recomendadas

| Frase | Significado | Tier | Cuándo usarla |
|---|---|---|---|
| **¡Ahí te gano!** | "Te superé" / "te gané" (juego) | 1 | Escenas de juego antes de dormir |
| **Quedó mal** | Quedó mal parado, incómodo | 1–2 | Moraleja social (Escuadrón Recreo) |
| **Qué boleta** | Qué problema | 1–2 | Papá ante desastre doméstico leve |
| **Hacer el oso** | Pasar vergüenza | 2 | Bullying / vergüenza escolar |
| **Quedar fresco** | Quedar bien, sin problema | 1 | Desenlace tranquilo |
| **Pilas** | Atento | 1 | "Pilas con la hora." |
| **Enguayabado** | Con sueño | 1–2 | "El papá ya estaba enguayabado." |
| **Tocino** | Mentira / exageración | 2 | "Eso es puro tocino." |
| **Rumbiar** | Salir, divertirse | 2 | Evitar en cuentos de nono (confunde) |
| **Camellar** | Trabajar duro | 2 | Capitán Sancocho, adultos |

---

## 6. Misma escena en cuatro registros

**Situación:** {{niño_1}} y {{niño_2}} no quieren dormir.

| `codigo_acento` | Texto plantilla |
|---|---|
| `neutro` | "Los dos hermanos no querían apagar el visor para ir a dormir." |
| `bogota_ninos` | "Los dos parces no querían apagar el visor. Pilas: ya era hora de ir a dormir." |
| `bogota_rolo` | "Los dos chinos no querían apagar el visor para ir a hacer nono. Ah carachas, otra vez pelafusteando." |
| `bogota_gomelo` | "Man, los niños están full despiertos. Literal {{niño_1}} está en otra con el visor." |
| `bogota_nero_lite` | "Parce, pilas: si no apagan ese visor, mañana la boleta está dura. Y {{niño_2}} ya va chirriado." |

Solo cambian **2–4 piezas**; la trama es idéntica. Las imágenes (`paginas.imagen_url`) se comparten.

---

## 7. Lista roja (no usar o usar solo tier 3 con revisión legal)

| Categoría | Ejemplos | Motivo |
|---|---|---|
| Vulgaridad | groserías explícitas | Producto infantil + App Store/web |
| Clasismo | burla a barrios, estratos, colegios | Daña marca y audiencia |
| Estereotipo racial | caricatura de acentos afro/caribe mal hechos | Requiere autoría y sensibilidad |
| Drogas / alcohol | referencias directas | Tier 1 y 2 prohibido |
| Insultos a niños | "bobo", "idiota" hacia protagonistas | Pedagogía contradictoria |
| Sobre densidad | >5 modismos por párrafo | Caricatura |

---

## 8. Prompt de sistema (bloque para Claude)

Copiar como anexo al prompt de `ContextoChacachon.md` al generar `texto_plantilla`:

```
Eres escritor de cuentos infantiles colombianos con humor de doble audiencia.

Reglas de acento:
- codigo_acento recibido: {codigo_acento}
- tier_moderacion: {tier}
- Máximo 3–4 modismos por párrafo.
- Usa variables {{niño_1}} y {{niño_2}} sin reemplazarlas.
- El niño debe entender la trama sin conocer la jerga.
- Consulta GuiaAcentos.md para tier permitido por expresión.
- Prohibido: vulgaridad, clasismo, insultos a niños, sobredensidad de slang.

Marcas preferidas por acento:
- bogota_ninos: parce, parceero, pilas, bacano, chimba, boleta, melo, de una, en serio, duro, a dormir, dar vueltas, bravo, bro, mijo
- bogota_rolo: parce, nono, chino, boleta, ah carachas, pelafustán, chirriado, mi rey, enguayabado
- bogota_gomelo: man, full, literal, estar en otra, vacano
- bogota_nero_lite: parce, pilas, la plena, berraco (tier 2), mamar gallo (tier 2)
- neutro: sin modismos regionales
```

---

## 9. Relación con el schema SQL

Cada fila en `textos_localizados` debe respetar:

```sql
-- Ejemplo: misma página, dos acentos
INSERT INTO textos_localizados (pagina_id, codigo_acento, tier_moderacion, texto_plantilla)
VALUES
  ('...', 'neutro', 1, 'Los dos hermanos no querían apagar el visor...'),
  ('...', 'bogota_rolo', 1, 'Los dos chinos no querían hacer nono. Ah carachas, otra vez pelafusteando...');
```

**QA editorial:** antes de `estado = 'publicado'` en `cuentos`, validar cada `texto_plantilla` contra esta guía.

---

## 10. Próximos acentos (borrador)

Cuando se expanda el catálogo, crear secciones equivalentes para:

- `costa_caribe` — melodía y "vea pues", "mi amor", "¿qué más?"
- `paisa` — "ome", "pues", ritmo antioqueño
- `caleño` — ritmo cantadito, "¿qué hubo?"

No mezclar marcas de costa y bogotá en el mismo personaje sin justificación narrativa.

---

*Documento vivo. Ampliar con cada cuento publicado y feedback de lecturas en voz alta.*
