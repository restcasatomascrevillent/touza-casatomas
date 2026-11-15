import { describe, it, expect } from "vitest";
import { agruparChampagne, fotoPropia, opacidadFotograma, resumenCocteles, slugCarta } from "@/lib/carta";

describe("slugCarta", () => {
  it("minúsculas, sin tildes ni apóstrofos, con guiones", () => {
    expect(slugCarta("Moscow Mule")).toBe("moscow-mule");
    expect(slugCarta("Piña Colada")).toBe("pina-colada");
    expect(slugCarta("Jack Daniel's Apple")).toBe("jack-daniels-apple");
    expect(slugCarta("Escocés en el Trópico")).toBe("escoces-en-el-tropico");
    expect(slugCarta("  Clover Club ")).toBe("clover-club");
  });
});

describe("fotoPropia", () => {
  it("descarta las fotos de banco (Unsplash) y los vacíos", () => {
    expect(fotoPropia("https://images.unsplash.com/photo-1514362545857?w=500")).toBe("");
    expect(fotoPropia(null)).toBe("");
    expect(fotoPropia(undefined)).toBe("");
    expect(fotoPropia("https://x.supabase.co/storage/v1/object/public/c/mojito.webp")).toBe(
      "https://x.supabase.co/storage/v1/object/public/c/mojito.webp"
    );
  });
});

describe("resumenCocteles", () => {
  it("cuenta los cócteles, nombra las categorías y da el rango de precios", () => {
    expect(
      resumenCocteles([
        { categoria: "autor", precio_eur: 10 },
        { categoria: "clasicos", precio_eur: 8.5 },
        { categoria: "sin-alcohol", precio_eur: 7 },
      ])
    ).toBe("3 cócteles de autor, clásicos y sin alcohol, de 7 a 10\u00A0€");
  });

  it("decimales con coma y un solo precio", () => {
    expect(resumenCocteles([{ categoria: "clasicos", precio_eur: 8.5 }])).toBe("1 cóctel clásico, a 8,50\u00A0€");
    expect(resumenCocteles([{ categoria: "autor", precio_eur: 9 }, { categoria: "clasicos", precio_eur: 8.5 }])).toBe(
      "2 cócteles de autor y clásicos, de 8,50 a 9\u00A0€"
    );
  });

  it("null sin cócteles; sin precios, sin rango", () => {
    expect(resumenCocteles([])).toBeNull();
    expect(resumenCocteles([{ categoria: null, precio_eur: null }])).toBe("1 cóctel");
  });
});

describe("agruparChampagne", () => {
  const botellas = (nombres: string[]) => nombres.map((name) => ({ name }));

  it("brut, rosado y de añada; un rosado de añada va con los rosados", () => {
    const grupos = agruparChampagne(
      botellas([
        "Collet Brut",
        "Ruinart Blanc de Blancs",
        "Laurent‑Perrier Rosé",
        "Piper‑Heidsieck Rosado",
        "Dom Pérignon Rosé Vintage 2005",
        "Dom Pérignon Vintage 2013",
        "Laurent‑Perrier Millésimé 2015",
        "L. Roederer Collection 243",
      ])
    );
    expect(grupos.map((g) => g.titulo)).toEqual(["Brut", "Rosado", "De añada"]);
    expect(grupos[0].items.map((i) => i.name)).toEqual(["Collet Brut", "Ruinart Blanc de Blancs", "L. Roederer Collection 243"]);
    expect(grupos[1].items.map((i) => i.name)).toContain("Dom Pérignon Rosé Vintage 2005");
    expect(grupos[2].items.map((i) => i.name)).toEqual(["Dom Pérignon Vintage 2013", "Laurent‑Perrier Millésimé 2015"]);
  });

  it("con pocas botellas o un solo tipo, lista entera sin subtítulos", () => {
    expect(agruparChampagne(botellas(["Krug", "Ruinart Rosé"]))).toEqual([
      { titulo: null, items: botellas(["Krug", "Ruinart Rosé"]) },
    ]);
    const soloBrut = botellas(Array.from({ length: 10 }, (_, i) => `Brut ${i}`));
    expect(agruparChampagne(soloBrut)).toEqual([{ titulo: null, items: soloBrut }]);
  });
});

describe("opacidadFotograma (fundido cruzado del hero de la carta)", () => {
  it("en f = 2,4 el fotograma 2 está entero, el 3 al 40 % y el 4 apagado", () => {
    expect(opacidadFotograma(2, 2.4)).toBe(1);
    expect(opacidadFotograma(3, 2.4)).toBeCloseTo(0.4);
    expect(opacidadFotograma(4, 2.4)).toBe(0);
  });

  it("al principio solo se ve el primero y al final todos encima", () => {
    expect(opacidadFotograma(1, 0)).toBe(0);
    expect(opacidadFotograma(9, 9)).toBe(1);
  });
});
