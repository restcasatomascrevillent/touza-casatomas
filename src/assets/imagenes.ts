/**
 * Catálogo de las imágenes fijas del sitio, servidas desde el propio dominio.
 *
 * Antes se hotlinkeaban de `restaurantecasatomascrevillente.es/wp-content/…`.
 * Ese WordPress desaparece el día que se despliegue la web nueva del
 * restaurante sobre ese dominio, y con él el hero, la og:image y la galería.
 *
 * Los maestros viven en `src/assets/originales/` (no se empaquetan) y las
 * variantes en `src/assets/img/`, generadas con `npm run imagenes`.
 */
import dimensiones from "./img/dimensiones.json";

export interface ImagenResponsive {
  /** URL del fallback (el ancho mayor disponible, en WebP). */
  src: string;
  /** Dimensiones intrínsecas del original: evitan saltos de maquetación. */
  width: number;
  height: number;
  /** srcset por formato. Cadena vacía si no hay variantes (imagen remota). */
  avif: string;
  webp: string;
}

type Variantes = Record<string, string>;

// Vite resuelve estos globs en build y emite cada fichero a /assets con hash
// de contenido → `Cache-Control: immutable` (ya configurado en vercel.json).
const avifs = import.meta.glob("./img/*.avif", {
  eager: true,
  query: "?url",
  import: "default",
}) as Variantes;

const webps = import.meta.glob("./img/*.webp", {
  eager: true,
  query: "?url",
  import: "default",
}) as Variantes;

/** "./img/touza-8-1-640.webp" → { nombre: "touza-8-1", ancho: 640 } */
function trocear(ruta: string) {
  const base = ruta.slice(ruta.lastIndexOf("/") + 1).replace(/\.(avif|webp)$/, "");
  const corte = base.lastIndexOf("-");
  return { nombre: base.slice(0, corte), ancho: Number(base.slice(corte + 1)) };
}

function srcset(variantes: Variantes, nombre: string): { srcset: string; mayor: string } {
  const propias = Object.entries(variantes)
    .map(([ruta, url]) => ({ ...trocear(ruta), url }))
    .filter((v) => v.nombre === nombre && Number.isFinite(v.ancho))
    .sort((a, b) => a.ancho - b.ancho);

  return {
    srcset: propias.map((v) => `${v.url} ${v.ancho}w`).join(", "),
    mayor: propias.length ? propias[propias.length - 1].url : "",
  };
}

function construir(nombre: string): ImagenResponsive {
  const dim = (dimensiones as Record<string, { width: number; height: number }>)[nombre];
  if (!dim) throw new Error(`[imagenes] Falta ${nombre} en img/dimensiones.json`);

  const avif = srcset(avifs, nombre);
  const webp = srcset(webps, nombre);
  if (!webp.mayor) throw new Error(`[imagenes] No hay variantes WebP de ${nombre}`);

  return { src: webp.mayor, width: dim.width, height: dim.height, avif: avif.srcset, webp: webp.srcset };
}

/**
 * Cada clave dice lo que ENSEÑA la foto, no dónde se usa: antes había
 * `reservado` (un mojito), `local` y `mesaPrivada` (bodegones de champán) y
 * `decoracion` (botellas), y acababan presentadas como la sala de El
 * Reservado. El argumento de `construir` es el nombre del maestro en
 * `src/assets/originales/` (`touza-2`, `touza-5`…) para rastrear cada foto.
 *
 * Las fotos nuevas van a `src/assets/originales/` con una clave propia;
 * formatos y huecos en docs/fotos-necesarias.md. (El recorte cuadrado del
 * champán, `touza-8`, solo lo usaba /reservado y se retiró con las reservas
 * web el 01/10/2026.)
 */
export const IMAGENES = {
  /** Sala principal (sofá mostaza, mesas de mármol), apaisada. Hero de la portada, og:image y `image` del JSON-LD. */
  interior: construir("touza-2"),
  /**
   * Recorte central ≈3:4 de `interior` para el hero en móvil vertical (ver
   * RECORTES en scripts/generar-imagenes.mjs). Mismo encuadre, menos bytes.
   */
  interiorMovil: construir("touza-2-movil"),
  /** Bartender colando un cóctel en la barra, vertical. Hero de /carta y vitrina "Cócteles de Autor". */
  barra: construir("touza-5"),
  /** Mojito con pajita de Touza en la barra, con el bartender desenfocado detrás. Vertical. */
  mojito: construir("touza-7"),
  /** Tres botellas de champán Laurent-Perrier y una copa sobre mármol, vertical. */
  champanMesa: construir("touza-8-1"),
  /** Botellas de aperitivo (Select), ron (Kraken) y licores junto a un spritz, vertical. */
  botellas: construir("touza-10"),
} satisfies Record<string, ImagenResponsive>;

/**
 * Hero de la portada en pantallas verticales (móvil), como dirección de arte
 * del único `<img>` del hero (`components/home/Hero.tsx`).
 *
 * - `media`: el recorte es ≈3:4 y la caja ocupa todo el viewport (100dvh ≥
 *   alto del viewport de las media queries), así que con proporción ≤ 2:3 el
 *   recorte siempre cubre lo que `object-cover` deja ver → mismo encuadre.
 * - `sizes="300px"` NO es el ancho real (≈75vh): es un presupuesto para que
 *   DPR 3 elija la de 900 y DPR ≤ 2 la de 600. Ambas dan más píxeles útiles
 *   que la apaisada de 1600/1024 que se usaba antes, pesando ~40 % menos.
 */
export const HERO_VARIANTE_MOVIL = {
  imagen: IMAGENES.interiorMovil,
  media: "(max-aspect-ratio: 2/3)",
  sizes: "300px",
};

/**
 * Envuelve una URL externa (Unsplash, Supabase Storage) con la misma forma,
 * para poder pasar siempre `width`/`height` al `<img>` aunque no haya srcset.
 */
export const imagenRemota = (src: string, width: number, height: number): ImagenResponsive => ({
  src,
  width,
  height,
  avif: "",
  webp: "",
});
