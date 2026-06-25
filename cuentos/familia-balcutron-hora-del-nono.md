# Cuento base MVP — Familia Balcutron: La hora del nono

> **Cuento piloto** para validar tono, paginación, acentos e interpolación de nombres.  
> Inspiración nostálgica: *Los Supersónicos* (familia futurista, robot, vehículo volador).  
> **Versión ñero:** misma familia del futuro, pero contada como si vivieran en un barrio bogotano que levitó a la Vía Láctea.  
> **IP original:** Familia Balcutron — sin referencias a franquicias.  
> **Moraleja:** `dormir` · **Slug:** `familia-balcutron-hora-del-nono`

---

## Por qué este cuento primero

| Criterio | Por qué funciona |
|---|---|
| Nostalgia 80/90 | Familia futurista + robot + carro volador = Los Supersónicos sin copiar |
| Dolor actual | Resistencia a dormir + pantallas = misma batalla de hoy con otro disfraz |
| Doble audiencia | Trancón espacial = trancón de Bogotá; tablet de juego = celular/tablet |
| Guía de acentos | Nono, pelafustán, chirriado, ah carachas encajan naturales |
| MVP técnico | 10 páginas, 2 acentos, 2 variables — ideal para probar el reader |

**Personajes fijos (no interpolados):**

- **Comandante Raka** — papá, piloto del platillo naranja. Repara todo en la casa y tiene experimentos raros en el taller.
- **Teniente Pauleta** — mamá, ingeniera de la nave. Jefa de la casa; dobla ropa y pelea para que los niños anden descalzos.
- **Unit-7 "Sietecito"** — robot doméstico, cómico, siempre malinterpreta órdenes.
- **Bingochon** — perro comprado en Temu; parece de peluche barato pero ladra de verdad.
- **Mora** — perrita callejera miedosa; la nave también es color mora.
- **Abuelos Balcutron** — viven en una nave cerquita de la casa-nave.
- **Nicolai** / **Chimonchin** — hermanos (en cuento: `{{niño_1}}` / `{{niño_2}}`).

### Los Supersónicos en clave ñero (para el adulto)

| Supersónicos | Familia Balcutron ñero | Chiste de fondo |
|---|---|---|
| George Jetson | Comandante Raka | Papá que camella todo el día y llega al trancón espacial |
| Jane Jetson | Teniente Pauleta | La que manda en la nave y dice "ya es hora del nono" |
| Judy y Elroy | {{niño_1}} y {{niño_2}} | Los parces pequeños pegados al tablet |
| Rosie la robot | Sietecito | El doméstico que la embarrada con buena intención |
| Carro volador | Platillo naranja | Taxi espacial del barrio, pitos láser incluidos |
| Ciudad flotante | Trancón calle 100 galáctico | Mismo estrés, otro universo |

**Regla de voz ñero:** el narrador y los papás llevan el registro. Los niños hablan más simple — así no caricaturizamos a {{niño_1}} y {{niño_2}}.

### Versión niños 5–10 (`bogota_ninos`)

Ñero/barrio **actual**, bajo calibre: lo que un niño bogotano dice y escucha hoy. Tier 1. **Sin cachaco.**

| Sí usar (ñero actual, fácil) | Reservado para `bogota_rolo` (cachaco) |
|---|---|
| parce, parces, pilas, bacano | nono → **a dormir** |
| boleta, melo, fresco, de una | ah carachas → **¿en serio?** |
| duro, listo, en serio?, harto | pelafustear → **dar vueltas** |
| bravo, molesto, a la cama | chirriado → **bravo / molesto** |

**Densidad:** 1–2 modismos por párrafo.

---

## Metadata (tabla `cuentos`)

```yaml
slug: familia-balcutron-hora-del-nono
titulo_interno: Familia Balcutron 01 — La hora del nono
titulo_publico: La hora del nono en la Vía Láctea
moraleja_tag: dormir
personaje_ip: familia_balcutron
paginas: 10
acentos_mvp: [neutro, bogota_rolo, bogota_ninos, bogota_nero_lite]
tier_default: 1
tier_ninos: 1   # 5–10 años; acento default recomendado para co-lectura
tier_nero: 2    # humor parental; PIN si se publica mezclado con tier 1
estado: borrador_ejemplo
```

---

## Páginas

### Página 1 — El trancón intergaláctico

**Ilustración:** Platillo volador naranja con burbuja de cabina transparente, atascado en una fila de naves. Neón, estilo sticker Panini. Comandante Raka con manos en el volante, cara de cansancio.

| `codigo_acento` | `texto_plantilla` |
|---|---|
| `neutro` | En el año 3026, la Familia Balcutron volvía a casa después de un día larguísimo. Su platillo avanzaba… muy despacio. Había un trancón intergaláctico frente a la salida 14 de la Vía Láctea. |
| `bogota_rolo` | En el año 3026, la Familia Balcutron venía de regreso a la casa después de un día larguísimo, parce. El platillo iba… pilo despacio. Había un trancón intergaláctico monumental frente a la salida 14 de la Vía Láctea — peor que un lunes en TransMilenio. |
| `bogota_ninos` | En el año 3026, la Familia Balcutron volvía a la casa después de un día largo, parce. El platillo iba muy despacio. Había un trancón en el espacio. Más lento que cuando el bus va lleno. Estaba duro. |
| `bogota_nero_lite` | Año 3026, veci. La Familia Balcutron venía camellando todo el día y el platillo iba más lento que domingo en la Autopista Norte. Trancón intergaláctico en la salida 14 de la Vía Láctea — la plena, peor que la calle 100 un lunes a las seis. El Comandante Raka ya iba con la jeta de cansancio. |

---

### Página 2 — Los tablets encendidos

**Ilustración:** Interior del platillo. {{niño_1}} y {{niño_2}} con tablets de juego brillantes en las manos. Teniente Pauleta mira el reloj flotante: 20:30.

| `codigo_acento` | `texto_plantilla` |
|---|---|
| `neutro` | En el asiento trasero, {{niño_1}} y {{niño_2}} no miraban por la ventana. Tenían puestos sus tablets de juego y seguían viendo el mismo juego por quinta vez. |
| `bogota_rolo` | En la silla de atrás, {{niño_1}} y {{niño_2}} ni miraban por la ventana. Tenían los tablets de juego full encendidos, viendo el mismo juego por quinta vez. Ni pilo. |
| `bogota_ninos` | Atrás iban {{niño_1}} y {{niño_2}}. No miraban por la ventana, parce. Tenían los tablets prendidos, con el mismo juego otra vez. Y otra vez. Pegados a la pantalla. |
| `bogota_nero_lite` | Atrás, {{niño_1}} y {{niño_2}} ni piro la ventana, veci. Visores prendidos, mismo juego por quinta vez, dándole duro al planeta morado. Los muchachos no estaban pilas con la hora — estaban pilas con la pantalla. |

---

### Página 3 — Anuncio de la hora del nono

**Ilustración:** Teniente Pauleta se inclina hacia atrás, gesto firme pero cariñoso. Comandante Raka asiente. Sietecito aparece en una esquina con una almohada bajo el brazo.

| `codigo_acento` | `texto_plantilla` |
|---|---|
| `neutro` | —Ya es hora del nono —dijo Teniente Pauleta—. Cuando lleguemos, tablets apagados y directo a las cápsulas de dormir. —¿Incluso si el trancón dura la media hora? —preguntó {{niño_1}}. —Especialmente si dura la media hora —respondió el Comandante Raka. |
| `bogota_rolo` | —Listo, mi rey, mi reina: ya es hora del nono —dijo Teniente Pauleta—. Cuando lleguemos, tablets apagados y directo a las cápsulas. —¿Ah carachas? ¿Incluso si el trancón dura la media hora? —preguntó {{niño_1}}. —Especialmente si dura la media hora —dijo el Comandante Raka, con cara de trancón en la Autopista Norte. |
| `bogota_ninos` | —Parces, pilas: ya es hora de ir a dormir —dijo mamá Teniente Pauleta—. Cuando lleguemos, apagan los tablets y van directo a la cama. —¿En serio? ¿Aunque el trancón tarde mucho? —preguntó {{niño_1}}. —En serio, parce —dijo papá Comandante Raka—. Sobre todo si tarda mucho. |
| `bogota_nero_lite` | —Parces, pilas: ya es hora de ir a dormir —sentenció Teniente Pauleta, la jefa de la nave—. Llegamos y fue tablets abajo, directo a las cápsulas. Sin vueltas. —¿En serio? ¿Incluso si el trancón dura la media hora? —preguntó {{niño_1}}. —La plena, veci: especialmente si dura la media hora —dijo el Comandante Raka, con cara de taxista en pico y placa. |

---

### Página 4 — La gran excusa

**Ilustración:** {{niño_2}} levanta un dedo, expresión de negociador experto. Burbuja de texto: "solo 5 minutos más".

| `codigo_acento` | `texto_plantilla` |
|---|---|
| `neutro` | —Solo cinco minutos más —pidió {{niño_2}}—. Es que el Capitán Nebulosa casi gana el nivel del planeta morado. —Cinco minutos en el espacio son tres años en la Tierra —dijo Sietecito, sin entender nada pero sonando convincente. |
| `bogota_rolo` | —Parce, solo cinco minutos más —pidió {{niño_2}}—. Es que el Capitán Nebulosa casi le gana al jefe del planeta morado. —Cinco minutos en el espacio son tres años en la Tierra —dijo Sietecito, mamar gallo sin querer, pero sonando berraco de convencido. |
| `bogota_ninos` | —Parce, solo cinco minuticos más —pidió {{niño_2}}—. Es que el Capitán Nebulosa casi gana el nivel del planeta morado. —Cinco minutos aquí son muchísimo en la Tierra —dijo Sietecito, hablando raro pero muy seguro. |
| `bogota_nero_lite` | —Solo cinco minuticos más —pidió {{niño_2}}—. Es que el Capitán Nebulosa casi le gana al jefe del planeta morado. —Cinco minutos acá son tres años en la Tierra —dijo Sietecito, mamar gallo puro, pero sonando berraco de convencido. El Comandante Raka lo miró: —Este robot sí da papaya con esas ocurrencias. |

> **Nota tier:** "mamar gallo" = tier 2. Para tier 1 estricto usar: *"bromeando sin querer"*.

---

### Página 5 — Pelafustán espacial

**Ilustración:** {{niño_1}} baja del platillo ya estacionado (nave-casa con forma de domo). Camina en círculos: sala → cocina → sala. Sietecito lo sigue con una toalla.

| `codigo_acento` | `texto_plantilla` |
|---|---|
| `neutro` | Por fin llegaron. {{niño_1}} apagó el tablet… pero en lugar de ir a la cápsula, empezó a caminar de un lado a otro: sala, cocina, sala otra vez. Llevaba diez minutos dando vueltas sin rumbo. |
| `bogota_rolo` | Por fin llegaron. {{niño_1}} apagó el tablet… pero en vez de ir a la cápsula, se puso a pelafustear: sala, cocina, sala otra vez. Diez minutos dando vueltas, parce. Ni pilo. |
| `bogota_ninos` | Por fin llegaron a la casa-nave. {{niño_1}} apagó el tablet… pero se puso a dar vueltas: sala, cocina, sala otra vez. No hacía caso. Pilas, parce: ¡ya era hora de ir a la cama! |
| `bogota_nero_lite` | Por fin llegaron a la nave-casa. {{niño_1}} apagó el tablet… y se puso a dar vueltas, veci: sala, cocina, sala otra vez. Diez minutos enredando sin ir a la cápsula. —Ese parce está duro de ir a dormir —murmuró el Comandante Raka—. Puro enredo intergaláctico. |

---

### Página 6 — Chirriado en órbita

**Ilustración:** {{niño_2}} sentado en el suelo, brazos cruzados, mejillas infladas. Visor apagado pero cara de protesta. Teniente Pauleta suspira con ternura.

| `codigo_acento` | `texto_plantilla` |
|---|---|
| `neutro` | {{niño_2}} no pelafusteaba. Se sentó en el suelo, cruzó los brazos y dijo: —No tengo sueño. Ninguno. Cero. —Se veía de mal genio, como cuando le cambian el final de un cuento. |
| `bogota_rolo` | {{niño_2}} no pelafusteaba. Se sentó en el piso, cruzó los brazos y dijo: —No tengo sueño. Ninguno. Cero. —Quedó chirriado, parce, como cuando le cambian el final de un cuento favorito. |
| `bogota_ninos` | {{niño_2}} se sentó en el piso, cruzó los brazos y dijo: —No tengo sueño. Ninguno. Cero. —Quedó bravo, parce, molesto como cuando le cambian el final de un cuento favorito. |
| `bogota_nero_lite` | {{niño_2}} no enredaba. Se plantó en el piso, brazos cruzados, y soltó: —No tengo sueño. Ninguno. Cero. —Quedó molesto, veci, con cara de protesta. Teniente Pauleta suspiró: —En serio, parce… con esa cara no duerme ni el trancón. |

---

### Página 7 — Sietecito al rescate (y al enredo)

**Ilustración:** Sietecito proyecta en el aire un monstruo gigante de luz verde amigable. Los niños lo miran sorprendidos. Comandante Raka hace gesto de "para, para".

| `codigo_acento` | `texto_plantilla` |
|---|---|
| `neutro` | Sietecito quiso ayudar. Activó su "Modo Historia de Terror Suave" para que los niños tuvieran miedo de estar despiertos solos. Pero el monstruo de luz era tan tierno que {{niño_1}} y {{niño_2}} empezaron a reírse. —¡Qué boleta! —dijo Teniente Pauleta—. Eso no ayuda, Sietecito. |
| `bogota_rolo` | Sietecito quiso ayudar. Prendió el "Modo Historia de Terror Suave" para que los chinos tuvieran miedo de quedarse despiertos solos. Pero el monstruo de luz era tan tierno que {{niño_1}} y {{niño_2}} se pusieron a reírse. —¡Ah carachas, qué boleta! —dijo Teniente Pauleta—. Eso no ayuda, Sietecito. |
| `bogota_ninos` | Sietecito quiso ayudar. Prendió un monstruo de susto para que los niños tuvieran miedo y fueran a dormir. Pero el monstruo salió tan bobo y tierno que {{niño_1}} y {{niño_2}} se rieron a carcajadas. —¿En serio? ¡Qué boleta! —dijo mamá—. Eso no ayuda, Sietecito. |
| `bogota_nero_lite` | Sietecito quiso ayudar y prendió el "Modo Terror Suave" para asustar a los muchachos. Pero el monstruo de luz salió tan bobo y tierno que {{niño_1}} y {{niño_2}} se echaron a reír. —En serio, veci, qué boleta —dijo Teniente Pauleta—. Sietecito, usted sí sabe embarrarla con buena intención. |

---

### Página 8 — La misión secreta

**Ilustración:** Comandante Raka se arrodilla a altura de los niños. Les muestra un mapa flotante con estrellas y una ruta punteada hacia camas con forma de cápsula espacial.

| `codigo_acento` | `texto_plantilla` |
|---|---|
| `neutro` | Entonces el Comandante Raka tuvo una idea. —Escuchen, exploradores. La misión de esta noche se llama Operación Nono. Si {{niño_1}} y {{niño_2}} llegan a sus cápsulas antes de que Sietecito cuente hasta cien, ganan la Medalla del Cometa Dormilón. —¿Y qué gana uno? —preguntó {{niño_1}}. —Mañana elegir el desayuno espacial —dijo Teniente Pauleta, guiñándole un ojo. |
| `bogota_rolo` | Entonces el Comandante Raka tuvo una chimba de idea. —Escuchen, exploradores. La misión de esta noche: Operación Nono. Si {{niño_1}} y {{niño_2}} llegan a las cápsulas antes de que Sietecito cuente hasta cien, ganan la Medalla del Cometa Dormilón. —¿Y qué se gana? —preguntó {{niño_1}}. —Mañana escogen el desayuno espacial —dijo Teniente Pauleta, guiñándole un ojo. De una. |
| `bogota_ninos` | Entonces papá tuvo una idea bacana. —Escuchen, parces exploradores. La misión de hoy se llama Operación A Dormir. Si {{niño_1}} y {{niño_2}} llegan a la cama antes de que Sietecito cuente hasta cien, ganan la Medalla del Cometa Dormilón. —¿Y cuál es el premio? —preguntó {{niño_1}}. —Mañana escogen el desayuno —dijo mamá, guiñándole un ojo. —De una —dijeron los dos. |
| `bogota_nero_lite` | Entonces el Comandante Raka tuvo una chimba de idea, veci. —Escuchen, parces exploradores. Misión de esta noche: Operación A Dormir. Si {{niño_1}} y {{niño_2}} caen en las cápsulas antes de que Sietecito cuente hasta cien, se ganan la Medalla del Cometa Dormilón. —¿Y qué hay de premio? —preguntó {{niño_1}}. —Mañana escogen el desayuno espacial —dijo Teniente Pauleta—. De una, parce. Negociación cerrada. |

> **Nota tier:** "chimba" = tier 2. Tier 1: *"una buena idea"* o *"una bacana idea"*.

---

### Página 9 — Carrera suave hacia el sueño

**Ilustración:** {{niño_1}} y {{niño_2}} caminan en pijama espacial hacia cápsulas con luces tenues azules. Sietecito cuenta en voz alta: "noventa y siete, noventa y ocho…". Padres se abrazan al fondo.

| `codigo_acento` | `texto_plantilla` |
|---|---|
| `neutro` | {{niño_1}} y {{niño_2}} corrieron… despacio. Sin tablets. Sin juegos. Solo el zumbido suave de la nave y la voz de Sietecito: —Noventa y nueve… —Se metieron en las cápsulas justo cuando dijo: —¡Cien! Misión cumplida. |
| `bogota_rolo` | {{niño_1}} y {{niño_2}} corrieron… pilo despacio. Sin tablets. Sin juegos. Solo el zumbido de la nave y Sietecito contando: —Noventa y nueve… —Cayeron en las cápsulas justo en el —¡cien! Misión cumplida, parce. Quedó fresco. |
| `bogota_ninos` | {{niño_1}} y {{niño_2}} corrieron despacito. Sin tablets. Sin juegos. Solo el zumbido de la nave y Sietecito: —Noventa y nueve… —¡Cien! Cayeron en la cama. Misión cumplida. Quedó melo, parce. |
| `bogota_nero_lite` | {{niño_1}} y {{niño_2}} corrieron… sin afán pero sin dar papaya. Visores apagados, juego pausado. Solo el zumbido de la nave y Sietecito: —Noventa y nueve… —Cayeron en las cápsulas en el —¡cien! Misión cumplida, veci. Quedó fresco. Los papás respiraron. |

---

### Página 10 — Todos en nono (desenlace + moraleja)

**Ilustración:** Vista aérea de las cápsulas con niños dormidos, luz de estrellas por la ventana del domo. Comandante Raka y Teniente Pauleta en el pasillo, cansados pero sonriendo. Sietecito se "apaga" con un clic y ojitos cerrados.

| `codigo_acento` | `texto_plantilla` |
|---|---|
| `neutro` | En pocos minutos, {{niño_1}} y {{niño_2}} ya respiraban hondo. El Comandante Raka apagó las luces del pasillo. —Operación Nono: exitosa —susurró Teniente Pauleta. Y así aprendieron que dormir no es perderse la diversión: es cargar energía para la próxima aventura. Fin de la transmisión. |
| `bogota_rolo` | En pocos minutos, {{niño_1}} y {{niño_2}} ya roncaban suavecito. El Comandante Raka apagó las luces. —Operación Nono: exitosa —susurró Teniente Pauleta, toda enguayabada pero feliz. Y así los chinos aprendieron que hacer nono no es perderse la diversión: es cargar batería para la próxima aventura. Fin de la transmisión, mi rey. |
| `bogota_ninos` | Al ratito, {{niño_1}} y {{niño_2}} ya dormían profundo. Papá apagó las luces. —Operación A Dormir: lista —susurró mamá, con harto sueño pero contenta. Aprendieron que ir a dormir no es aburrido: es recargar energía para jugar mañana. Buenas noches, parce. |
| `bogota_nero_lite` | En nada, {{niño_1}} y {{niño_2}} ya roncaban suavecito. El Comandante Raka apagó las luces del pasillo. —Operación A Dormir: exitosa, veci —susurró Teniente Pauleta, con harto sueño pero contenta. Y así los parces aprendieron que ir a dormir no es perderse la chimba del juego: es cargar batería pa' la próxima vuelta. Buenas noches, parce. |

---

## Capa de nostalgia (para el adulto, sin copiar)

Referencias que el **padre reconoce** pero el niño no necesita conocer:

| Elemento del cuento | Eco 80/90 | Adaptación generación actual |
|---|---|---|
| Familia en vehículo futurista | Los Supersónicos | Uber/platillo = carro familiar |
| Robot doméstico torpe | Rosie la robot | Alexa/Siri que no entiende |
| Trancón espacial | Ciudad flotante | Trancón Bogotá / Waze |
| Tabletes de juego | Pantallas espaciales de juego | Celular, tablet, videojuegos |
| "Cinco minutos más" | Episodio clásico de resistencia | Misma batalla de hoy |
| Cápsulas de dormir | Camas futuristas | Camas normales con disfraz espacial |
| Misión / medalla | Serial de acción 80s | Gamificación (misiones, logros) |

---

## Notas para producción

### Audio (ElevenLabs / voz humana)
- `bogota_ninos`: voz cálida de cuento nocturno; modismos suaves, ritmo pausado — **default recomendado 5–10 años**
- `bogota_rolo`: ritmo conversacional, no exagerar el acento
- `bogota_nero_lite`: papá cansado del barrio; mamá firme pero cariñosa; ritmo más seco, menos cantadito
- Sietecito: voz robótica que intenta sonar callejera y falla — *"veci, procesando…"*
- Comandante Raka: tono taxista espacial desde página 1

### Ilustración versión ñero (misma IP, más barrio)
- Platillo naranja con calcomanías espaciales tipo buseta del SITP
- Comandante Raka con gorra de conductor espacial
- Teniente Pauleta con delantal futurista — la jefa de la nave
- Sietecito con bandera colgando del brazo (como doméstico del barrio)
- Misma paleta Panini/neón; el barrio levitó, no cambió de universo visual

### Imágenes (Flux + LoRA `familia_balcutron`)
- Mantener paleta: naranja platillo, azul noche, neón rosa/cyan
- Misma cara de {{niño_1}}/{{niño_2}} en todas las páginas (genéricos en ilustración; nombres solo en texto)

### Interpolación en frontend
```typescript
// Entrada: perfiles = [{ nombre: "Mateo" }, { nombre: "Sofía" }]
texto.replace(/\{\{niño_1\}\}/g, perfiles[0].nombre)
     .replace(/\{\{niño_2\}\}/g, perfiles[1].nombre)
```

### Próximas variantes (post-MVP)
- [x] `bogota_ninos` — tier 1, edades 5–10, ñero actual (sin cachaco)
- [x] `bogota_nero_lite` — Los Supersónicos en clave barrio (tier 2)
- [ ] `bogota_gomelo` — diálogos del Comandante Raka
- [ ] `costa_caribe` — "mi amor", ritmo cantadito
- [ ] `bogota_nero_full` — tier 3 stand-up parental (PIN obligatorio)

---

## Validación contra GuiaAcentos.md

| Página | `bogota_ninos` (ñero actual) | ¿Pasa? |
|---|---|---|
| 1 | parce, duro | ✅ (2) |
| 3 | parces, pilas, en serio | ✅ (3) |
| 5 | dar vueltas, pilas, a la cama | ✅ (3) |
| 6 | bravo, molesto, parce | ✅ (3) |
| 7 | en serio, boleta | ✅ (2) |
| 8 | bacana, parces, de una | ✅ (3) |
| 9 | melo, parce | ✅ (2) |
| 10 | harto, parce, a dormir | ✅ (3) |

**Cachaco solo en `bogota_rolo`:** nono, ah carachas, pelafustear, chirriado, chino, enguayabado.

| Página | Modismos ñero adulto | ¿Pasa? |
|---|---|---|
| 1 | veci, camellar, la plena, calle 100, jeta | ✅ tier 2 |
| 4 | mamar gallo, berraco, dar papaya | ✅ tier 2 |
| 10 | chimba, veci | ✅ tier 2 |

**Nota producto:** `bogota_ninos` = **default tier 1** (5–10 años). `bogota_nero_lite` = tier 2 con PIN parental.

---

## Lectura continua — versión niños (`bogota_ninos`, páginas 1–4)

Para leer en voz alta con un niño de 5–10 años (ejemplo: Mateo y Sofía):

> En el año 3026, la Familia Balcutron volvía a la casa después de un día largo, parce. El platillo iba muy despacio. Había un trancón en el espacio. Más lento que cuando el bus va lleno. Estaba duro.
>
> Atrás iban Mateo y Sofía. No miraban por la ventana, parce. Tenían los tablets prendidos, con el mismo juego otra vez. Y otra vez. Pegados a la pantalla.
>
> —Parces, pilas: ya es hora de ir a dormir —dijo mamá Teniente Pauleta—. Cuando lleguemos, apagan los tablets y van directo a la cama. —¿En serio? ¿Aunque el trancón tarde mucho? —preguntó Mateo. —En serio, parce —dijo papá—. Sobre todo si tarda mucho.
>
> —Parce, solo cinco minuticos más —pidió Sofía—. Es que el Capitán Nebulosa casi gana el nivel del planeta morado.

### Mini-glosario para el lector (padre/madre)

| Palabra | Significado |
|---|---|
| **parce** | Amigo, compañero |
| **pilas** | Atento, despierto |
| **boleta** | Problema, enredo |
| **bacano** | Bueno, chévere |
| **melo** | Bien, sin problema |
| **duro** | Difícil, pesado (el trancón está duro) |
| **de una** | Listo, de acuerdo |
| **en serio?** | ¿De verdad? |
| **dar vueltas** | Ir de un lado a otro sin hacer caso |
| **bravo / molesto** | Enojado |
| **harto** | Mucho |

> **Nota:** `nono`, `ah carachas`, `pelafustear` y `chirriado` están en la versión **`bogota_rolo`** (cachaco), no en la de niños.

---

## Lectura continua — versión ñero adulto (páginas 1–3)

Para probar tono en voz alta (con Mateo y Sofía como ejemplo):

> Año 3026, veci. La Familia Balcutron venía camellando todo el día y el platillo iba más lento que domingo en la Autopista Norte. Trancón intergaláctico en la salida 14 de la Vía Láctea — la plena, peor que la calle 100 un lunes a las seis.
>
> Atrás, Mateo y Sofía ni piro la ventana. Visores prendidos, mismo juego por quinta vez. Los muchachos no estaban pilas con la hora — estaban pilas con la pantalla.
>
> —Parces, pilas: ya es hora de ir a dormir —sentenció Teniente Pauleta—. Llegamos y fue tablets abajo, directo a las cápsulas. —¿En serio? ¿Incluso si el trancón dura la media hora? —preguntó Mateo. —La plena, veci: especialmente si dura la media hora —dijo el Comandante Raka.

---

*Borrador de ejemplo — revisar en lectura en voz alta antes de insertar en Supabase.*
