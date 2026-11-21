import { describe, it, expect } from "vitest";
import * as negocio from "@/lib/negocio";
import { barSchema, menuSchema, paginaSchema, CASA_TOMAS, HORARIO, HORARIO_EN_FRASE, ID_NEGOCIO, NEGOCIO, VIA } from "@/lib/negocio";

describe("JSON-LD de Touza", () => {
  it("BarOrPub con la dirección confirmada, el mapa y sin 'Tapas'", () => {
    const bar = JSON.parse(JSON.stringify(barSchema()));
    expect(bar.address.streetAddress).toBe("C/ Santa María de la Cabeza, 4");
    expect(bar.hasMap).toBe(NEGOCIO.mapa);
    expect(bar.servesCuisine).not.toContain("Tapas");
  });

  it("une Touza con Casa Tomás (parentOrganization) y lleva una descripción con los hechos de la antigua FAQ", () => {
    const bar = JSON.parse(JSON.stringify(barSchema()));
    expect(bar.parentOrganization).toMatchObject({
      "@type": "Restaurant",
      // Mismo @id y nombre que el Restaurant de la web de Casa Tomás.
      "@id": "https://restaurantecasatomascrevillente.es/#restaurante",
      name: "Casa Tomás Restaurante",
      url: "https://restaurantecasatomascrevillente.es/",
    });
    expect(bar.logo).toMatch(/\/logo-touza\.png$/);
    expect(bar.parentOrganization.address.streetAddress).toBe(CASA_TOMAS.calle);
    expect(bar.description).toMatch(/Casa Tomás/);
    expect(bar.description).toMatch(/sin alcohol/);
    expect(bar.description).toMatch(/No se reserva/);
    // Sin horario en la descripción: el horario va en openingHoursSpecification.
    expect(bar.description).not.toMatch(/\d{1,2}:\d{2}/);
  });

  it("ya no hay FAQPage", () => {
    expect("faqSchema" in negocio).toBe(false);
    expect("PREGUNTAS_FRECUENTES" in negocio).toBe(false);
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

  it("WebPage con `about` apuntando al bar (/#bar)", () => {
    const pagina = JSON.parse(JSON.stringify(paginaSchema({ ruta: "/despues-de-cenar", nombre: "N", descripcion: "D" })));
    expect(pagina["@type"]).toBe("WebPage");
    expect(pagina.url).toMatch(/\/despues-de-cenar$/);
    expect(pagina.about["@id"]).toBe(ID_NEGOCIO);
    expect(ID_NEGOCIO).toMatch(/\/#bar$/);
  });
});

describe("Horario y dirección legibles, sacados de NEGOCIO", () => {
  it("tramos de horario", () => {
    expect(HORARIO).toEqual([
      { dias: "Jueves", horas: "16:00 – 01:00" },
      { dias: "Viernes", horas: "15:30 – 02:00" },
      { dias: "Sábado", horas: "15:00 – 02:00" },
      { dias: "Domingo", horas: "15:00 – 20:00" },
    ]);
  });

  it("horario en una frase", () => {
    expect(HORARIO_EN_FRASE).toBe("El jueves, de 16:00 a 01:00; el viernes, de 15:30 a 02:00; el sábado, de 15:00 a 02:00; el domingo, de 15:00 a 20:00.");
  });

  it("la calle sin el número", () => {
    expect(VIA).toBe("C/ Santa María de la Cabeza");
  });
});
