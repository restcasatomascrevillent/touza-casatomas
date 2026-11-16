/**
 * Vídeos de la portada.
 *
 * Los ficheros los genera otro proceso (recorte + LUT + compresión) y caen en
 * `src/assets/videos/`:
 * - `hero/bucle.webm`, `hero/bucle.mp4` y `hero/poster.webp` (720×1280, el
 *   primer fotograma): el bucle del hero.
 * - `clips/NN-nombre.webm|.mp4|.webp`: la franja de clips (el `.webp` es el
 *   póster). `NN` ordena y `nombre` es el cóctel ("03-clover-club").
 * - `reels/NN-nombre.*`: hueco para los reels de Instagram (9:16, sin audio,
 *   descargados del original). Cuando lleguen, van delante de los clips sin
 *   tocar código.
 *
 * Se leen con `import.meta.glob`: si la carpeta aún no existe, el glob queda
 * vacío y el build no falla. Vite emite cada fichero a /assets con hash
 * (caché inmutable, como las fotos).
 */

type Urls = Record<string, string>;

// Vite exige las opciones del glob escritas en línea (no en una constante).
const urlsHero = import.meta.glob("../../assets/videos/hero/*.{webm,mp4,webp}", {
  eager: true,
  query: "?url",
  import: "default",
}) as Urls;
const urlsClips = import.meta.glob("../../assets/videos/clips/*.{webm,mp4,webp}", {
  eager: true,
  query: "?url",
  import: "default",
}) as Urls;
const urlsReels = import.meta.glob("../../assets/videos/reels/*.{webm,mp4,webp}", {
  eager: true,
  query: "?url",
  import: "default",
}) as Urls;
// Clips del local (sala, vitrinas, barra): «El local» de la portada y
// /despues-de-cenar. Ver `assets/videos/README.md`.
const urlsLocal = import.meta.glob("../../assets/videos/local/*.{webm,mp4,webp}", {
  eager: true,
  query: "?url",
  import: "default",
}) as Urls;

export interface FuentesVideo {
  webm?: string;
  mp4?: string;
  /** Primer fotograma, en WebP. */
  poster?: string;
}

/** Medidas del póster del hero (vertical, 9:16). */
export const POSTER_HERO = { width: 720, height: 1280 } as const;

const buscar = (urls: Urls, nombre: string) =>
  Object.entries(urls).find(([ruta]) => ruta.endsWith(`/${nombre}`))?.[1];

export const VIDEO_HERO: FuentesVideo = {
  webm: buscar(urlsHero, "bucle.webm"),
  mp4: buscar(urlsHero, "bucle.mp4"),
  poster: buscar(urlsHero, "poster.webp"),
};

export const hayVideo = (f: FuentesVideo) => Boolean(f.webm || f.mp4);

/**
 * Sin póster del vídeo, el hero enseña la foto del interior. «El local» la
 * cambia entonces por otra para que la misma foto no salga dos veces.
 */
export const HERO_CON_FOTO_INTERIOR = !VIDEO_HERO.poster;

export interface Clip extends FuentesVideo {
  /** Nombre del fichero sin extensión ("03-clover-club"). */
  id: string;
  /** Lo que se lee bajo el clip ("Clover Club"). */
  nombre: string;
  origen: "barra" | "instagram" | "local";
  /** Texto alternativo del póster. Sin él: «{nombre}, en la barra de Touza». */
  alt?: string;
}

const MINUSCULAS = new Set(["de", "del", "la", "el", "y", "con", "en", "a"]);

/** "03-clover-club" → "Clover Club"; "05-gin-de-la-casa" → "Gin de la Casa". */
export function nombreDeClip(id: string): string {
  return id
    .replace(/^\d+[-_ ]*/, "")
    .split(/[-_ ]+/)
    .filter(Boolean)
    .map((palabra, i) =>
      i > 0 && MINUSCULAS.has(palabra.toLowerCase())
        ? palabra.toLowerCase()
        : palabra.charAt(0).toUpperCase() + palabra.slice(1)
    )
    .join(" ");
}

/**
 * Agrupa los ficheros de una carpeta por nombre ("03-clover-club.webm",
 * ".mp4", ".webp") y los ordena por el número del principio. Un clip sin
 * vídeo (solo póster) no se usa.
 */
export function agruparClips(urls: Urls, origen: Clip["origen"]): Clip[] {
  const porId = new Map<string, Clip>();
  for (const [ruta, url] of Object.entries(urls)) {
    const fichero = ruta.slice(ruta.lastIndexOf("/") + 1);
    const punto = fichero.lastIndexOf(".");
    const id = fichero.slice(0, punto);
    const ext = fichero.slice(punto + 1).toLowerCase();
    const clip = porId.get(id) ?? { id, nombre: nombreDeClip(id), origen };
    if (ext === "webm") clip.webm = url;
    else if (ext === "mp4") clip.mp4 = url;
    else if (ext === "webp") clip.poster = url;
    porId.set(id, clip);
  }
  return [...porId.values()]
    .filter(hayVideo)
    .sort((a, b) => a.id.localeCompare(b.id, "es", { numeric: true }));
}

/** Reels de Instagram primero (cuando los haya), luego los clips de la barra. */
export const CLIPS_PORTADA: Clip[] = [
  ...agruparClips(urlsReels, "instagram"),
  ...agruparClips(urlsClips, "barra"),
];

const fuentesLocal = (nombre: string): FuentesVideo => ({
  webm: buscar(urlsLocal, `${nombre}.webm`),
  mp4: buscar(urlsLocal, `${nombre}.mp4`),
  poster: buscar(urlsLocal, `${nombre}.webp`),
});

/**
 * Cuándo «El local» usa el clip horizontal: pantalla ancha y apaisada (el
 * marco es entonces más ancho que alto). En el móvil y en la tableta en
 * vertical, el clip vertical. La misma media query va en el <source> del
 * póster y en la elección del vídeo.
 */
export const MEDIA_LOCAL_ANCHO = "(min-width: 768px) and (orientation: landscape)";

/**
 * «El local» de la portada. `sala-panoramica`, `sala-mesa-tv` y
 * `vitrina-vinos-panoramica` se descartaron porque sale la tele encendida (en
 * escritorio, la del paisaje se comía el marco; 16/11/2026).
 */
export const VIDEOS_EL_LOCAL = {
  /** Vitrinas de vino y champagne y, al final, los sofás. 406×720, móvil. */
  vitrinas: fuentesLocal("vitrinas-sofas"),
  /**
   * Las mismas vitrinas de champagne, recortadas en horizontal del vertical
   * (IMG_0412, a cámara lenta y en ida y vuelta). 1280×720, escritorio.
   */
  vitrinasAncho: fuentesLocal("vitrinas-ancho"),
  /** Pared de madera en abanico, casi quieta: el mejor bucle. 406×720. */
  pared: fuentesLocal("pared-madera-bucle"),
} as const;

/** Medidas de los pósters del local. */
export const POSTER_LOCAL_VERTICAL = { width: 406, height: 720 } as const;
export const POSTER_LOCAL_ANCHO = { width: 1280, height: 720 } as const;

/** Franja de /despues-de-cenar: la barra y las vitrinas, de cerca. */
export const CLIPS_DESPUES_DE_CENAR: Clip[] = (
  [
    {
      id: "barra-botellas",
      nombre: "La trasbarra",
      alt: "La trasbarra de Touza, con las ginebras y los licores bajo la tira de luz",
    },
    {
      id: "vitrina-krug",
      nombre: "Champagne en la vitrina",
      alt: "Botellas de Krug en la vitrina de Touza, con botellas ámbar al fondo",
    },
    {
      id: "figuras-vitrina-bucle",
      nombre: "Las figuras de la vitrina",
      alt: "Tres figuras con sombrero de copa, azul, amarilla y roja, en la vitrina sobre el mármol",
    },
  ] as const
)
  .map((clip): Clip => ({ ...clip, ...fuentesLocal(clip.id), origen: "local" }))
  .filter(hayVideo);

interface ConexionConAhorro {
  saveData?: boolean;
  effectiveType?: string;
}

/**
 * ¿Se puede poner vídeo? No con «reducir movimiento», ni con el ahorro de
 * datos activado, ni con una conexión de 3G o peor: entonces se quedan los
 * pósters. Solo en el navegador (en el SSG nunca hay vídeo).
 */
export function videoPermitido(): boolean {
  if (typeof window === "undefined") return false;
  if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return false;
  const conexion = (navigator as Navigator & { connection?: ConexionConAhorro }).connection;
  if (conexion?.saveData) return false;
  if (conexion?.effectiveType && /^(slow-2g|2g|3g)$/.test(conexion.effectiveType)) return false;
  return true;
}

// Un solo vídeo en marcha a la vez en toda la portada (hero y clips).
let enMarcha: HTMLVideoElement | null = null;

/** Reproduce este vídeo y pausa el que estuviera en marcha. */
export function reproducirSolo(video: HTMLVideoElement) {
  if (enMarcha && enMarcha !== video) enMarcha.pause();
  enMarcha = video;
  // iOS solo arranca solo un vídeo silenciado, y React no siempre pone el
  // atributo `muted` en el DOM: se fuerza aquí.
  video.muted = true;
  video.play().catch(() => {
    // Autoplay bloqueado (ahorro de batería de iOS…): se queda el póster.
  });
}

/** Pausa este vídeo (y deja de contarlo como el que está en marcha). */
export function pausar(video: HTMLVideoElement) {
  video.pause();
  if (enMarcha === video) enMarcha = null;
}
