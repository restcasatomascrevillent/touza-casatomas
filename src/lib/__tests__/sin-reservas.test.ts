/**
 * Touza no acepta reservas por la web (decisión del dueño, 01/10/2026; la
 * Edge Function `reservas-web` del panel ya rechaza `marca=touza` con 409).
 * Estos tests vigilan que no vuelvan las rutas y que las URL antiguas
 * (enlaces guardados, buscadores, correos ya enviados) acaben en Contacto.
 */
import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
import { routes } from "../../App";

interface Redireccion {
  source: string;
  destination: string;
  statusCode?: number;
  permanent?: boolean;
}

const vercel = JSON.parse(readFileSync(path.resolve(__dirname, "../../../vercel.json"), "utf8")) as {
  redirects?: Redireccion[];
};

describe("sin reservas en la web", () => {
  it("App no declara /reservado ni /reserva/respuesta", () => {
    const hijas = (routes[0].children ?? []).map((r) => r.path ?? "");
    expect(hijas.filter((p) => /reserv/i.test(p))).toEqual([]);
  });

  it("vercel.json redirige las URL antiguas a /contacto con un 301", () => {
    const redirecciones = vercel.redirects ?? [];
    for (const origen of ["/reservado", "/reserva/respuesta", "/reserva/respuesta/:ruta*"]) {
      const r = redirecciones.find((x) => x.source === origen);
      expect(r, origen).toBeDefined();
      expect(r?.destination).toBe("/contacto");
      expect(r?.statusCode).toBe(301);
    }
  });
});
