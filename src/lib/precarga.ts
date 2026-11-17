/**
 * Precarga de imágenes en segundo plano, en orden y de dos en dos.
 *
 * La usa la carta para que las fotos de las botellas ya estén cuando se abre
 * una pestaña: la <img> de la fila, con la misma URL, la encuentra en la
 * caché del documento en vez de pedirla al cambiar de pestaña.
 *
 * - Con `srcSet` y `sizes` (src/lib/foto.ts) la precarga elige el mismo
 *   candidato que elegirá la <img> (el ancho de la miniatura en esa pantalla),
 *   no la foto original de ~500 KB.
 *
 * - Cada URL se pide una sola vez por visita.
 * - De dos en dos: las primeras de la lista llegan antes que si se pidieran
 *   todas a la vez y se repartieran el ancho de banda.
 * - `delante`: pasan por delante de lo que ya esperaba en la cola (lo que el
 *   visitante está a punto de ver gana a la precarga «por si acaso»).
 * - Prioridad baja: nunca compite con el LCP ni con lo que ya está en pantalla.
 */
import type { FotoResponsive } from "@/lib/foto";

const pedidas = new Set<string>();
const cola: string[] = [];
/** srcset y sizes de cada `src` en cola, si los tiene. */
const variantes = new Map<string, FotoResponsive>();
let enCurso = 0;
const A_LA_VEZ = 2;

function siguiente() {
  while (enCurso < A_LA_VEZ && cola.length > 0) {
    const src = cola.shift() as string;
    enCurso += 1;
    const img = new Image();
    (img as HTMLImageElement & { fetchPriority?: string }).fetchPriority = "low";
    img.decoding = "async";
    img.onload = img.onerror = () => {
      enCurso -= 1;
      siguiente();
    };
    const foto = variantes.get(src);
    variantes.delete(src);
    // `sizes` y `srcset` antes que `src`: así se elige el candidato una sola vez.
    if (foto?.srcSet) {
      img.sizes = foto.sizes ?? "100vw";
      img.srcset = foto.srcSet;
    }
    img.src = src;
  }
}

export function precargarImagenes(
  fotos: ReadonlyArray<string | FotoResponsive | undefined | null>,
  { delante = false } = {},
): void {
  if (typeof window === "undefined" || typeof Image === "undefined") return;
  const urls: string[] = [];
  for (const foto of fotos) {
    if (!foto) continue;
    if (typeof foto === "string") urls.push(foto);
    else if (foto.src) {
      urls.push(foto.src);
      if (foto.srcSet && !pedidas.has(foto.src)) variantes.set(foto.src, foto);
    }
  }
  const validas = [...new Set(urls)];
  const nuevas = validas.filter((url) => !pedidas.has(url));
  nuevas.forEach((url) => pedidas.add(url));
  if (delante) {
    // Las nuevas y las que aún esperaban en la cola, al principio y en orden.
    const adelantar = validas.filter((url) => nuevas.includes(url) || cola.includes(url));
    for (const url of adelantar) {
      const posicion = cola.indexOf(url);
      if (posicion !== -1) cola.splice(posicion, 1);
    }
    cola.unshift(...adelantar);
  } else {
    cola.push(...nuevas);
  }
  siguiente();
}

/** `false` con «ahorro de datos» o conexiones lentas (2G/3G): ahí no se precarga «por si acaso». */
export function conexionRapida(): boolean {
  const conexion = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
  if (!conexion) return true;
  if (conexion.saveData) return false;
  return !/(^|-)(2g|3g)$/.test(conexion.effectiveType ?? "");
}

/** Solo para los tests. */
export function _reiniciarPrecarga(): void {
  pedidas.clear();
  cola.length = 0;
  variantes.clear();
  enCurso = 0;
}
