import { describe, it, expect } from "vitest";
import {
  agruparChampagne,
  descripcionCarta,
  descripcionDespuesDeCenar,
  descripcionPortada,
  fotoPropia,
  nombreBase,
  rangoPrecios,
  resumenCocteles,
  slugCarta,
} from "@/lib/carta";

describe("nombreBase", () => {
  it("enseña el nombre bonito, no el identificador de la base de datos", () => {
    expect(nombreBase("sin-alcohol")).toBe("Sin alcohol");
    expect(nombreBase("cachaca")).toBe("Cachaça");
    expect(nombreBase("ginebra")).toBe("Ginebra");
    expect(nombreBase("Whisky")).toBe("Whisky");
  });

  it("sin base (o la de por defecto, «all») no enseña nada", () => {
    expect(nombreBase("all")).toBeNull();
    expect(nombreBase("")).toBeNull();
    expect(nombreBase(null)).toBeNull();
  });

  it("una base nueva sale legible aunque no esté en la lista", () => {
    expect(nombreBase("brandy-de-jerez")).toBe("Brandy de jerez");
  });
});

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

describe("meta descripciones con las cifras de la carta (auditoría del 16/11/2026)", () => {
  const carta = [
    ...Array.from({ length: 9 }, () => ({ categoria: "autor", precio_eur: 10 })),
    ...Array.from({ length: 7 }, () => ({ categoria: "clasicos", precio_eur: 9 })),
    ...Array.from({ length: 2 }, () => ({ categoria: "sin-alcohol", precio_eur: 7 })),
  ];

  it("rango de precios: «de 7 a 10 €», «a 9 €» o nada", () => {
    expect(rangoPrecios(carta)).toBe("de 7 a 10\u00A0€");
    expect(rangoPrecios([{ precio_eur: 9 }, { precio_eur: 9 }])).toBe("a 9\u00A0€");
    expect(rangoPrecios([{ precio_eur: null }])).toBeNull();
    expect(rangoPrecios([])).toBeNull();
  });

  it("portada, carta y /despues-de-cenar: el texto de la auditoría con los números de los datos", () => {
    expect(descripcionPortada(carta)).toBe(
      "Touza, coctelería y bar de copas en Crevillent (Crevillente), junto a Casa Tomás. Cócteles de 7 a 10 €, champagne y whisky. Sin reservas."
    );
    expect(descripcionCarta(carta)).toBe(
      "Carta de Touza: 18 cócteles de autor y clásicos de 7 a 10 €, con y sin alcohol, además de champagne, cava, cerveza y whisky. Crevillent."
    );
    expect(descripcionDespuesDeCenar(carta)).toBe(
      "Cena en Casa Tomás y toma la copa en Touza, la puerta de al lado (n.º 4), en Crevillent. Cócteles de 7 a 10 €. Sin reservas: ven directamente."
    );
  });

  it("caben en el resultado de Google (≤ 160 caracteres)", () => {
    for (const texto of [descripcionPortada(carta), descripcionCarta(carta), descripcionDespuesDeCenar(carta)]) {
      expect(texto.length).toBeLessThanOrEqual(160);
    }
  });

  it("sin datos, la misma frase sin cifras inventadas", () => {
    expect(descripcionPortada([])).toBe(
      "Touza, coctelería y bar de copas en Crevillent (Crevillente), junto a Casa Tomás. Cócteles de autor, champagne y whisky. Sin reservas."
    );
    expect(descripcionCarta([])).toBe(
      "Carta de Touza: cócteles de autor y clásicos, con y sin alcohol, además de champagne, cava, cerveza y whisky. Crevillent."
    );
    expect(descripcionDespuesDeCenar([])).toBe(
      "Cena en Casa Tomás y toma la copa en Touza, la puerta de al lado (n.º 4), en Crevillent. Sin reservas: ven directamente."
    );
    expect(descripcionCarta(carta.filter((c) => c.categoria !== "sin-alcohol"))).not.toMatch(/sin alcohol/);
  });
});
