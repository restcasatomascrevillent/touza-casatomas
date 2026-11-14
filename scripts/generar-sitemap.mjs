/**
 * Genera `sitemap.xml` y `robots.txt` al terminar el prerenderizado, a partir
 * de los `.html` que realmente existen en `dist/` y de la URL base única.
 *
 * Antes eran ficheros estáticos en `public/`: el sitemap listaba 5 URLs con
 * `lastmod` congelado en 2026-02-08 y ambos codificaban `touzabar.es` a mano.
 * Al generarlos, cambiar de dominio es cambiar `VITE_SITE_URL`.
 *
 * Se invoca desde `ssgOptions.onFinished` en vite.config.ts.
 */
import { readdir, writeFile } from "node:fs/promises";
import path from "node:path";

/** Prioridad y frecuencia por ruta; el resto hereda el valor por defecto. */
const AJUSTES = {
  "/": { priority: "1.0", changefreq: "weekly" },
  "/carta": { priority: "0.9", changefreq: "weekly" },
  "/contacto": { priority: "0.6", changefreq: "monthly" },
  // Textos legales: indexables (dan confianza y datos del titular), pero al final.
  "/aviso-legal": { priority: "0.2", changefreq: "yearly" },
  "/privacidad": { priority: "0.2", changefreq: "yearly" },
  "/cookies": { priority: "0.2", changefreq: "yearly" },
};

const POR_DEFECTO = { priority: "0.5", changefreq: "monthly" };

/** `404.html` no se indexa; tampoco los parciales del propio SSG. */
const EXCLUIDAS = new Set(["/404"]);

export async function generarSitemapYRobots(dir, siteUrl) {
  const base = siteUrl.replace(/\/+$/, "");
  const hoy = new Date().toISOString().slice(0, 10);

  const rutas = (await readdir(dir, { withFileTypes: true }))
    .filter((e) => e.isFile() && e.name.endsWith(".html"))
    .map((e) => (e.name === "index.html" ? "/" : `/${e.name.replace(/\.html$/, "")}`))
    .filter((ruta) => !EXCLUIDAS.has(ruta))
    .sort((a, b) => Number(AJUSTES[b]?.priority ?? 0) - Number(AJUSTES[a]?.priority ?? 0) || a.localeCompare(b));

  const urls = rutas
    .map((ruta) => {
      const { priority, changefreq } = AJUSTES[ruta] ?? POR_DEFECTO;
      return [
        "  <url>",
        `    <loc>${base}${ruta}</loc>`,
        `    <lastmod>${hoy}</lastmod>`,
        `    <changefreq>${changefreq}</changefreq>`,
        `    <priority>${priority}</priority>`,
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

  console.log(`[sitemap] ${rutas.length} URLs en ${base} → sitemap.xml + robots.txt`);
}
