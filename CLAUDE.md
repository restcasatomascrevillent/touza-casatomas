# Reglas para Claude en este repo (web de Touza, de Casa Tomás)

Proceso completo: [docs/PROCESO-DE-CAMBIOS.md](docs/PROCESO-DE-CAMBIOS.md). Obligatorio:

- **Rama `staging`.** Nunca hagas push a `main`, nunca fusiones un PR, nunca `push --force`. Producción solo cambia cuando el dueño acepta en GitHub el PR `staging → main`, que se abre solo al subir a `staging`.
- **Autor de los commits:** `git -c user.name=Claude -c user.email=noreply@anthropic.com commit …`. El plan Hobby de Vercel bloquea los commits de autores con cuenta de Vercel que no son del equipo.
- **Antes de subir:** `npm test`, `npm run typecheck` y `npm run build:ci` en verde (ver `.github/workflows/ci.yml`). Los tests necesitan `VITE_SUPABASE_URL` y `VITE_SUPABASE_PUBLISHABLE_KEY` aunque no llamen a la red: en local, cualquier valor sirve.
- **Supabase:** Touza solo lee la carta con la clave pública. Las migraciones viven en el repo del panel (`admin-casatomas/supabase/migrations`); las de `supabase/migrations` de este repo son antiguas. Demo `sfonaclosuafvlhutkon`, producción `haqmmdfdzzatdnrrcgez`; el proyecto viejo `jeamoczmbfsnwkfjxcyo` no se toca.
- **Después de subir a `staging`:** comprueba que Vercel publica la demo (estado READY) y dile al dueño qué probar en ella y en qué versión está (`/version.json`).
- **Versión:** la calcula `scripts/version.mjs`. No edites `versionado.json` salvo que el dueño pida cambiar de mayor.
