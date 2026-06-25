#!/usr/bin/env node
/**
 * Resuelve un perfil familiar JSON en variables de plantilla.
 * Uso:
 *   node scripts/resolver-perfil.mjs
 *   node scripts/resolver-perfil.mjs perfiles/garcia-bogota.json
 *   node scripts/resolver-perfil.mjs perfiles/balcutron.json --fragmentos
 */

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

function loadJson(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

function pickAdulto(perfil, rol) {
  return perfil.adultos?.find((a) => a.rol === rol);
}

function pickNinos(perfil) {
  return [...(perfil.ninos ?? [])].sort(
    (a, b) => (a.orden ?? 99) - (b.orden ?? 99),
  );
}

function pickCercanoCuentos(perfil) {
  return perfil.cercanos?.find((c) => c.aparece_en_cuentos);
}

function pickAbuelos(perfil) {
  const cercanos = perfil.cercanos?.filter((c) => c.aparece_en_cuentos) ?? [];
  const abuela = cercanos.find((c) => c.relacion === "abuela");
  const abuelo = cercanos.find((c) => c.relacion === "abuelo");
  return { abuela, abuelo, cercanos };
}

export function resolverPerfil(perfil) {
  const ninos = pickNinos(perfil);
  const mama = pickAdulto(perfil, "mama");
  const papa = pickAdulto(perfil, "papa");
  const { abuela, abuelo } = pickAbuelos(perfil);
  const m1 = perfil.mascotas?.[0];
  const m2 = perfil.mascotas?.[1];
  const detalles = perfil.casa?.detalles ?? [];
  const colegio = perfil.extra?.colegio;

  const n1 = ninos[0];
  const n2 = ninos[1];

  const pantalla =
    n1?.pantallas?.que_usa ?? n2?.pantallas?.que_usa ?? "tablet";

  const juego =
    n1?.pantallas?.juego_favorito ??
    n2?.pantallas?.juego_favorito ??
    n1?.gustos?.juegos?.[0] ??
    "el juego";

  const colegioAnterior =
    colegio?.anterior ??
    n1?.extra?.colegio_anterior ??
    n2?.extra?.colegio_anterior ??
    "";

  const colegioActual =
    colegio?.actual ??
    n1?.extra?.colegio_actual ??
    n2?.extra?.colegio_actual ??
    "";

  let lugarCercano = "";
  if (abuela?.vive_cerca) {
    const quien = abuela.nombre ?? "la abuela";
    lugarCercano = `el apartamento de ${quien}`;
    if (abuela.extra?.detalle) {
      lugarCercano += ` — ${abuela.extra.detalle}`;
    }
  } else {
    const cercano = pickCercanoCuentos(perfil);
    if (cercano?.vive_cerca) {
      const quien = cercano.apodo ?? cercano.nombre ?? cercano.relacion;
      lugarCercano = `la casa de ${quien}`;
      if (cercano.extra?.detalle) {
        lugarCercano += ` — ${cercano.extra.detalle}`;
      }
    }
  }

  const mascotaTrait = (m) => {
    if (!m) return "";
    return m.personalidad ?? m.extra?.manana ?? "";
  };

  return {
    apellido_hogar: perfil.meta?.apellido_hogar ?? "la familia",
    ciudad: perfil.meta?.ciudad ?? "la ciudad",
    barrio: perfil.meta?.barrio ?? "",
    hogar: perfil.meta?.como_le_dicen_al_hogar ?? "la casa",
    acento: perfil.meta?.codigo_acento ?? "neutro",

    niño_1: n1?.apodo ?? n1?.nombre ?? "el mayor",
    niño_2: n2?.apodo ?? n2?.nombre ?? "el menor",
    niño_1_nombre: n1?.nombre ?? "",
    niño_2_nombre: n2?.nombre ?? "",

    mama: mama?.apodo ?? mama?.nombre ?? "mamá",
    papa: papa?.apodo ?? papa?.nombre ?? "papá",
    mama_nombre: mama?.nombre ?? "mamá",
    papa_nombre: papa?.nombre ?? "papá",
    mama_apodo: mama?.apodo ?? mama?.nombre ?? "mamá",
    papa_apodo: papa?.apodo ?? papa?.nombre ?? "papá",
    frase_mama: mama?.frases_tipicas?.[0] ?? "Ya es hora de dormir",
    frase_mama_2: mama?.frases_tipicas?.[1] ?? "Hagan caso",
    frase_mama_3: mama?.frases_tipicas?.[2] ?? "Los voy a castigar si no hacen caso",
    frase_papa: papa?.frases_tipicas?.[0] ?? "Duérmanse",
    frase_papa_2: papa?.frases_tipicas?.[1] ?? "Ya no más tablet",

    colegio_anterior: colegioAnterior,
    colegio_nuevo: colegioActual,
    colegio_actual: colegioActual,

    abuela_nombre: abuela?.nombre ?? "la abuela",
    abuelo_nombre: abuelo?.nombre ?? "el abuelo",

    mascota_1: m1?.nombre ?? "",
    mascota_2: m2?.nombre ?? "",
    mascota_1_trait: mascotaTrait(m1),
    mascota_2_trait: mascotaTrait(m2),
    mascota_1_descripcion: mascotaTrait(m1),
    mascota_2_descripcion: mascotaTrait(m2),

    pantalla_que_usan: pantalla,
    juego_favorito: juego,

    detalle_casa_1: detalles[0] ?? "",
    detalle_casa_2: detalles[1] ?? "",
    detalle_casa_3: detalles[2] ?? "",
    detalle_casa_4: detalles[3] ?? "",
    detalle_casa_5: detalles[4] ?? "",

    excusa_dormir_niño_1: n1?.no_le_gusta?.dormir ?? "",
    excusa_dormir_niño_2: n2?.no_le_gusta?.dormir ?? "",

    lugar_cercano: lugarCercano,

    checklist_noche:
      perfil.extra?.rutina_noche?.batallas
        ?.map((b) => b.texto)
        .join("; ") ?? "",
  };
}

export function interpolar(plantilla, variables) {
  return plantilla.replace(/\{\{([^}]+)\}\}/g, (_, key) => {
    const val = variables[key.trim()];
    if (val === undefined || val === null || val === "") {
      return `[falta:${key}]`;
    }
    return String(val);
  });
}

function main() {
  const args = process.argv.slice(2);
  const perfilPath = args[0]
    ? join(ROOT, args[0])
    : join(ROOT, "perfiles/balcutron.json");
  const conFragmentos = !args.includes("--solo-variables");

  const bundle = loadJson(perfilPath);
  const variables = resolverPerfil(bundle.perfil);

  console.log("═".repeat(60));
  console.log(`Perfil: ${bundle.nombre_display}`);
  console.log(`Archivo: ${perfilPath.replace(ROOT + "/", "")}`);
  console.log(`Completitud: ${bundle.completitud ?? "?"}%`);
  console.log("═".repeat(60));
  console.log("\n📋 Variables resueltas:\n");
  for (const [k, v] of Object.entries(variables)) {
    if (v) console.log(`  {{${k}}} → ${v}`);
  }

  if (!conFragmentos) return;

  const plantillaRel =
    bundle.plantilla ?? "perfiles/plantilla-operacion-a-dormir.json";
  const plantillaPath = join(ROOT, plantillaRel);
  const plantilla = loadJson(plantillaPath);

  console.log(`\nPlantilla: ${plantillaRel}`);

  console.log("\n" + "═".repeat(60));
  console.log("📖 Fragmentos con perfil aplicado:\n");

  for (const frag of plantilla.fragmentos) {
    const texto = interpolar(frag.plantilla, variables);
    const faltantes = [...texto.matchAll(/\[falta:([^\]]+)\]/g)].map((m) => m[1]);
    console.log(`── ${frag.titulo} (${frag.id}) ──`);
    console.log(texto);
    if (faltantes.length) {
      console.log(`   ⚠️  Faltan en perfil: ${[...new Set(faltantes)].join(", ")}`);
    }
    console.log("");
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  main();
}
