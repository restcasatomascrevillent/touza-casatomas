/**
 * Endpoint de la Edge Function pública `reservas-web` (proyecto Supabase
 * compartido con casa-tomas-story y adminpanelct).
 *
 * Copiado del mismo fichero en casa-tomas-story/src/lib/supabase-functions.ts
 * — mismo contrato, misma Edge Function, dos webs distintas. La base NUNCA
 * se escribe a mano: sale de `VITE_SUPABASE_URL`, la misma variable que ya
 * usa `integrations/supabase/client.ts` en este repo.
 *
 * Gotcha SSG (touza usa vite-react-ssg, igual que casa-tomas-story): aquí
 * solo se lee `import.meta.env` a nivel de módulo. Nada de `window`,
 * `localStorage` ni `navigator`, que no existen durante el prerender.
 */

const SUPABASE_URL = ((import.meta.env.VITE_SUPABASE_URL as string | undefined) ?? "").replace(/\/+$/, "");

const SUPABASE_KEY =
  (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined) ||
  (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined) ||
  "";

export const FUNCTIONS_BASE_URL = `${SUPABASE_URL}/functions/v1`;

/** `POST` → 201 en éxito; 400/403/409/422 con `motivo` + `mensaje` en rechazo. */
export const RESERVAS_WEB_CREAR_URL = `${FUNCTIONS_BASE_URL}/reservas-web/crear`;

/**
 * Cabeceras de una llamada POST JSON a una Edge Function.
 *
 * `reservas-web` no tiene entrada en `supabase/config.toml`, de modo que
 * `verify_jwt` vale `true` por defecto y la pasarela exige la clave
 * publicable. Va en `apikey` + `Authorization`, que es lo que manda
 * `supabase.functions.invoke()`.
 */
export function functionHeaders(): Record<string, string> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (SUPABASE_KEY) {
    headers.apikey = SUPABASE_KEY;
    headers.Authorization = `Bearer ${SUPABASE_KEY}`;
  }
  return headers;
}

/**
 * Lee el cuerpo de una respuesta PASE LO QUE PASE con el código HTTP.
 *
 * El fallo que evita: `if (!response.ok) throw` se comería el cuerpo de
 * todos los rechazos, que es justo donde viajan el `motivo` y el `mensaje`
 * legible para el visitante.
 *
 * Devuelve el JSON parseado, el texto crudo si no era JSON, o `null` si el
 * cuerpo venía vacío o ilegible. Nunca lanza.
 */
export async function leerCuerpo(response: Response): Promise<unknown> {
  let texto: string;
  try {
    texto = await response.text();
  } catch {
    return null;
  }
  if (!texto.trim()) return null;
  try {
    return JSON.parse(texto);
  } catch {
    return texto;
  }
}
