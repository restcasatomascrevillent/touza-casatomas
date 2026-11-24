/**
 * Fotos de producto (Supabase Storage) servidas por Vercel Image Optimization.
 *
 * Las fotos que se suben desde el panel pesan lo que pesen (botellas de
 * 900×1500 y ~550 KB, cócteles de 900×1200 y ~185 KB) y se pintan a 96–420 px.
 * Por `/_vercel/image` Vercel las recorta al ancho pedido, las pasa a AVIF o
 * WebP según el navegador y las guarda en su CDN (auditoría de carga v0.10,
 * opción A: decisión del 15/11/2026). Cualquier foto nueva del panel se
 * optimiza sola; no hay que generar miniaturas.
 *
 * - Solo pasan por aquí las fotos públicas de los dos Supabase (demo y
 *   producción): son los `images.remotePatterns` de vercel.json. Lo demás (la
 *   «T» y las fotos de `src/assets`, que ya van en AVIF/WebP con su srcset; un
 *   resto de Unsplash) se devuelve tal cual.
 * - El ancho `w` tiene que estar en `images.sizes` de vercel.json o Vercel
 *   responde 400: por eso se redondea a `ANCHOS_FOTO` (un test comprueba que
 *   las dos listas son iguales). La calidad, igual con `images.qualities`.
 * - Fuera de Vercel (`npm run dev`, `npm run preview`, el build del CI) no
 *   existe `/_vercel/image`: se usa la URL original. Lo decide el build
 *   (`__FOTOS_VERCEL__`, ver vite.config.ts) y no el navegador, para que el
 *   HTML del SSG y la hidratación pinten la misma URL.
 * - Si Vercel falla (cuota agotada, 4xx), la <img> vuelve sola a la original
 *   (`volverAFotoOriginal`).
 */

/** Anchos permitidos. Iguales a `images.sizes` de vercel.json. */
export const ANCHOS_FOTO = [96, 128, 192, 256, 384, 480, 640, 828, 1080] as const;

/** Calidad de `/_vercel/image`. Igual a `images.qualities` de vercel.json. */
export const CALIDAD_FOTO = 75;

/** Supabase de la demo y de producción (vercel.json → `images.remotePatterns`). */
export const HOSTS_FOTOS = ["sfonaclosuafvlhutkon.supabase.co", "haqmmdfdzzatdnrrcgez.supabase.co"] as const;

const RUTA_PUBLICA = "/storage/v1/object/public/";

/** `true` solo en los builds de Vercel (vite.config.ts). En dev y en los tests, `false`. */
export const OPTIMIZAR_FOTOS: boolean = typeof __FOTOS_VERCEL__ !== "undefined" && __FOTOS_VERCEL__;

interface Opciones {
  /** Para los tests: fuerza o quita la optimización. Por defecto, la del build. */
  optimizar?: boolean;
}

/** ¿Es una foto pública de uno de los dos Supabase? */
export function esFotoOptimizable(url: string | null | undefined): boolean {
  if (!url) return false;
  try {
    const u = new URL(url);
    return (
      u.protocol === "https:" &&
      (HOSTS_FOTOS as readonly string[]).includes(u.hostname) &&
      u.pathname.startsWith(RUTA_PUBLICA)
    );
  } catch {
    return false;
  }
}

/** El menor ancho permitido que cubre `ancho`; si ninguno llega, el mayor. */
export function anchoPermitido(ancho: number): number {
  return ANCHOS_FOTO.find((permitido) => permitido >= ancho) ?? ANCHOS_FOTO[ANCHOS_FOTO.length - 1];
}

/**
 * URL de la foto a `ancho` px (redondeado a un ancho permitido). La original
 * si no es de Supabase o si no se está en Vercel.
 */
export function urlFoto(url: string, ancho: number, { optimizar = OPTIMIZAR_FOTOS }: Opciones = {}): string {
  if (!optimizar || !esFotoOptimizable(url)) return url;
  return `/_vercel/image?url=${encodeURIComponent(url)}&w=${anchoPermitido(ancho)}&q=${CALIDAD_FOTO}`;
}

export interface FotoResponsive {
  src: string;
  srcSet?: string;
  sizes?: string;
}

/**
 * `src`, `srcSet` y `sizes` para una <img>: un candidato por ancho (`320w`…)
 * y `sizes` con el ancho CSS real, para que el navegador elija según la
 * pantalla y su densidad. `src` (el respaldo) es el ancho mayor. Sin
 * optimización, solo `src` con la URL original.
 */
export function fotoResponsive(
  url: string,
  anchos: readonly number[],
  sizes: string,
  { optimizar = OPTIMIZAR_FOTOS }: Opciones = {},
): FotoResponsive {
  if (!optimizar || !esFotoOptimizable(url) || anchos.length === 0) return { src: url };
  const lista = [...new Set(anchos.map(anchoPermitido))].sort((a, b) => a - b);
  return {
    src: urlFoto(url, lista[lista.length - 1], { optimizar }),
    srcSet: lista.map((w) => `${urlFoto(url, w, { optimizar })} ${w}w`).join(", "),
    sizes,
  };
}

/**
 * Botella en su nicho: 96 px en el móvil, 120 px desde md (FilaBotella). Con
 * densidad 2 y 3 en el móvil pide 192 y 288 (→ 384); en escritorio, 128 o 256.
 */
export const FOTO_BOTELLA = { anchos: [128, 192, 256, 384], sizes: "(min-width: 768px) 120px, 96px" } as const;

/** Tarjeta de cóctel de /carta: 2 columnas en el móvil, 3 en md, 4 en lg (máx. ~270 px). */
export const FOTO_TARJETA = {
  anchos: [256, 384, 480, 640, 828],
  sizes: "(min-width: 1024px) 270px, (min-width: 768px) 33vw, 50vw",
} as const;

/**
 * Tarjeta de «La carta» en la portada: 2 columnas en el móvil (≈170 px) y 3 o
 * 4 desde md (≈290 px como mucho). Con densidad 3 en el móvil pide 585 px y
 * con densidad 2 en escritorio 600: en los dos casos se lleva la de 640.
 */
export const FOTO_PORTADA = {
  anchos: [256, 384, 480, 640, 828],
  sizes: "(min-width: 1280px) 300px, (min-width: 768px) 33vw, 50vw",
} as const;

/** Tira «De la casa» de la portada: 150 px en el móvil, 230 px desde md. */
export const FOTO_TIRA = { anchos: [256, 384, 480, 640], sizes: "(min-width: 768px) 230px, 150px" } as const;

/** Tarjeta de «Para la sobremesa» (/despues-de-cenar): 64vw en el móvil, 3 columnas desde md. */
export const FOTO_SOBREMESA = { anchos: [256, 384, 480, 640, 828], sizes: "(min-width: 768px) 360px, 64vw" } as const;

/** Foto del detalle de un cóctel: ancho completo en el móvil, media ventana (448 px) desde md. */
export const FOTO_DETALLE = { anchos: [480, 640, 828, 1080], sizes: "(min-width: 768px) 448px, 100vw" } as const;

/**
 * En el `onError` de una <img> optimizada: si lo que falló es `/_vercel/image`,
 * quita el srcset y pide la original. Devuelve `true` si lo ha intentado (el
 * error no es definitivo) y `false` si ya era la original.
 */
export function volverAFotoOriginal(img: HTMLImageElement, original: string | undefined): boolean {
  if (!original || img.dataset.fotoOriginal === "1") return false;
  const actual = img.currentSrc || img.getAttribute("src") || "";
  if (!actual.includes("/_vercel/image")) return false;
  img.dataset.fotoOriginal = "1";
  img.removeAttribute("srcset");
  img.removeAttribute("sizes");
  img.src = original;
  return true;
}
