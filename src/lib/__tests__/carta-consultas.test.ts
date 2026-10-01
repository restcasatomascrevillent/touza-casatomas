import { describe, it, expect } from "vitest";
import { ordenarVinos, COLUMNAS_VINOS, COLUMNAS_BEBIDAS } from "@/lib/carta-consultas.mjs";
import { agruparVinosPorTipo } from "@/lib/vinos-carta";
import type { Vino } from "@/hooks/useVinos";

const v = (id: string, nombre: string | null, orden: string | null, categoria = "VINOS TINTOS — RIOJA"): Vino => ({
  id,
  nombre,
  descripcion: null,
  precio_eur: 10,
  categoria,
  ubicacion_region: null,
  ubicacion_pais: null,
  denominacion_origen: null,
  featured: false,
  orden,
});

const ids = (vinos: Vino[]) => vinos.map((x) => x.id);

describe("ordenarVinos", () => {
  it("ordena `orden` (texto en la tabla) como número: '2' antes que '10'", () => {
    expect(ids(ordenarVinos([v("a", "A", "10"), v("b", "B", "2"), v("c", "C", "1")]))).toEqual(["c", "b", "a"]);
  });

  it("deja al final los `orden` vacíos, nulos o no numéricos", () => {
    const vinos = [v("a", "A", null), v("b", "B", ""), v("c", "C", "x"), v("d", "D", "3")];
    expect(ids(ordenarVinos(vinos))[0]).toBe("d");
  });

  it("con el mismo `orden` desempata por nombre sin mayúsculas ni tildes, y después por id", () => {
    const vinos = [
      v("3", "viña Ardanza", "0"),
      v("2", "Vina Ardanza", "0"),
      v("1", "Álvaro Palacios", "0"),
      v("4", "Muga", "0"),
    ];
    // "Álvaro" cuenta como "alvaro" (no al final, como haría la comparación
    // por código), y las dos "Viña/Vina Ardanza" empatan y van por id.
    expect(ids(ordenarVinos(vinos))).toEqual(["1", "4", "2", "3"]);
  });

  it("da el mismo resultado sea cual sea el orden de llegada (build y navegador coinciden)", () => {
    const vinos = [v("a", "Zeta", "0"), v("b", "Alfa", "0"), v("c", "Alfa", "0"), v("d", "Beta", "1")];
    const al_reves = [...vinos].reverse();
    expect(ids(ordenarVinos(vinos))).toEqual(ids(ordenarVinos(al_reves)));
  });

  it("no muta la lista de entrada", () => {
    const vinos = [v("a", "B", "0"), v("b", "A", "0")];
    ordenarVinos(vinos);
    expect(ids(vinos)).toEqual(["a", "b"]);
  });
});

describe("agruparVinosPorTipo con empates", () => {
  it("las denominaciones con el mismo número de vinos no dependen del orden de llegada", () => {
    const vinos = [
      v("1", "Uno", "0", "VINOS TINTOS — RIOJA"),
      v("2", "Dos", "0", "VINOS TINTOS — RIBERA DEL DUERO"),
    ];
    const etiquetas = (lista: Vino[]) => agruparVinosPorTipo(lista)[0].denominaciones.map((d) => d.etiqueta);
    expect(etiquetas(vinos)).toEqual(etiquetas([...vinos].reverse()));
  });
});

describe("columnas de la carta", () => {
  it("los vinos piden lo que pintan la carta, el agrupado, el orden y el JSON-LD", () => {
    const columnas = COLUMNAS_VINOS.split(",");
    for (const c of ["id", "nombre", "descripcion", "precio_eur", "categoria", "orden"]) {
      expect(columnas).toContain(c);
    }
    expect(columnas).not.toContain("*");
  });

  it("las bebidas incluyen `tipo`, que la carta pinta bajo el nombre", () => {
    expect(COLUMNAS_BEBIDAS.split(",")).toContain("tipo");
  });
});
