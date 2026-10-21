import { describe, it, expect } from "vitest";
import { barSchema, faqSchema, menuSchema, NEGOCIO } from "@/lib/negocio";

describe("JSON-LD de Touza", () => {
  it("BarOrPub con la dirección confirmada, el mapa y sin 'Tapas'", () => {
    const bar = JSON.parse(JSON.stringify(barSchema()));
    expect(bar.address.streetAddress).toBe("C/ Santa María de la Cabeza, 4");
    expect(bar.hasMap).toBe(NEGOCIO.mapa);
    expect(bar.servesCuisine).not.toContain("Tapas");
  });

  it("menuSchema quita fotos de Unsplash y productos repetidos", () => {
    const menu = JSON.parse(JSON.stringify(menuSchema([
      {
        nombre: "Cervezas",
        items: [
          { nombre: "Cruz Campo Gran Reserva", precio_eur: 3.5 },
          { nombre: "Cruzcampo Gran Reserva", precio_eur: 3.8 },
          { nombre: "Heineken", precio_eur: 3 },
          { nombre: "Heineken", precio_eur: 3.5 },
        ],
      },
      {
        nombre: "Cócteles",
        items: [
          { nombre: "Mojito", imagen_url: "https://images.unsplash.com/photo-1?w=500" },
          { nombre: "Negroni", imagen_url: "https://example.supabase.co/storage/negroni.jpg" },
        ],
      },
    ])));
    const [cervezas, cocteles] = menu.hasMenuSection;
    expect(cervezas.hasMenuItem.map((i: { name: string }) => i.name)).toEqual(["Cruz Campo Gran Reserva", "Heineken"]);
    expect(cocteles.hasMenuItem[0].image).toBeUndefined();
    expect(cocteles.hasMenuItem[1].image).toContain("negroni.jpg");
  });

  it("FAQPage sin horario", () => {
    const faq = JSON.parse(JSON.stringify(faqSchema()));
    expect(faq["@type"]).toBe("FAQPage");
    expect(JSON.stringify(faq)).not.toMatch(/\d{1,2}:\d{2}/);
  });
});
