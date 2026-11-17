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
 * `src/assets/originales/` (`touza-2`, `touza-sala`…) para rastrear cada foto.
 *
 * En la web no sale gente (16/11/2026, pedido del dueño): se quitaron del
 * catálogo las fotos del camarero que ya no trabaja en Touza (`touza-5`,
 * `touza-7`) y las demás con personal o clientes, también al fondo. Una foto
 * nueva con alguien reconocible no entra aquí.
 *
 * Las fotos nuevas van a `src/assets/originales/` con una clave propia;
 * formatos y huecos en docs/fotos-necesarias.md.
 */
export const IMAGENES = {
  /**
   * Sala principal de día (sofá mostaza, mesas de mármol), vista desde arriba.
   * Apaisada 3:2. Hero de la portada, og:image y `image` del JSON-LD. Los
   * cristales de la puerta del fondo van desenfocados (ver DESENFOQUES en
   * scripts/generar-imagenes.mjs): dejaban ver a clientes de Casa Tomás.
   */
  interior: construir("touza-2"),
  /**
   * Recorte central 1080×1708 de `interior` para el hero en pantallas
   * verticales (ver RECORTES en scripts/generar-imagenes.mjs). Mismo encuadre.
   */
  interiorMovil: construir("touza-2-movil"),
  /** Tres botellas de champán Laurent-Perrier y una copa sobre mármol, vertical. */
  champanMesa: construir("touza-8-1"),
  /** Botellas de aperitivo (Select), ron (Kraken) y licores junto a un spritz, vertical. */
  botellas: construir("touza-10"),

  // ── Fotos del local que pasó el dueño (móvil, 15/11/2026), en color natural:
  // solo recorte y reducción, sin la receta de retoque. «El local» de la portada.
  /** El salón de noche: banco corrido mostaza, sillones azules, mesas de mármol y los aros de luz (IMG_0417). Apaisada 4:3. */
  salonNoche: construir("touza-salon-noche"),
  /** El botellero iluminado en dorado: whiskies, tequilas de cerámica y copas (IMG_0247, sin la cámara ni la pared). Vertical 3:4. */
  botellero: construir("touza-botellero"),
  /** La «T» de Touza retroiluminada sobre la pared trenzada (IMG_0313). Vertical 3:4. */
  letrero: construir("touza-letrero"),

  // ── Sesión de fotos de la barra (Drive «Cócteles», 12/11/2026). Los nombres
  // de cóctel que no se pueden asegurar por la foto se describen por lo que se
  // ve (copa roja, espuma…). Las de la carta se sirven desde Supabase.
  /** Tres copas coupé (naranja con espuma, roja con arándanos, amarilla) en la barra, con la estantería detrás. Vertical. */
  trio: construir("touza-trio"),
  /** Estantería de botellas iluminada en dorado, de pared a pared. Apaisada (4:3). */
  estanteria: construir("touza-estanteria"),
  /** Cóctel verde de hielo picado con rodaja de kiwi, en vaso labrado. Vertical. */
  verde: construir("touza-green"),
  /** Piña Colada en vaso con forma de piña sobre una caja dorada, papel pintado detrás. Vertical. */
  pinaColada: construir("touza-pina"),
  /** Copa coupé roja con espuma y arándanos en la barra, fondo azul. Vertical. */
  copaRoja: construir("touza-copa-roja"),
  /** Copa coupé naranja con espuma blanca, sobre el mármol, fondo azul. Vertical. */
  copaEspuma: construir("touza-copa-espuma"),
  /** Tres copas coupé distintas vistas desde arriba, en diagonal sobre el mármol. Vertical. */
  copasCenital: construir("touza-copas-cenital"),
  /** Copa coupé roja con espuma y arándanos sobre el mármol, en primer plano. Vertical. */
  copaRoja2: construir("touza-copa-roja-2"),
  /** La «T» de Touza retroiluminada, con la receta de retoque (más fría). Foto de los cócteles sin foto propia. Vertical. */
  logo: construir("touza-logo"),
  /**
   * La sala de Touza sin gente: banco corrido mostaza, sillones, mesas de
   * mármol y los aros de luz (IMG_0420 de «Local y ambiente», 15/11/2026,
   * con la receta de retoque común). Vertical 3:4. Cabecera de /despues-de-cenar.
   */
  sala: construir("touza-sala"),
} satisfies Record<string, ImagenResponsive>;

/**
 * Hero de la portada en pantallas verticales (móvil), como dirección de arte
 * del único `<img>` del hero (`components/home/Hero.tsx`).
 *
 * - `media`: el recorte es 1080×1708 (≈ 5:8) y la caja ocupa todo el
 *   viewport, así que con proporción ≤ 5:8 el recorte siempre cubre lo que
 *   `object-cover` deja ver → mismo encuadre que la apaisada.
 * - `sizes="64vh"` es el ancho real con el que se pinta: el alto de la
 *   pantalla × 1080/1708. Un móvil de 390×844 a densidad 3 pide 1620 px y se
 *   lleva la de 1080 (toda la altura del maestro: 2 px de foto por px CSS).
 *   Antes se declaraba un presupuesto de `300px` para ahorrar bytes y el
 *   móvil recibía la de 600 o 900: el salón se veía blando.
 */
export const HERO_VARIANTE_MOVIL = {
  imagen: IMAGENES.interiorMovil,
  media: "(max-aspect-ratio: 5/8)",
  sizes: "64vh",
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
