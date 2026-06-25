# Perfiles de prueba

JSON de familia para validar el esquema de [PerfilFamiliar.md](../PerfilFamiliar.md) **antes** de crear tablas SQL.

## Archivos

| Archivo | Para qué sirve |
|---|---|
| [balcutron.json](./balcutron.json) | Perfil completo del piloto (Raka, Pauleta, Nicolai, Chimonchin, Bingochon, Mora) |
| [familia-chacachon.json](./familia-chacachon.json) | **Perfil real** — José, Julie, Nico, Simónchin, Bingo, Mora, El Rosario |
| [plantilla-chacachon-operacion-a-dormir.json](./plantilla-chacachon-operacion-a-dormir.json) | Plantilla del cuento aterrizado para la familia Chacachón |
| [garcia-bogota.json](./garcia-bogota.json) | Familia de ejemplo ficticia (Mateo, Sofía) — para comparar |
| [plantilla-operacion-a-dormir.json](./plantilla-operacion-a-dormir.json) | Fragmentos del cuento con `{{variables}}` |

## Probar en terminal

Desde la raíz del repo:

```bash
# Perfil Balcutron + plantilla espacial
node scripts/resolver-perfil.mjs perfiles/balcutron.json

# Familia Chacachón (perfil + plantilla propia)
node scripts/resolver-perfil.mjs perfiles/familia-chacachon.json

# Otro perfil
node scripts/resolver-perfil.mjs perfiles/garcia-bogota.json

# Solo variables, sin fragmentos del cuento
node scripts/resolver-perfil.mjs perfiles/balcutron.json --solo-variables

## Qué revisar

1. **¿Las variables alcanzan?** Si ves `[falta:algo]`, falta dato en el perfil o hay que agregar una variable al resolver.
2. **¿Suena natural?** Leer en voz alta el texto generado.
3. **¿El JSON es fácil de editar?** Agregar un tío, cambiar una frase, otra mascota — sin tocar SQL.
4. **¿Hace falta un campo nuevo?** Ponlo en `extra` primero; si se repite en varias familias, súbelo al esquema v1.

## Editar un perfil

1. Abre `balcutron.json` o duplica el archivo (`mi-familia.json`).
2. Cambia nombres, frases, mascotas.
3. Vuelve a correr `node scripts/resolver-perfil.mjs perfiles/mi-familia.json`.

## Formato del archivo

```json
{
  "nombre_display": "Cómo aparece en la app",
  "schema_version": 1,
  "completitud": 0,
  "perfil": { ... documento PerfilFamiliaV1 ... }
}
```

Cuando migremos a Supabase, solo la parte `perfil` (más metadata) irá a la columna JSONB.
