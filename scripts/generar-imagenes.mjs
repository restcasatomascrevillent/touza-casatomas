/**
 * Genera las variantes responsive de las imágenes del sitio.
 *
 * Entrada : src/assets/originales/*.webp   (maestros, NO se empaquetan)
 * Salida  : src/assets/img/<nombre>-<ancho>.{avif,webp}  + public/og-image.jpg
 *
 * Se ejecuta a mano (`npm run imagenes`), no en cada build: las fotos de
 * ambiente son fijas y así `sharp` no entra en la ruta crítica del despliegue.
 *
 * Contexto: estas 6 fotos se hotlinkeaban de
 * `restaurantecasatomascrevillente.es/wp-content/…`. El día que ese dominio
 * sirva la web nueva del restaurante, /wp-content deja de existir y se rompen
 * todas a la vez (hero, og:image y galería incluidos). Por eso viven aquí.
 */
import { mkdir, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dirOrigen = path.join(raiz, "src/assets/originales");
const dirDestino = path.join(raiz, "src/assets/img");

/**
 * Anchos objetivo. Nunca se amplía por encima del original.
 *
 * 1200 existe por los móviles de DPR 3 (360–390 px × 3 ≈ 1080–1170 px): con
 * `sizes="100vw"` saltaban a la de 1600 (~1,5–1,8× los bytes) aunque 1200 ya
 * cubre su densidad. Ahorra Fast Data Transfer sin cambio visible.
 */
const ANCHOS = [640, 1024, 1200, 1600];

/**
 * Anchos de más para las fotos que se pintan a todo el ancho de la ventana:
 * el hero de la portada y la cabecera de /contacto. Llegan al ancho del
 * maestro (2560): un escritorio de 1440 px a densidad 2 pide 2880 y con el
 * tope de 1600 se veían blandas.
 */
const ANCHOS_EXTRA = { "touza-2": [2048, 2560], "touza-estanteria": [2048, 2560] };

/**
 * Calidad. Las fotos grandes del local (el hero y «El local» de la portada)
 * van algo más altas: son lo primero que se ve y con 78/55 las texturas (el
 * sofá, el mármol) se empastaban.
 */
const CALIDAD = { webp: 78, avif: 55 };
const CALIDAD_ALTA = { webp: 84, avif: 63 };
const FOTOS_GRANDES = new Set(["touza-2", "touza-2-movil", "touza-salon-noche", "touza-botellero", "touza-letrero"]);
const calidadDe = (nombre) => (FOTOS_GRANDES.has(nombre) ? CALIDAD_ALTA : CALIDAD);

/**
 * Recortes verticales para dirección de arte (`<source media>`).
 *
 * El hero de la portada es apaisado (3:2) y en un móvil vertical se pinta con
 * `object-cover` a pantalla completa: solo se ve la franja central y el resto
 * se descargaría para nada. El recorte centrado 1080×1708 contiene esa franja
 * entera en cualquier pantalla con proporción ≤ 5:8 (todo móvil en vertical),
 * así que con `object-cover` centrado se ve el mismo encuadre.
 *
 * Va a TODA la altura del maestro (1708 px): en un móvil de 844 px de alto son
 * 2 píxeles de foto por píxel CSS, el máximo que da el original. Antes se
 * servía a 600 o 900 px de ancho (800–1200 de alto) y en pantallas de
 * densidad 3 el salón se veía blando.
 * OJO: `left` debe dejar el recorte centrado — (2560 − 1080) / 2 = 740 — o el
 * encuadre se desplaza respecto al de escritorio.
 */
const RECORTES = [
  { origen: "touza-2.webp", nombre: "touza-2-movil", left: 740, top: 0, width: 1080, height: 1708, anchos: [540, 720, 1080] },
];

/**
 * Zonas que se desenfocan ANTES de generar las variantes (el maestro no se
 * toca). En `touza-2`, al fondo, la puerta de cristal deja ver el comedor de
 * Casa Tomás con clientes sentados: en la web no sale gente (16/11/2026), así
 * que los tres paños de cristal quedan como vidrio esmerilado, sin tocar los
 * perfiles de la puerta ni la barandilla. Coordenadas en píxeles del maestro
 * (2560×1708). Para quitarlo, basta borrar la entrada y regenerar.
 */
const DESENFOQUES = {
  "touza-2.webp": {
    sigma: 14,
    zonas: [
      [[1775, 196], [1831, 196], [1799, 523], [1752, 512]],
      [[1845, 196], [1949, 196], [1908, 550], [1813, 527]],
      [[1975, 196], [2047, 196], [2004, 573], [1934, 557]],
    ],
  },
};

/** Imagen usada como og:image (1200×630 es el tamaño canónico de Open Graph). */
const OG_ORIGEN = "touza-2.webp";

/**
 * `--solo touza-2 touza-letrero`: genera solo esos maestros (y sus recortes).
 * Sin el argumento, todos. `dimensiones.json` se escribe siempre entero.
 */
const iSolo = process.argv.indexOf("--solo");
const SOLO = iSolo === -1 ? null : new Set(process.argv.slice(iSolo + 1));
const toca = (nombre) => !SOLO || SOLO.has(nombre);

/**
 * El maestro listo para generar: tal cual o con sus zonas desenfocadas.
 *
 * En dos pasos a propósito: sharp no aplica las operaciones en el orden en
 * que se escriben, y con `removeAlpha().blur().joinChannel(máscara)` en una
 * sola cadena la máscara se perdía y salía TODA la foto desenfocada.
 */
const preparados = new Map();
function cargar(fichero) {
  if (!preparados.has(fichero)) preparados.set(fichero, preparar(fichero));
  return preparados.get(fichero);
}

async function preparar(fichero) {
  const entrada = path.join(dirOrigen, fichero);
  const plan = DESENFOQUES[fichero];
  if (!plan) return entrada;
  const { width, height } = await sharp(entrada).metadata();
  const poligonos = plan.zonas
    .map((zona) => `<polygon points="${zona.map((p) => p.join(",")).join(" ")}" fill="#fff"/>`)
    .join("");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><rect width="${width}" height="${height}" fill="#000"/>${poligonos}</svg>`;
  // Máscara (blanco = desenfocar) con el borde difuminado 2 px: sin él, el corte se nota.
  const mascara = await sharp(Buffer.from(svg)).resize(width, height).blur(2).extractChannel(0).raw().toBuffer();
  const borroso = await sharp(entrada).removeAlpha().blur(plan.sigma).raw().toBuffer();
  const capa = await sharp(borroso, { raw: { width, height, channels: 3 } })
    .joinChannel(mascara, { raw: { width, height, channels: 1 } })
    .png({ compressionLevel: 1 })
    .toBuffer();
  return sharp(entrada).composite([{ input: capa }]).png({ compressionLevel: 1 }).toBuffer();
}

async function main() {
  await mkdir(dirDestino, { recursive: true });

  const ficheros = (await readdir(dirOrigen)).filter((f) => /\.(webp|jpe?g|png)$/i.test(f));
  if (ficheros.length === 0) throw new Error(`No hay imágenes en ${dirOrigen}`);

  /** @type {Record<string, {width:number,height:number}>} */
  const dimensiones = {};

  for (const fichero of ficheros) {
    const nombre = path.parse(fichero).name;
    const meta = await sharp(path.join(dirOrigen, fichero)).metadata();
    dimensiones[nombre] = { width: meta.width, height: meta.height };
    if (!toca(nombre)) continue;

    const entrada = await cargar(fichero);
    const calidad = calidadDe(nombre);
    for (const ancho of [...ANCHOS, ...(ANCHOS_EXTRA[nombre] ?? [])]) {
      if (ancho > meta.width) continue;
      const base = sharp(entrada).resize({ width: ancho, withoutEnlargement: true });
      await base.clone().webp({ quality: calidad.webp }).toFile(path.join(dirDestino, `${nombre}-${ancho}.webp`));
      await base.clone().avif({ quality: calidad.avif }).toFile(path.join(dirDestino, `${nombre}-${ancho}.avif`));
      console.log(`  ${nombre}-${ancho}.{webp,avif}`);
    }
  }

  for (const r of RECORTES) {
    dimensiones[r.nombre] = { width: r.width, height: r.height };
    if (!toca(path.parse(r.origen).name)) continue;
    const entrada = await cargar(r.origen);
    const calidad = calidadDe(r.nombre);
    for (const ancho of r.anchos) {
      const base = sharp(entrada)
        .extract({ left: r.left, top: r.top, width: r.width, height: r.height })
        .resize({ width: ancho, withoutEnlargement: true });
      await base.clone().webp({ quality: calidad.webp }).toFile(path.join(dirDestino, `${r.nombre}-${ancho}.webp`));
      await base.clone().avif({ quality: calidad.avif }).toFile(path.join(dirDestino, `${r.nombre}-${ancho}.avif`));
      console.log(`  ${r.nombre}-${ancho}.{webp,avif} (recorte)`);
    }
  }

  // og:image — JPEG por compatibilidad: varios rastreadores sociales aún no
  // resuelven AVIF/WebP. Va a public/ para tener URL estable sin hash.
  // Calidad 48 (antes 82): 159 KB → ~78 KB. Solo se ve como miniatura en las
  // tarjetas sociales, donde la diferencia no se aprecia. Se descarga en cada
  // vista previa de enlace (WhatsApp, Facebook…) y cuenta como Fast Data Transfer.
  if (toca(path.parse(OG_ORIGEN).name)) {
    await sharp(await cargar(OG_ORIGEN))
      .resize({ width: 1200, height: 630, fit: "cover", position: "centre" })
      .jpeg({ quality: 48, mozjpeg: true })
      .toFile(path.join(raiz, "public/og-image.jpg"));
    console.log("  public/og-image.jpg (1200×630)");
  }

  // Las dimensiones intrínsecas se consumen desde src/assets/imagenes.ts para
  // poder emitir width/height en el HTML y evitar saltos de maquetación (CLS).
  await writeFile(
    path.join(dirDestino, "dimensiones.json"),
    `${JSON.stringify(dimensiones, null, 2)}\n`,
    "utf8",
  );
  console.log("  src/assets/img/dimensiones.json");
}

main().catch((err) => {
  console.error("[generar-imagenes] ", err);
  process.exit(1);
});
