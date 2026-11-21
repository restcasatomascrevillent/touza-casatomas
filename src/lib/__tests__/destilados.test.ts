/**
 * Destilados (rediseño A, 21/11/2026): las categorías de Bebidas las escribe
 * a mano quien rellena el panel, así que se reconocen sin mayúsculas ni
 * tildes, en singular o plural y por cualquier palabra.
 */
import { describe, it, expect } from "vitest";
import {
  agruparDestilados,
  esAnclaDestilados,
  esDestilado,
  familiasDestilados,
  grupoDeCategoria,
  repartirBebidas,
} from "@/lib/destilados";
import { datoPuertaChampagne, datoPuertaCocteles, datoPuertaDestilados } from "@/lib/carta";

describe("grupoDeCategoria: nombres flexibles", () => {
  it.each([
    ["Whiskies", "whiskies"],
    ["whisky", "whiskies"],
    ["WHISKEY", "whiskies"],
    ["Whiskeys", "whiskies"],
    ["Bourbon", "whiskies"],
    ["Whisky escocés", "whiskies"],
    ["Ginebra", "ginebras"],
    ["Ginebras", "ginebras"],
    ["Gin", "ginebras"],
    ["Ginebras premium", "ginebras"],
    ["Ron", "rones"],
    ["Rones", "rones"],
    ["Rones añejos", "rones"],
    ["Rum", "rones"],
    ["Vodka", "vodkas"],
    ["vodkas", "vodkas"],
    ["Tequila", "tequilas"],
    ["Tequilas", "tequilas"],
    ["Mezcal", "tequilas"],
    ["Mezcales", "tequilas"],
    ["Tequilas y mezcales", "tequilas"],
    ["Brandy", "brandys"],
    ["Coñac", "brandys"],
    ["Cognac", "brandys"],
    ["Brandy y coñac", "brandys"],
    ["Licor", "licores"],
    ["Licores", "licores"],
    ["Licor de whisky", "licores"],
    ["Vermut", "vermuts"],
    ["Vermuts", "vermuts"],
    ["Selección de rones", "rones"],
  ])("«%s» → %s", (categoria, grupo) => {
    expect(grupoDeCategoria(categoria)).toBe(grupo);
  });

  it.each(["Refrescos", "Agua", "Aguas", "Tónicas", "Tonica", "Cervezas", "Cerveza", "Copas", "Tintos", "Vinos", "Ginger ale", "Zumos", "Café"])(
    "«%s» no es un destilado",
    (categoria) => {
      expect(grupoDeCategoria(categoria)).toBeNull();
      expect(esDestilado(categoria)).toBe(false);
    }
  );

  it("una categoría desconocida va a «Otros destilados», no desaparece", () => {
    expect(grupoDeCategoria("Absenta")).toBe("otros-destilados");
    expect(grupoDeCategoria("Pisco")).toBe("otros-destilados");
  });

  it("sin categoría, nada", () => {
    expect(grupoDeCategoria(null)).toBeNull();
    expect(grupoDeCategoria("   ")).toBeNull();
  });
});

describe("agruparDestilados", () => {
  const b = (nombre: string, categoria: string | null) => ({ nombre, categoria });

  it("en el orden fijo (whisky, ginebra, ron, vodka, tequila, brandy, licor, vermut, otros), aunque lleguen mezclados", () => {
    const grupos = agruparDestilados([
      b("Absenta", "Absenta"),
      b("Zacapa", "Rones"),
      b("Grey Goose", "Vodka"),
      b("Hendrick's", "Ginebras"),
      b("Lagavulin", "Whiskies"),
      b("Baileys", "Licores"),
      b("Don Julio", "Tequila"),
      b("Martini", "Vermut"),
      b("Hennessy", "Coñac"),
    ]);
    expect(grupos.map((g) => g.titulo)).toEqual([
      "Whiskies",
      "Ginebras",
      "Rones",
      "Vodkas",
      "Tequilas y mezcales",
      "Brandy y coñac",
      "Licores",
      "Vermuts",
      "Otros destilados",
    ]);
  });

  it("junta las variantes del mismo nombre y conserva el orden del panel dentro del grupo", () => {
    const grupos = agruparDestilados([b("A", "Whiskies"), b("B", "whisky"), b("C", "Bourbon")]);
    expect(grupos).toHaveLength(1);
    expect(grupos[0].items.map((i) => i.nombre)).toEqual(["A", "B", "C"]);
  });

  it("los grupos vacíos no salen y lo que no es destilado se queda fuera", () => {
    const grupos = agruparDestilados([b("Lagavulin", "Whiskies"), b("Mahou", "Cervezas"), b("Coca-Cola", "Refrescos"), b("X", null)]);
    expect(grupos.map((g) => g.id)).toEqual(["whiskies"]);
  });

  it("hoy en la demo (solo «Whiskies»), un grupo", () => {
    expect(agruparDestilados([b("Lagavulin", "Whiskies")]).map((g) => g.titulo)).toEqual(["Whiskies"]);
  });
});

describe("repartirBebidas", () => {
  it("cervezas, copas, destilados y una pestaña por cada otra categoría; los vinos no salen", () => {
    const r = repartirBebidas([
      { nombre: "Mahou", categoria: "Cervezas" },
      { nombre: "Copa Moët", categoria: "Copas" },
      { nombre: "Lagavulin", categoria: "Whiskies" },
      { nombre: "Coca-Cola", categoria: "Refrescos" },
      { nombre: "Fanta", categoria: "refrescos" },
      { nombre: "Font Vella", categoria: "Aguas" },
      { nombre: "Rioja", categoria: "Tintos" },
    ]);
    expect(r.cervezas.map((x) => x.nombre)).toEqual(["Mahou"]);
    expect(r.copas.map((x) => x.nombre)).toEqual(["Copa Moët"]);
    expect(r.destilados.map((g) => g.id)).toEqual(["whiskies"]);
    expect(r.otras.map((p) => [p.id, p.titulo, p.items.length])).toEqual([
      ["refrescos", "Refrescos", 2],
      ["aguas", "Aguas", 1],
    ]);
  });
});

describe("anclas y textos de la portada", () => {
  it("#destilados, el antiguo #whiskies y las familias llevan a Destilados", () => {
    for (const ancla of ["#destilados", "whiskies", "#ginebras", "#rones", "#otros-destilados"]) {
      expect(esAnclaDestilados(ancla)).toBe(true);
    }
    expect(esAnclaDestilados("#champagne")).toBe(false);
  });

  it("familias: una, dos, tres y más de tres", () => {
    const g = (...ids: string[]) =>
      ids.map((id) => ({ id, familia: { whiskies: "whisky", ginebras: "ginebra", rones: "ron", vodkas: "vodka" }[id] ?? "otros" }));
    expect(familiasDestilados(g("whiskies"))).toBe("Whisky");
    expect(familiasDestilados(g("whiskies", "ginebras"))).toBe("Whisky y ginebra");
    expect(familiasDestilados(g("whiskies", "ginebras", "rones"))).toBe("Whisky, ginebra y ron");
    expect(familiasDestilados(g("whiskies", "ginebras", "rones", "vodkas"))).toBe("Whisky, ginebra, ron…");
    expect(familiasDestilados(g("otros-destilados"))).toBeNull();
  });

  it("datos de las puertas, sacados de la carta", () => {
    expect(datoPuertaCocteles([{ precio_eur: 7 }, { precio_eur: 10 }, { precio_eur: 9 }])).toEqual(["3 en carta", "de 7 a 10 €"]);
    expect(datoPuertaCocteles([])).toBeNull();
    expect(datoPuertaChampagne([{ precio_eur: 13.5 }, { precio_eur: 18 }], [{ precio_eur: 51 }])).toEqual(["por copa", "desde 13,50 €"]);
    expect(datoPuertaChampagne([], [{ precio_eur: 78 }, { precio_eur: 51 }])).toEqual(["desde 51 €"]);
    expect(datoPuertaChampagne([], [])).toBeNull();
    expect(datoPuertaDestilados("Whisky", [{ precio_eur: 9 }, { precio_eur: 7 }])).toEqual(["Whisky", "desde 7 €"]);
    expect(datoPuertaDestilados(null, [])).toBeNull();
  });
});
