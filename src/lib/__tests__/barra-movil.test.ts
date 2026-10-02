import { describe, expect, it } from "vitest";
import { muestraBarraMovil, SIN_BARRA_MOVIL } from "../barra-movil";
import { routes } from "../../App";

const hijas = routes[0].children ?? [];
const rutaDe = (path: string) => hijas.find((r) => r.path === path);
// Jerarquía de `matches` como la que da react-router: la raíz y la hija.
const matchesDe = (path: string) => [{ handle: routes[0].handle }, { handle: rutaDe(path)?.handle }];

describe("muestraBarraMovil", () => {
  it("sale si ninguna ruta de la jerarquía la quita", () => {
    expect(muestraBarraMovil([])).toBe(true);
    expect(muestraBarraMovil([{ handle: undefined }, { handle: { otro: 1 } }])).toBe(true);
  });

  it("no sale si una ruta declara SIN_BARRA_MOVIL", () => {
    expect(muestraBarraMovil([{ handle: undefined }, { handle: SIN_BARRA_MOVIL }])).toBe(false);
  });
});

describe("barra del móvil por ruta (handle en App.tsx)", () => {
  it("sale en las páginas de contenido", () => {
    for (const ruta of ["carta", "galeria", "aviso-legal", "privacidad", "cookies"]) {
      expect(muestraBarraMovil(matchesDe(ruta))).toBe(true);
    }
    const portada = hijas.find((r) => r.index);
    expect(muestraBarraMovil([{ handle: portada?.handle }])).toBe(true);
  });

  it("no sale en Contacto, que ya lleva Cómo llegar arriba", () => {
    expect(muestraBarraMovil(matchesDe("contacto"))).toBe(false);
  });

  it("el 404 se ve igual en /404 y en cualquier URL inventada (ruta *): con barra", () => {
    expect(muestraBarraMovil(matchesDe("404"))).toBe(true);
    expect(muestraBarraMovil(matchesDe("*"))).toBe(true);
    expect(rutaDe("404")?.handle).toEqual(rutaDe("*")?.handle);
  });
});
