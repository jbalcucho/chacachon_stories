# Perfiles de prueba

JSON de familia para validar el esquema de [PerfilFamiliar.md](../PerfilFamiliar.md) **antes** de crear tablas SQL.

## Archivos

| Archivo | Para qué sirve |
|---|---|
| [familia-chacachon.json](./familia-chacachon.json) | **Perfil real** — José, Julie, Nico, Simónchin, Bingo, Mora |
| [balcutron.json](./balcutron.json) | Perfil IP espacial (referencia; sin cuento publicado) |
| [garcia-bogota.json](./garcia-bogota.json) | Familia de ejemplo ficticia (Mateo, Sofía) |

## Probar en terminal

```bash
node scripts/resolver-perfil.mjs perfiles/familia-chacachon.json --solo-variables
node scripts/resolver-perfil.mjs perfiles/garcia-bogota.json --solo-variables
```

## Editar un perfil

1. Abre o duplica un JSON (`mi-familia.json`).
2. Cambia nombres, frases, mascotas.
3. Corre el resolver otra vez.

En producción, la parte `perfil` vive en `family_profiles.perfil` (JSONB) — ver [docs/database.md](../docs/database.md).
