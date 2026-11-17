/**
 * El único vídeo de la web: el clip de la trasbarra en «El local» de la
 * portada (components/home/ElLocal.tsx, con `VideoAmbiente`).
 *
 * Hasta el 16/11/2026 había un bucle en el hero, una franja de clips «En la
 * barra» y tres clips en /despues-de-cenar, exportados a 406×720: se veían
 * mal y se quitaron. Este viene de los originales en 4K (color natural, sin
 * LUT), a 1080×1920 en vertical y 1920×1080 en horizontal, 6 s en ida y
 * vuelta, sin audio. Solo MP4 (H.264): el WebM (VP9) pesaba lo mismo o más.
 * Los ficheros están en `src/assets/videos/local/`; el proceso, fuera del
 * repo (touza-recursos/videos-interior/web-hd/LISTO.txt).
 *
 * Se leen con `import.meta.glob`: si faltan, el glob queda vacío, el build no
 * falla y «El local» se queda con sus fotos. Vite emite cada fichero a
 * /assets con hash (caché inmutable, como las fotos).
 */

type Urls = Record<string, string>;

// Vite exige las opciones del glob escritas en línea (no en una constante).
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

const buscar = (urls: Urls, nombre: string) =>
  Object.entries(urls).find(([ruta]) => ruta.endsWith(`/${nombre}`))?.[1];

export const hayVideo = (f: FuentesVideo) => Boolean(f.webm || f.mp4);

const fuentesLocal = (nombre: string): FuentesVideo => ({
  webm: buscar(urlsLocal, `${nombre}.webm`),
  mp4: buscar(urlsLocal, `${nombre}.mp4`),
  poster: buscar(urlsLocal, `${nombre}.webp`),
});

/**
 * La trasbarra: ginebras y licores bajo la tira de luz, con un vaivén lento
 * de cámara. El vertical en el móvil y el horizontal desde md, que es donde
 * el marco de «El local» pasa de 4:5 a 16:9 (la misma media query va en el
 * <source> del póster y en la elección del vídeo).
 */
export const CLIP_EL_LOCAL = {
  vertical: fuentesLocal("barra-botellas-vertical"),
  horizontal: fuentesLocal("barra-botellas-horizontal"),
} as const;

export const MEDIA_CLIP_HORIZONTAL = "(min-width: 768px)";

/** Medidas de los pósters (primer fotograma, a la resolución del vídeo). */
export const POSTER_VERTICAL = { width: 1080, height: 1920 } as const;
export const POSTER_HORIZONTAL = { width: 1920, height: 1080 } as const;

interface ConexionConAhorro {
  saveData?: boolean;
  effectiveType?: string;
}

/**
 * ¿Se puede poner vídeo? No con «reducir movimiento», ni con el ahorro de
 * datos activado, ni con una conexión de 3G o peor: entonces se queda el
 * póster. Solo en el navegador (en el SSG nunca hay vídeo).
 */
export function videoPermitido(): boolean {
  if (typeof window === "undefined") return false;
  if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return false;
  const conexion = (navigator as Navigator & { connection?: ConexionConAhorro }).connection;
  if (conexion?.saveData) return false;
  if (conexion?.effectiveType && /^(slow-2g|2g|3g)$/.test(conexion.effectiveType)) return false;
  return true;
}

// Un solo vídeo en marcha a la vez.
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
