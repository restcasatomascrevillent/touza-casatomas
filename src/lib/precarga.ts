/**
 * Precarga de imágenes en segundo plano, en orden y de dos en dos.
 *
 * La usa la carta para que las fotos de las botellas ya estén cuando se abre
 * una pestaña: la <img> de la fila, con la misma URL, la encuentra en la
 * caché del documento (como mucho, una revalidación con su ETag: Storage las
 * sirve con `no-cache`) en vez de bajar ~500 KB al cambiar de pestaña.
 *
 * - Cada URL se pide una sola vez por visita.
 * - De dos en dos: las primeras de la lista llegan antes que si se pidieran
 *   todas a la vez y se repartieran el ancho de banda.
 * - `delante`: pasan por delante de lo que ya esperaba en la cola (lo que el
 *   visitante está a punto de ver gana a la precarga «por si acaso»).
 * - Prioridad baja: nunca compite con el LCP ni con lo que ya está en pantalla.
 */
const pedidas = new Set<string>();
const cola: string[] = [];
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
    img.src = src;
  }
}

export function precargarImagenes(urls: ReadonlyArray<string | undefined | null>, { delante = false } = {}): void {
  if (typeof window === "undefined" || typeof Image === "undefined") return;
  const validas = [...new Set(urls.filter((url): url is string => !!url))];
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
  enCurso = 0;
}
