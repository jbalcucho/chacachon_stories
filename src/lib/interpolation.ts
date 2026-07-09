import type { FamilyProfileDocument } from "@/lib/family-profile-schema";

type Adulto = NonNullable<FamilyProfileDocument["adultos"]>[number];
type Nino = NonNullable<FamilyProfileDocument["ninos"]>[number];
type Mascota = NonNullable<FamilyProfileDocument["mascotas"]>[number];

export type TemplateVariables = Record<string, string>;

function pickAdulto(
  perfil: FamilyProfileDocument,
  rol: Adulto["rol"],
): Adulto | undefined {
  return perfil.adultos?.find((a) => a.rol === rol);
}

function pickNinos(perfil: FamilyProfileDocument): Nino[] {
  return [...(perfil.ninos ?? [])].sort(
    (a, b) => (a.orden ?? 99) - (b.orden ?? 99),
  );
}

function pickCercanos(perfil: FamilyProfileDocument) {
  const list = (perfil.cercanos ?? []) as Array<Record<string, unknown>>;
  return list.filter((c) => c.aparece_en_cuentos);
}

function pickAbuelos(perfil: FamilyProfileDocument) {
  const cercanos = pickCercanos(perfil);
  const abuela = cercanos.find((c) => c.relacion === "abuela");
  const abuelo = cercanos.find((c) => c.relacion === "abuelo");
  return { abuela, abuelo };
}

function mascotaTrait(m?: Mascota): string {
  if (!m) return "";
  const extra = m.extra as { manana?: string } | undefined;
  return m.personalidad ?? extra?.manana ?? "";
}

/** Escapa texto para insertarlo en HTML sin XSS. */
export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Resuelve un documento de perfil a variables de plantilla `{{clave}}`. */
export function resolveProfileVariables(
  perfil: FamilyProfileDocument,
): TemplateVariables {
  const ninos = pickNinos(perfil);
  const mama = pickAdulto(perfil, "mama");
  const papa = pickAdulto(perfil, "papa");
  const { abuela, abuelo } = pickAbuelos(perfil);
  const m1 = perfil.mascotas?.[0];
  const m2 = perfil.mascotas?.[1];
  const casa = perfil.casa as { detalles?: string[] } | undefined;
  const detalles = casa?.detalles ?? [];
  const extra = perfil.extra as
    | {
        colegio?: { anterior?: string; actual?: string };
        rutina_noche?: { batallas?: Array<{ texto?: string }> };
      }
    | undefined;

  const n1 = ninos[0];
  const n2 = ninos[1];
  const colegio = extra?.colegio;

  const pantalla =
    n1?.pantallas?.que_usa ?? n2?.pantallas?.que_usa ?? "tablet";
  const juego =
    n1?.pantallas?.juego_favorito ??
    n2?.pantallas?.juego_favorito ??
    n1?.gustos?.juegos?.[0] ??
    "el juego";

  const colegioAnterior =
    colegio?.anterior ??
    (n1?.extra as { colegio_anterior?: string } | undefined)?.colegio_anterior ??
    (n2?.extra as { colegio_anterior?: string } | undefined)?.colegio_anterior ??
    "";

  const colegioActual =
    colegio?.actual ??
    (n1?.extra as { colegio_actual?: string } | undefined)?.colegio_actual ??
    (n2?.extra as { colegio_actual?: string } | undefined)?.colegio_actual ??
    "";

  let lugarCercano = "";
  if (abuela?.vive_cerca) {
    const quien = String(abuela.nombre ?? "la abuela");
    lugarCercano = `el apartamento de ${quien}`;
    const detalle = (abuela.extra as { detalle?: string } | undefined)?.detalle;
    if (detalle) lugarCercano += ` — ${detalle}`;
  } else {
    const cercano = pickCercanos(perfil).find((c) => c.vive_cerca);
    if (cercano) {
      const quien = String(
        cercano.apodo ?? cercano.nombre ?? cercano.relacion ?? "familia",
      );
      lugarCercano = `la casa de ${quien}`;
      const detalle = (cercano.extra as { detalle?: string } | undefined)
        ?.detalle;
      if (detalle) lugarCercano += ` — ${detalle}`;
    }
  }

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
    frase_mama_3:
      mama?.frases_tipicas?.[2] ?? "Los voy a castigar si no hacen caso",
    frase_papa: papa?.frases_tipicas?.[0] ?? "Duérmanse",
    frase_papa_2: papa?.frases_tipicas?.[1] ?? "Ya no más tablet",

    colegio_anterior: colegioAnterior,
    colegio_nuevo: colegioActual,
    colegio_actual: colegioActual,

    abuela_nombre: String(abuela?.nombre ?? "la abuela"),
    abuelo_nombre: String(abuelo?.nombre ?? "el abuelo"),

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
      extra?.rutina_noche?.batallas
        ?.map((b) => b.texto)
        .filter(Boolean)
        .join("; ") ?? "",
  };
}

/**
 * Interpola `{{clave}}` en una plantilla.
 * Por defecto escapa HTML. Usa `escape: false` solo para texto plano.
 */
export function interpolate(
  template: string,
  variables: TemplateVariables,
  options: { escape?: boolean; missingMarker?: boolean } = {},
): string {
  const shouldEscape = options.escape !== false;
  const missingMarker = options.missingMarker !== false;

  return template.replace(/\{\{([^}]+)\}\}/g, (_, rawKey: string) => {
    const key = rawKey.trim();
    const val = variables[key];
    if (val === undefined || val === null || val === "") {
      return missingMarker ? `[falta:${key}]` : "";
    }
    const text = String(val);
    return shouldEscape ? escapeHtml(text) : text;
  });
}

/** Atajo: perfil → plantilla interpolada (HTML-safe). */
export function interpolateProfile(
  template: string,
  perfil: FamilyProfileDocument,
  options?: { escape?: boolean; missingMarker?: boolean },
): string {
  return interpolate(template, resolveProfileVariables(perfil), options);
}
