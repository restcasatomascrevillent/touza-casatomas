/**
 * Portada «Tres puertas» (rediseño A, 21/11/2026): el hero de siempre, las
 * tres puertas, «De la casa», Visítanos y el texto para buscadores; SEO de la
 * portada y limpieza de textos. Se pinta con el Layout real
 * (cabecera y pie).
 */
import { describe, it, expect, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import React from "react";
import { MemoryRouter } from "react-router-dom";
import Index from "../Index";

const seo = vi.hoisted(() => ({ props: null as null | { title: string; description: string } }));

// Nueve cócteles con foto propia y uno sin ella (lleva la genérica de la «T»).
const filas = vi.hoisted(() => {
  const nombres = ["Clover Club", "Pornstar Martini", "Espresso Martini", "Moscow Mule", "Aperol Spritz", "Mojito", "Piña Colada", "Spicy Mango Margarita", "Negroni"];
  const fila = (nombre: string, orden: number, imagen: string | null) => ({
    id: `c${orden}`,
    nombre,
    descripcion: null,
    precio_eur: 9 + (orden % 2),
    imagen_url: imagen,
    categoria: "clasicos",
    base: null,
    ingredientes: null,
    orden,
    alergenos_oficiales: null,
    alergenos_notas: null,
  });
  return [
    fila("Sin Foto Sour", 0, null),
    ...nombres.map((nombre, i) =>
      fila(nombre, i + 1, `https://sfonaclosuafvlhutkon.supabase.co/storage/v1/object/public/cocteles/c${i + 1}.webp`)
    ),
  ];
});

vi.mock("@/integrations/supabase/client", () => ({ supabase: { from: vi.fn() } }));

vi.mock("@/hooks/useCocteles", async (original) => ({
  ...(await original<typeof import("@/hooks/useCocteles")>()),
  useCocteles: () => ({ data: filas, isLoading: false }),
}));

// Champagne: dos botellas y una copa; bebidas: whisky, ginebra, una cerveza.
vi.mock("@/hooks/useVinos", async (original) => ({
  ...(await original<typeof import("@/hooks/useVinos")>()),
  useEspumosos: () => ({
    data: [
      { id: "v1", nombre: "Collet Brut", precio_eur: 51, categoria: "VINOS ESPUMOSOS — CHAMPAGNE" },
      { id: "v2", nombre: "Ruinart Brut", precio_eur: 90, categoria: "VINOS ESPUMOSOS — CHAMPAGNE" },
      { id: "v3", nombre: "Cava Juvé", precio_eur: 30, categoria: "VINOS ESPUMOSOS — CAVA" },
    ],
    isLoading: false,
  }),
}));

vi.mock("@/hooks/useBebidas", async (original) => ({
  ...(await original<typeof import("@/hooks/useBebidas")>()),
  useBebidasTouza: () => ({
    data: [
      { id: "b1", nombre: "Copa Champagne Laurent-Perrier", precio_eur: 13.5, categoria: "Copas", tipo: "champagne" },
      { id: "b2", nombre: "Lagavulin 8", precio_eur: 10, categoria: "Whiskies", tipo: null },
      { id: "b3", nombre: "Monkey Shoulder", precio_eur: 8, categoria: "Whiskies", tipo: null },
      { id: "b4", nombre: "Hendrick's", precio_eur: 11, categoria: "Ginebras", tipo: null },
      { id: "b5", nombre: "Mahou", precio_eur: 3, categoria: "Cervezas", tipo: null },
    ],
    isLoading: false,
  }),
}));

vi.mock("@/components/Seo", () => ({
  default: (props: { title: string; description: string }) => {
    seo.props = props;
    return null;
  },
}));

const pintar = () =>
  render(
    React.createElement(MemoryRouter, { initialEntries: ["/"] }, React.createElement(Index))
  );

describe("Portada", () => {
  it("title con «coctelería» y «Crevillent»", () => {
    pintar();
    expect(seo.props?.title).toBe("Coctelería y bar de copas en Crevillent · Touza");
  });

  it("descripción de la auditoría, con el rango de precios sacado de la carta", () => {
    pintar();
    expect(seo.props?.description).toBe(
      "Touza, coctelería y bar de copas en Crevillent (Crevillente), junto a Casa Tomás. Cócteles de 9 a 10 €, champagne y whisky. Sin reservas."
    );
  });

  it("hero sin texto: el rótulo, TOUZA en el único h1 (con su parte para buscadores) y los dos botones", () => {
    const { container } = pintar();
    const h1 = screen.getAllByRole("heading", { level: 1 });
    expect(h1).toHaveLength(1);
    expect(h1[0]).toHaveTextContent("TOUZA · Coctelería y bar de copas en Crevillent");
    // Lo que se ve del h1 es solo «TOUZA».
    expect(h1[0].querySelector(".sr-only")).toHaveTextContent("· Coctelería y bar de copas en Crevillent");

    const hero = container.querySelector(".hero-portada") as HTMLElement;
    expect(within(hero).getByText("Coctelería · Crevillent")).toBeInTheDocument();
    // Ni la frase de qué es Touza ni la del horario: han bajado de sitio.
    expect(within(hero).queryAllByRole("heading", { level: 2 })).toHaveLength(0);
    expect(hero.querySelectorAll("p")).toHaveLength(1);
    expect(hero.textContent).not.toMatch(/junto a Casa Tomás|Abrimos|Sin reservas/);
    expect(within(hero).getAllByRole("link").map((enlace) => enlace.textContent)).toEqual(["Ver la carta", "Cómo llegar"]);

    expect(screen.getByRole("link", { name: "Ver la carta" })).toHaveAttribute("href", "/carta");
    expect(screen.getByRole("link", { name: "Cómo llegar" })).toHaveAttribute("href", "/contacto");

    // «Cómo llegar» de «Visítanos» y de la barra del móvil: a la ruta de Google Maps.
    const llegar = screen.getAllByRole("link", { name: "Cómo llegar a Touza (abre Google Maps)" });
    expect(llegar.length).toBeGreaterThan(0);
    for (const enlace of llegar) {
      expect(enlace.getAttribute("href")).toMatch(/^https:\/\/www\.google\.com\/maps\/dir\//);
    }
  });

  it("el texto que salía del hero sigue en la portada: una línea en «Sobre Touza» y otra en «Visítanos»", () => {
    const { container } = pintar();
    const sobre = screen.getByRole("heading", { level: 2, name: "Sobre Touza" }).closest("section") as HTMLElement;
    expect(sobre.textContent).toMatch(/Coctelería y bar de copas en Crevillent, junto a Casa Tomás\./);

    const visitanos = container.querySelector("#visitanos") as HTMLElement;
    expect(within(visitanos).getByText("Sin reservas: ven directamente.").tagName).toBe("P");
    // El horario, solo en su tabla: la frase «Abrimos el jueves…» ya no sale.
    expect(within(visitanos).getByText("Horario")).toBeInTheDocument();
    expect(container.textContent).not.toMatch(/Abrimos el jueves/);
  });

  it("el hero es la foto del salón, con el recorte vertical para el móvil y variantes hasta 2560 px", () => {
    const { container } = pintar();
    const foto = container.querySelector('img[fetchpriority="high"]') as HTMLImageElement;
    expect(foto).toHaveAttribute("alt", expect.stringMatching(/salón de Touza/));
    expect(foto).toHaveAttribute("loading", "eager");
    const fuentes = [...(foto.closest("picture")?.querySelectorAll("source") ?? [])];
    const movil = fuentes.filter((f) => f.getAttribute("media"));
    expect(movil.map((f) => f.getAttribute("type"))).toEqual(["image/avif", "image/webp"]);
    for (const fuente of movil) {
      expect(fuente.getAttribute("srcset")).toMatch(/touza-2-movil-1080\.\w+ 1080w/);
      expect(fuente).toHaveAttribute("sizes", "64vh");
    }
    const apaisada = fuentes.filter((f) => !f.getAttribute("media"));
    expect(apaisada.map((f) => f.getAttribute("type"))).toEqual(["image/avif", "image/webp"]);
    for (const fuente of apaisada) expect(fuente.getAttribute("srcset")).toMatch(/touza-2-2560\.\w+ 2560w/);
  });

  it("la imagen del hero es la del LCP y no hay vídeo en el primer pintado", () => {
    const { container } = pintar();
    expect(container.querySelectorAll('img[fetchpriority="high"]')).toHaveLength(1);
    expect(container.querySelector("video")).toBeNull();
  });

  it("el texto largo para buscadores sigue en el HTML, plegado en «Más sobre Touza»", () => {
    const { container } = pintar();
    const desplegable = container.querySelector("details");
    expect(desplegable).not.toBeNull();
    expect(desplegable).not.toHaveAttribute("open");
    expect(within(desplegable as HTMLElement).getByText("Más sobre Touza")).toBeInTheDocument();
    expect(desplegable?.textContent).toMatch(/Coctelería y bar de copas en Crevillente/);
    expect(desplegable?.textContent).toMatch(/justo al lado del Restaurante Casa Tomás/);
    expect(desplegable?.textContent).toMatch(/En Touza no se reserva/);
  });

  it("sin eslóganes, frases sin verificar ni secciones retiradas", () => {
    const { container } = pintar();
    const texto = container.textContent ?? "";
    for (const fuera of [
      /Lo que nos define/,
      /declaración de intenciones/,
      /alquimia/,
      /técnicas de vanguardia/,
      /raíces gallegas/,
      /desafía lo convencional/,
      /De la coctelera a la copa/,
    ]) {
      expect(texto).not.toMatch(fuera);
    }
  });

  it("sin numeraciones falsas (01, 02…)", () => {
    const { container } = pintar();
    const numeros = [...container.querySelectorAll("span, p, li")].filter((el) => /^0\d$/.test(el.textContent?.trim() ?? ""));
    expect(numeros).toHaveLength(0);
  });

  it("nada oculto en reposo en el primer pintado (HTML del SSG)", () => {
    const { container } = pintar();
    expect(container.querySelectorAll(".opacity-0")).toHaveLength(0);
    expect(container.querySelectorAll('[style*="opacity: 0"]')).toHaveLength(0);
    expect(container.querySelectorAll("[data-reveal]")).toHaveLength(0);
  });

  it("los bloques, en orden: puertas, «De la casa», Visítanos y «Sobre Touza»; fuera «El local» y la rejilla", () => {
    pintar();
    const titulos = screen.getAllByRole("heading", { level: 2 }).map((h) => h.textContent?.trim());
    const orden = ["La carta de Touza", "De la casa", "Visítanos", "Sobre Touza"].map((t) => titulos.indexOf(t));
    expect(orden.every((i) => i >= 0)).toBe(true);
    expect(orden).toEqual([...orden].sort((a, b) => a - b));
    for (const fuera of ["El local", "Cócteles de autor", "En la barra", "Se sirve", "Y a disfrutarla"]) {
      expect(screen.queryByRole("heading", { name: fuera })).not.toBeInTheDocument();
    }
  });

  it("tres puertas a su pestaña de /carta, con el dato sacado de la carta", () => {
    pintar();
    const puertas = within(screen.getByRole("heading", { level: 2, name: "La carta de Touza" }).closest("section") as HTMLElement).getAllByRole("link");
    expect(puertas.map((p) => p.getAttribute("href"))).toEqual(["/carta#cocteles", "/carta#champagne", "/carta#destilados"]);
    expect(puertas[0]).toHaveTextContent(/Cócteles.*10 en carta.*de 9 a 10\s€/);
    expect(puertas[1]).toHaveTextContent(/Champagne.*por copa.*desde 13,50\s€/);
    // Tercera puerta: todos los destilados (cambio del dueño), no solo whisky.
    expect(puertas[2]).toHaveTextContent(/Destilados.*Whisky y ginebra.*desde 8\s€/);
    expect(screen.getByRole("img", { name: /botellero de Touza/ })).toHaveAttribute("loading", "lazy");
  });

  it("«De la casa»: ocho cócteles con foto propia, nombre y precio, cada uno a su ficha, y «Carta completa»", () => {
    pintar();
    const lista = screen.getByRole("list", { name: "Algunos cócteles de la carta" });
    const tarjetas = within(lista).getAllByRole("listitem");
    expect(tarjetas).toHaveLength(8);
    expect(within(lista).queryByText("Sin Foto Sour")).not.toBeInTheDocument();
    expect(within(lista).queryByText("Negroni")).not.toBeInTheDocument();

    const primera = within(tarjetas[0]);
    expect(primera.getByRole("link")).toHaveAttribute("href", "/carta#clover-club");
    expect(primera.getByRole("heading", { level: 3, name: "Clover Club" })).toBeInTheDocument();
    expect(tarjetas[0]).toHaveTextContent(/10\s€/);
    expect(primera.getByRole("img", { name: "Clover Club, cóctel de la carta de Touza" })).toHaveAttribute("loading", "lazy");
    expect(within(tarjetas[6]).getByRole("link")).toHaveAttribute("href", "/carta#pina-colada");

    expect(screen.getByRole("link", { name: "Carta completa" })).toHaveAttribute("href", "/carta");
    expect(screen.getByRole("link", { name: "copas después de cenar" })).toHaveAttribute("href", "/despues-de-cenar");
  });

  it("sin gente en las fotos", () => {
    const { container } = pintar();
    for (const img of container.querySelectorAll("img")) {
      expect(img.getAttribute("alt") ?? "").not.toMatch(/bartender|camarero|barman/i);
    }
  });

  it("el pie enlaza a /despues-de-cenar y no repite la dirección", () => {
    pintar();
    const pie = screen.getByRole("contentinfo");
    expect(within(pie).getByRole("link", { name: "Copas después de cenar en Casa Tomás" })).toHaveAttribute(
      "href",
      "/despues-de-cenar"
    );
    expect(pie.textContent).not.toMatch(/Santa María de la Cabeza/);
    expect(pie.textContent).not.toMatch(/966 782 000/);
  });
});
