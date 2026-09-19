/**
 * URL base del sitio — punto único de verdad.
 *
 * `touzabar.es` NO resuelve hoy (NXDOMAIN) y el dominio definitivo está sin
 * decidir. Mientras tanto se mantiene como valor por defecto para no cambiar
 * el comportamiento actual; el día que se decida basta con definir
 * `VITE_SITE_URL` en Vercel (y en `.env` para local) y reconstruir.
 *
 * Lo consumen: canonical, og:url, twitter:url, og:image, los JSON-LD, el
 * sitemap y el robots.txt (estos dos últimos vía scripts/generar-sitemap.mjs,
 * que lee la variable con `loadEnv` porque corre en Node, no en el bundle).
 */
const SIN_BARRA_FINAL = /\/+$/;

export const SITE_URL = (
  (import.meta.env.VITE_SITE_URL as string | undefined) || "https://touzabar.es"
).replace(SIN_BARRA_FINAL, "");

/** `canonical("/carta")` → `https://<dominio>/carta`; `canonical()` → `…/`. */
export const canonical = (path = "/"): string =>
  `${SITE_URL}${path === "/" || path === "" ? "/" : path.startsWith("/") ? path : `/${path}`}`;

/** Convierte una ruta de asset (`/assets/x.jpg`) en absoluta, para og:image. */
export const absoluta = (ruta: string): string =>
  /^https?:\/\//.test(ruta) ? ruta : `${SITE_URL}${ruta.startsWith("/") ? ruta : `/${ruta}`}`;
