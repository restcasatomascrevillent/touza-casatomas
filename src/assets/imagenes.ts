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

  // ── Sesión de fotos de la barra (Drive «Cócteles», 12/11/2026). Todas
  // verticales salvo `estanteria`. Los nombres de cóctel que no se pueden
  // asegurar por la foto se describen por lo que se ve (copa roja, espuma…).
  /** Copa coupé roja con arándanos delante de la «T» retroiluminada del local. Vertical. */
  coctelLogo: construir("touza-coctel-t"),
  /** El bartender sirviendo un cóctel rojo en copa coupé, plano corto de manos y copa. Vertical. */
  sirviendo: construir("touza-sirviendo"),
  /** Tres copas coupé (naranja con espuma, roja con arándanos, amarilla) en la barra, con la estantería detrás. Vertical. */
  trio: construir("touza-trio"),
  /** Estantería de botellas iluminada en dorado, de pared a pared. Apaisada (4:3). */
  estanteria: construir("touza-estanteria"),
  /** Moscow Mule en taza de cobre martelada, con rodaja de lima deshidratada. Vertical. */
  moscowMule: construir("touza-moscow-mule"),
  /** Aperol Spritz en copa de vino con pajitas negras, sobre el mármol. Vertical. */
  aperol: construir("touza-aperol"),
  /** Mojito en vaso alto con hierbabuena, lima y pajita negra, fondo azul del local. Vertical. */
  mojitoBarra: construir("touza-mojito-2"),
  /** Cóctel en copa coupé con borde de sal y chile, amarillo anaranjado (Spicy Mango Margarita). Vertical. */
  mango: construir("touza-mango"),
  /** Cóctel verde de hielo picado con rodaja de kiwi, en vaso labrado. Vertical. */
  verde: construir("touza-green"),
  /** Piña Colada en vaso con forma de piña sobre una caja dorada, papel pintado detrás. Vertical. */
  pinaColada: construir("touza-pina"),
  /** Copa coupé roja con espuma y arándanos en la barra, fondo azul. Vertical. */
  copaRoja: construir("touza-copa-roja"),
  /** Copa coupé naranja con espuma blanca, sobre el mármol, fondo azul. Vertical. */
  copaEspuma: construir("touza-copa-espuma"),
  /** Tres copas coupé (roja, amarilla, naranja) en fila sobre la barra, estantería al fondo. Vertical. */
  tresCopas: construir("touza-tres-copas"),
  /** Tres copas coupé distintas vistas desde arriba, en diagonal sobre el mármol. Vertical. */
  copasCenital: construir("touza-copas-cenital"),
  /** La bartender rellenando un mojito con soda en la barra. Vertical. */
  mojitoPreparando: construir("touza-mojito-preparando"),
  /** Cóctel en vaso tiki de cerámica con forma de tótem y rodaja de lima. Vertical. */
  tiki: construir("touza-tiki"),
  /** Cóctel claro en vaso bajo labrado, con rodaja de kiwi y pajita negra. Vertical. */
  kiwiVasoBajo: construir("touza-kiwi-vaso-bajo"),
  /** Moscow Mule en taza de cobre con pajita negra, sobre el mármol. Vertical. */
  moscowMule2: construir("touza-moscow-mule-2"),
  /** El bartender agitando la coctelera detrás de la barra. Vertical. */
  agitando: construir("touza-agitando"),
  /** Copa coupé roja con espuma y arándanos sobre el mármol, en primer plano. Vertical. */
  copaRoja2: construir("touza-copa-roja-2"),
  /** Piña Colada en vaso piña sobre la barra, con la estantería iluminada detrás. Vertical. */
  pinaBotellas: construir("touza-pina-botellas"),
  /** El bartender sirviendo una Piña Colada desde la coctelera. Vertical. */
  pinaPreparando: construir("touza-pina-preparando"),
  /** La «T» de Touza retroiluminada sobre la pared trenzada. Vertical. */
  logo: construir("touza-logo"),
  /** Copa coupé con espuma blanca y una flor seca encima, sobre el mármol. Vertical. */
  copaFlor: construir("touza-copa-flor"),
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
