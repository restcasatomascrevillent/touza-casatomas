import { describe, it, expect } from "vitest";
import { agruparVinosPorTipo, capitalizarEtiqueta } from "../vinos-carta";
import type { Vino } from "@/hooks/useVinos";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

let contador = 0;
function vino(categoria: string | null, overrides: Partial<Vino> = {}): Vino {
  contador += 1;
  return {
    id: `v-${contador}`,
    nombre: `Vino ${contador}`,
    descripcion: null,
    precio_eur: 10,
    categoria,
    ubicacion_region: null,
    ubicacion_pais: null,
    denominacion_origen: null,
    featured: false,
    orden: String(contador),
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// capitalizarEtiqueta
// ---------------------------------------------------------------------------

describe("capitalizarEtiqueta", () => {
  it("pone en minúscula los conectores salvo al abrir la etiqueta", () => {
    expect(capitalizarEtiqueta("RIBERA DEL DUERO")).toBe("Ribera del Duero");
  });

  it("capitaliza palabras normales sin conectores", () => {
    expect(capitalizarEtiqueta("OTRAS DENOMINACIONES")).toBe("Otras Denominaciones");
  });

  it("capitaliza una sola palabra", () => {
    expect(capitalizarEtiqueta("RIOJA")).toBe("Rioja");
  });

  it("respeta paréntesis y acentos", () => {
    expect(capitalizarEtiqueta("ALBARIÑO (RÍAS BAIXAS)")).toBe("Albariño (Rías Baixas)");
  });
});

// ---------------------------------------------------------------------------
// agruparVinosPorTipo
// ---------------------------------------------------------------------------

describe("agruparVinosPorTipo", () => {
  it("agrupa por tipo (antes del guion) y por denominación (después)", () => {
    const vinos = [
      ...Array.from({ length: 3 }, () => vino("VINOS TINTOS — RIBERA DEL DUERO")),
      ...Array.from({ length: 2 }, () => vino("VINOS TINTOS — RIOJA")),
      vino("VINOS TINTOS — OTRAS DENOMINACIONES"),
      ...Array.from({ length: 2 }, () => vino("VINOS BLANCOS — ALBARIÑO (RÍAS BAIXAS)")),
      vino("VINOS BLANCOS — OTRAS DENOMINACIONES"),
    ];

    const grupos = agruparVinosPorTipo(vinos);

    expect(grupos.map((g) => g.etiqueta)).toEqual(["Blancos", "Tintos"]);

    const tintos = grupos.find((g) => g.etiqueta === "Tintos")!;
    expect(tintos.vinos).toHaveLength(6);
    expect(tintos.denominaciones.map((d) => d.etiqueta)).toEqual([
      "Ribera del Duero",
      "Rioja",
      "Otras Denominaciones",
    ]);

    const blancos = grupos.find((g) => g.etiqueta === "Blancos")!;
    expect(blancos.vinos).toHaveLength(3);
    expect(blancos.denominaciones.map((d) => d.etiqueta)).toEqual([
      "Albariño (Rías Baixas)",
      "Otras Denominaciones",
    ]);
  });

  it("pone 'Blancos' antes que 'Tintos' aunque en los datos vengan al revés", () => {
    const vinos = [vino("VINOS TINTOS — RIOJA"), vino("VINOS BLANCOS — RIOJA")];
    const grupos = agruparVinosPorTipo(vinos);
    expect(grupos.map((g) => g.etiqueta)).toEqual(["Blancos", "Tintos"]);
  });

  it("deja 'Otras denominaciones' siempre al final aunque tenga más vinos que las demás", () => {
    const vinos = [
      ...Array.from({ length: 5 }, () => vino("VINOS TINTOS — OTRAS DENOMINACIONES")),
      ...Array.from({ length: 2 }, () => vino("VINOS TINTOS — RIBERA DEL DUERO")),
    ];
    const [tintos] = agruparVinosPorTipo(vinos);
    expect(tintos.denominaciones.map((d) => d.etiqueta)).toEqual([
      "Ribera del Duero",
      "Otras Denominaciones",
    ]);
  });

  // Caso concreto del bug original: una categoría que el código anterior no
  // conocía (no estaba en la lista escrita a mano de Carta.tsx) debe seguir
  // apareciendo, en vez de desaparecer de la carta.
  it("no descarta un tipo de vino nuevo que no estuviera contemplado de antemano", () => {
    // "VINOS GENEROSOS" no está en ORDEN_TIPOS (a propósito: es el caso de
    // un tipo que nadie previó, el mismo síntoma que tenía el bug original).
    const vinos = [vino("VINOS GENEROSOS — JEREZ"), vino("VINOS TINTOS — RIOJA")];
    const grupos = agruparVinosPorTipo(vinos);
    expect(grupos.map((g) => g.etiqueta)).toContain("Generosos");
    const total = grupos.reduce((suma, g) => suma + g.vinos.length, 0);
    expect(total).toBe(2);
    // Un tipo no listado en ORDEN_TIPOS se coloca detrás de los conocidos.
    expect(grupos.map((g) => g.etiqueta)).toEqual(["Tintos", "Generosos"]);
  });

  it("agrupa bajo 'Otros' una categoría del tipo esperado sin denominación (sin guion)", () => {
    const vinos = [vino("VINOS TINTOS")];
    const [tintos] = agruparVinosPorTipo(vinos);
    expect(tintos.etiqueta).toBe("Tintos");
    expect(tintos.denominaciones.map((d) => d.etiqueta)).toEqual(["Otros"]);
  });

  it("ignora filas sin categoría", () => {
    const vinos = [vino(null), vino("VINOS TINTOS — RIOJA")];
    const grupos = agruparVinosPorTipo(vinos);
    expect(grupos.reduce((suma, g) => suma + g.vinos.length, 0)).toBe(1);
  });

  it("devuelve [] cuando no hay vinos", () => {
    expect(agruparVinosPorTipo([])).toEqual([]);
  });

  it("da ids estables y distintos a cada denominación", () => {
    const vinos = [vino("VINOS TINTOS — RIBERA DEL DUERO"), vino("VINOS TINTOS — RIOJA")];
    const [tintos] = agruparVinosPorTipo(vinos);
    const ids = tintos.denominaciones.map((d) => d.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(tintos.id).toBe("tintos");
  });
});
