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

/** Anchos objetivo. Nunca se amplía por encima del original. */
const ANCHOS = [640, 1024, 1600];

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

  // og:image — JPEG por compatibilidad: varios rastreadores sociales aún no
  // resuelven AVIF/WebP. Va a public/ para tener URL estable sin hash.
  await sharp(path.join(dirOrigen, OG_ORIGEN))
    .resize({ width: 1200, height: 630, fit: "cover", position: "centre" })
    .jpeg({ quality: 82, mozjpeg: true })
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
