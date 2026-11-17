// Sitemap, robots y llms.txt que se generan al acabar el prerenderizado.
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { generarSitemapYRobots, URL_PRODUCCION } from "../generar-sitemap.mjs";

const carpetas = [];
afterEach(() => {
  for (const c of carpetas.splice(0)) rmSync(c, { recursive: true, force: true });
});

function dist(ficheros) {
  const dir = mkdtempSync(path.join(tmpdir(), "sitemap-"));
  carpetas.push(dir);
  for (const [nombre, contenido] of Object.entries(ficheros)) writeFileSync(path.join(dir, nombre), contenido);
  return dir;
}

const PAGINAS = {
  "index.html": "",
  "carta.html": "",
  "contacto.html": "",
  "despues-de-cenar.html": "",
  "aviso-legal.html": "",
  "privacidad.html": "",
  "cookies.html": "",
  "404.html": "",
};

describe("generarSitemapYRobots", () => {
  it("sin legales ni 404, con la página nueva, sin changefreq ni priority", async () => {
    const dir = dist(PAGINAS);
    await generarSitemapYRobots(dir, "https://ejemplo.test/", { fechaDe: () => null });
    const xml = readFileSync(path.join(dir, "sitemap.xml"), "utf8");
    const locs = [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map((m) => m[1]);
    expect(locs).toEqual([
      "https://ejemplo.test/",
      "https://ejemplo.test/carta",
      "https://ejemplo.test/contacto",
      "https://ejemplo.test/despues-de-cenar",
    ]);
    expect(xml).not.toMatch(/changefreq|priority/);
  });

  it("lastmod real por página (la fecha que da git) y sin lastmod si no se sabe", async () => {
    const dir = dist(PAGINAS);
    const fechas = { "src/pages/Carta.tsx": "2026-11-14", "src/pages/Index.tsx": "2026-11-10" };
    await generarSitemapYRobots(dir, "https://ejemplo.test", { fechaDe: (rutas) => fechas[rutas[0]] ?? null });
    const xml = readFileSync(path.join(dir, "sitemap.xml"), "utf8");
    expect(xml).toContain("<loc>https://ejemplo.test/carta</loc>\n    <lastmod>2026-11-14</lastmod>");
    expect(xml).toContain("<loc>https://ejemplo.test/</loc>\n    <lastmod>2026-11-10</lastmod>");
    expect(xml).toContain("<loc>https://ejemplo.test/contacto</loc>\n  </url>");
  });

  it("robots apunta al sitemap y deja pasar a los rastreadores de IA", async () => {
    const dir = dist(PAGINAS);
    await generarSitemapYRobots(dir, "https://ejemplo.test", { fechaDe: () => null });
    const robots = readFileSync(path.join(dir, "robots.txt"), "utf8");
    expect(robots).toContain("Sitemap: https://ejemplo.test/sitemap.xml");
    expect(robots).toMatch(/User-agent: GPTBot\nAllow: \//);
  });

  it("llms.txt: en otro dominio (la demo) cambia los enlaces de producción por los del build", async () => {
    const dir = dist({ ...PAGINAS, "llms.txt": `- [Carta](${URL_PRODUCCION}/carta)\n` });
    await generarSitemapYRobots(dir, "https://demo.test", { fechaDe: () => null });
    expect(readFileSync(path.join(dir, "llms.txt"), "utf8")).toBe("- [Carta](https://demo.test/carta)\n");
  });

  it("llms.txt de public/ existe y solo usa datos de negocio.ts (horario y teléfono)", () => {
    const llms = readFileSync(path.resolve(process.cwd(), "public/llms.txt"), "utf8");
    expect(llms).toMatch(/^# Touza Cocktail Bar\n/);
    expect(llms).toContain("el jueves, de 16:00 a 01:00; el viernes, de 15:30 a 02:00; el sábado, de 15:00 a 02:00; el domingo, de 15:00 a 20:00");
    expect(llms).toContain("+34 966 782 000");
    expect(llms).toContain(`${URL_PRODUCCION}/despues-de-cenar`);
  });
});
