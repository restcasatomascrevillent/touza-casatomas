/**
 * URL base del sitio — punto único de verdad.
 *
 * Dominio definitivo desde el 10/11/2026: https://touza.restaurantecasatomascrevillente.es
 * (subdominio en Hostinger con CNAME a Vercel). `touza-casatomas.vercel.app`
 * redirige ahí con un 308 (ver `vercel.json`).
 *
 * El valor por defecto era `https://touzabar.es`, que **no resuelve**
 * (NXDOMAIN, comprobado el 22/09/2026). Eso significaba que el canonical, el
 * og:url, los JSON-LD y el sitemap apuntaban todos a una dirección
 * inexistente: Google no tenía ninguna URL estable que indexar y el SEO del
 * sitio no podía arrancar. Un valor por defecto tiene que funcionar; si no,
 * es un fallo silencioso esperando a que alguien olvide la variable.
 *
 * `VITE_SITE_URL` está definida en Vercel (production y preview) con este
 * mismo valor, así que el respaldo y la variable coinciden. Si cambia el
 * dominio, hay que cambiar la variable en Vercel, este respaldo y el de
 * `vite.config.ts`, y la redirección de `vercel.json`.
 *
 * Lo consumen: canonical, og:url, twitter:url, og:image, los JSON-LD, el
 * sitemap y el robots.txt (estos dos últimos vía scripts/generar-sitemap.mjs,
 * que lee la variable con `loadEnv` porque corre en Node, no en el bundle).
 */
const SIN_BARRA_FINAL = /\/+$/;

export const SITE_URL = (
  (import.meta.env.VITE_SITE_URL as string | undefined) ||
  "https://touza.restaurantecasatomascrevillente.es"
).replace(SIN_BARRA_FINAL, "");

/** `canonical("/carta")` → `https://<dominio>/carta`; `canonical()` → `…/`. */
export const canonical = (path = "/"): string =>
  `${SITE_URL}${path === "/" || path === "" ? "/" : path.startsWith("/") ? path : `/${path}`}`;

/** Convierte una ruta de asset (`/assets/x.jpg`) en absoluta, para og:image. */
export const absoluta = (ruta: string): string =>
  /^https?:\/\//.test(ruta) ? ruta : `${SITE_URL}${ruta.startsWith("/") ? ruta : `/${ruta}`}`;
