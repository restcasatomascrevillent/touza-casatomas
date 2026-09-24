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
 * Recortes verticales para dirección de arte (`<source media>`).
 *
 * El hero de la portada es apaisado (3:2) y en un móvil vertical se pinta con
 * `object-cover` a pantalla completa: solo se ve la franja central (~30 % del
 * ancho) y el resto se descarga para nada. El recorte centrado 1280×1708 (≈3:4)
 * contiene esa franja entera en cualquier pantalla con proporción ≤ 2:3 (todo
 * móvil en vertical), así que con `object-cover` centrado se ve el mismo
 * encuadre, con más resolución útil y menos bytes.
 * OJO: `left` debe dejar el recorte centrado — (2560 − 1280) / 2 = 640 — o el
 * encuadre se desplaza respecto al de escritorio.
 */
const RECORTES = [
  { origen: "touza-2.webp", nombre: "touza-2-movil", left: 640, top: 0, width: 1280, height: 1708, anchos: [600, 900] },
];

/** Imagen usada como og:image (1200×630 es el tamaño canónico de Open Graph). */
const OG_ORIGEN = "touza-2.webp";

async function main() {
  await mkdir(dirDestino, { recursive: true });

  const ficheros = (await readdir(dirOrigen)).filter((f) => /\.(webp|jpe?g|png)$/i.test(f));
  if (ficheros.length === 0) throw new Error(`No hay imágenes en ${dirOrigen}`);

  /** @type {Record<string, {width:number,height:number}>} */
  const dimensiones = {};

  for (const fichero of ficheros) {
    const nombre = path.parse(fichero).name;
    const entrada = path.join(dirOrigen, fichero);
    const meta = await sharp(entrada).metadata();
    dimensiones[nombre] = { width: meta.width, height: meta.height };

    for (const ancho of ANCHOS) {
      if (ancho > meta.width) continue;
      const base = sharp(entrada).resize({ width: ancho, withoutEnlargement: true });
      await base.clone().webp({ quality: 78 }).toFile(path.join(dirDestino, `${nombre}-${ancho}.webp`));
      await base.clone().avif({ quality: 55 }).toFile(path.join(dirDestino, `${nombre}-${ancho}.avif`));
      console.log(`  ${nombre}-${ancho}.{webp,avif}`);
    }
  }

  for (const r of RECORTES) {
    const entrada = path.join(dirOrigen, r.origen);
    dimensiones[r.nombre] = { width: r.width, height: r.height };
    for (const ancho of r.anchos) {
      const base = sharp(entrada)
        .extract({ left: r.left, top: r.top, width: r.width, height: r.height })
        .resize({ width: ancho, withoutEnlargement: true });
      await base.clone().webp({ quality: 78 }).toFile(path.join(dirDestino, `${r.nombre}-${ancho}.webp`));
      await base.clone().avif({ quality: 55 }).toFile(path.join(dirDestino, `${r.nombre}-${ancho}.avif`));
      console.log(`  ${r.nombre}-${ancho}.{webp,avif} (recorte)`);
    }
  }

  // og:image — JPEG por compatibilidad: varios rastreadores sociales aún no
  // resuelven AVIF/WebP. Va a public/ para tener URL estable sin hash.
  // Calidad 48 (antes 82): 159 KB → ~78 KB. Solo se ve como miniatura en las
  // tarjetas sociales, donde la diferencia no se aprecia. Se descarga en cada
  // vista previa de enlace (WhatsApp, Facebook…) y cuenta como Fast Data Transfer.
  await sharp(path.join(dirOrigen, OG_ORIGEN))
    .resize({ width: 1200, height: 630, fit: "cover", position: "centre" })
    .jpeg({ quality: 48, mozjpeg: true })
    .toFile(path.join(raiz, "public/og-image.jpg"));
  console.log("  public/og-image.jpg (1200×630)");

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
