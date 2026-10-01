/**
 * Genera el favicon y el icono de iOS a partir de la cruz tau de Touza.
 *
 * Entrada : scripts/favicon/cruz-tau.png   (maestro: cruz negra sobre transparente)
 * Salida  : public/favicon.ico            (16, 32 y 48 px)
 *           public/apple-touch-icon.png   (180 px)
 *
 * Se ejecuta a mano (`npm run favicon`), igual que `npm run imagenes`.
 *
 * La cruz va en el dorado de la marca sobre el fondo oscuro de la web: negra y
 * sin fondo desaparecía en las pestañas en modo oscuro y en el icono de iOS
 * (que rellena la transparencia de negro).
 */
import { writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const origen = path.join(raiz, "scripts/favicon/cruz-tau.png");
const dirPublic = path.join(raiz, "public");

// --primary (hsl 38 65% 52%) y --background (hsl 0 0% 4%) de src/index.css.
const DORADO = "#D49A35";
const FONDO = "#0A0A0A";

/** La cruz recortada a su silueta y pintada de dorado, a `alto` px. */
async function cruz(alto) {
  const recortada = await sharp(origen).trim().toBuffer();
  const alfa = await sharp(recortada).extractChannel(3).raw().toBuffer({ resolveWithObject: true });
  const { width, height } = alfa.info;
  const dorada = await sharp({ create: { width, height, channels: 3, background: DORADO } })
    .joinChannel(alfa.data, { raw: { width, height, channels: 1 } })
    .png()
    .toBuffer();
  return sharp(dorada).resize({ height: alto }).toBuffer();
}

/**
 * Cuadrado de `lado` px con la cruz centrada ocupando `proporcion` del alto.
 * `radio` (fracción del lado) redondea las esquinas; 0 deja el cuadrado lleno,
 * que es lo que espera iOS (aplica su propia máscara).
 */
async function icono(lado, proporcion, radio) {
  const r = Math.round(lado * radio);
  const fondo = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${lado}" height="${lado}">` +
      `<rect width="${lado}" height="${lado}" rx="${r}" ry="${r}" fill="${FONDO}"/></svg>`,
  );
  return sharp(fondo)
    .composite([{ input: await cruz(Math.round(lado * proporcion)), gravity: "center" }])
    .png()
    .toBuffer();
}

/** ICO con las imágenes PNG embebidas (lo admiten todos los navegadores actuales). */
function ico(pngs) {
  const cabecera = Buffer.alloc(6);
  cabecera.writeUInt16LE(0, 0);
  cabecera.writeUInt16LE(1, 2);
  cabecera.writeUInt16LE(pngs.length, 4);
  const entradas = [];
  let desplazamiento = 6 + 16 * pngs.length;
  for (const { lado, datos } of pngs) {
    const e = Buffer.alloc(16);
    e.writeUInt8(lado >= 256 ? 0 : lado, 0);
    e.writeUInt8(lado >= 256 ? 0 : lado, 1);
    e.writeUInt16LE(1, 4); // planos
    e.writeUInt16LE(32, 6); // bits por píxel
    e.writeUInt32LE(datos.length, 8);
    e.writeUInt32LE(desplazamiento, 12);
    desplazamiento += datos.length;
    entradas.push(e);
  }
  return Buffer.concat([cabecera, ...entradas, ...pngs.map((p) => p.datos)]);
}

const tamanos = [16, 32, 48];
const pngs = await Promise.all(tamanos.map(async (lado) => ({ lado, datos: await icono(lado, 0.8, 0.2) })));
await writeFile(path.join(dirPublic, "favicon.ico"), ico(pngs));
await writeFile(path.join(dirPublic, "apple-touch-icon.png"), await icono(180, 0.64, 0));
console.log("public/favicon.ico (16, 32, 48) y public/apple-touch-icon.png (180)");
