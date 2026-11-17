/**
 * Genera `sitemap.xml` y `robots.txt` al terminar el prerenderizado, a partir
 * de los `.html` que realmente existen en `dist/` y de la URL base única, y
 * pone esa misma URL base en `llms.txt` (que viene de `public/`).
 *
 * Antes eran ficheros estáticos en `public/`: el sitemap listaba 5 URLs con
 * `lastmod` congelado en 2026-02-08 y ambos codificaban `touzabar.es` a mano.
 * Al generarlos, cambiar de dominio es cambiar `VITE_SITE_URL`.
 *
 * Sitemap (auditoría SEO/GEO del 15/11/2026, hallazgo 14):
 *  - `lastmod` REAL: la fecha del último commit que tocó los ficheros de la
 *    página (`FUENTES`). Sin historia fiable (sin git, o clon superficial cuyo
 *    commit frontera aparenta haberlo tocado todo) la URL va sin `lastmod`:
 *    mejor ninguna fecha que la del build, que Google aprende a ignorar.
 *  - Sin `changefreq` ni `priority`: Google no los usa.
 *  - Sin los textos legales: no responden a ninguna búsqueda.
 *
 * Se invoca desde `ssgOptions.onFinished` en vite.config.ts.
 */
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

/** Dominio de producción, el que lleva escrito `public/llms.txt`. */
export const URL_PRODUCCION = "https://touza.restaurantecasatomascrevillente.es";

/** Ficheros de los que sale cada página: su `lastmod` es el último commit que tocó alguno. */
export const FUENTES = {
  "/": ["src/pages/Index.tsx", "src/components/home"],
  "/carta": ["src/pages/Carta.tsx", "src/components/carta"],
  "/contacto": ["src/pages/Contacto.tsx"],
  "/despues-de-cenar": ["src/pages/DespuesDeCenar.tsx"],
};

/** Fuera del sitemap: el 404 y los textos legales. */
export const EXCLUIDAS = new Set(["/404", "/aviso-legal", "/privacidad", "/cookies"]);

/** Primero estas, en este orden; el resto, alfabético. */
const ORDEN = ["/", "/carta", "/contacto", "/despues-de-cenar"];

const git = (args, cwd) =>
  execFileSync("git", args, { cwd, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();

/**
 * Fecha (AAAA-MM-DD) del último commit que tocó alguno de `rutas`, o `null`
 * si no se puede saber con certeza.
 */
export function fechaGit(rutas, cwd = process.cwd()) {
  try {
    const [hash, fecha] = git(["log", "-1", "--format=%H %cs", "--", ...rutas], cwd).split(" ");
    if (!hash || !/^\d{4}-\d{2}-\d{2}$/.test(fecha ?? "")) return null;
    // En un clon superficial (Vercel clona así) el commit frontera no tiene
    // padres y git lo da como autor de todos los ficheros: su fecha no vale.
    const shallow = path.resolve(cwd, git(["rev-parse", "--git-path", "shallow"], cwd));
    if (existsSync(shallow) && readFileSync(shallow, "utf8").split(/\s+/).includes(hash)) return null;
    return fecha;
  } catch {
    return null;
  }
}

const posicion = (ruta) => {
  const i = ORDEN.indexOf(ruta);
  return i === -1 ? ORDEN.length : i;
};

export async function generarSitemapYRobots(dir, siteUrl, { fechaDe = fechaGit } = {}) {
  const base = siteUrl.replace(/\/+$/, "");

  const rutas = (await readdir(dir, { withFileTypes: true }))
    .filter((e) => e.isFile() && e.name.endsWith(".html"))
    .map((e) => (e.name === "index.html" ? "/" : `/${e.name.replace(/\.html$/, "")}`))
    .filter((ruta) => !EXCLUIDAS.has(ruta))
    .sort((a, b) => posicion(a) - posicion(b) || a.localeCompare(b));

  const urls = rutas
    .map((ruta) => {
      const fecha = FUENTES[ruta] ? fechaDe(FUENTES[ruta]) : null;
      return [
        "  <url>",
        `    <loc>${base}${ruta}</loc>`,
        ...(fecha ? [`    <lastmod>${fecha}</lastmod>`] : []),
        "  </url>",
      ].join("\n");
    })
    .join("\n");

  await writeFile(
    path.join(dir, "sitemap.xml"),
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
    "utf8",
  );

  // Los rastreadores de IA se permiten a propósito: para "¿dónde tomar un
  // cóctel en Crevillente?" solo pueden citar lo que esté en el HTML.
  const robots = `User-agent: Googlebot
Allow: /

User-agent: Bingbot
Allow: /

User-agent: Twitterbot
Allow: /

User-agent: facebookexternalhit
Allow: /

# Buscadores con IA — permitidos a propósito: queremos que nos citen
User-agent: GPTBot
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: Google-Extended
Allow: /

User-agent: *
Allow: /

Sitemap: ${base}/sitemap.xml
`;

  await writeFile(path.join(dir, "robots.txt"), robots, "utf8");

  // llms.txt (public/) lleva los enlaces con el dominio de producción; en un
  // build con otra URL base (la demo) se cambian por la de ese build.
  const llms = path.join(dir, "llms.txt");
  if (existsSync(llms) && base !== URL_PRODUCCION) {
    const texto = await readFile(llms, "utf8");
    await writeFile(llms, texto.split(URL_PRODUCCION).join(base), "utf8");
  }

  console.log(`[sitemap] ${rutas.length} URLs en ${base} → sitemap.xml + robots.txt`);
}
