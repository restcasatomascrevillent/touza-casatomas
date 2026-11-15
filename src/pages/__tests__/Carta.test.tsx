import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, within, fireEvent } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import React from "react";

// ---------------------------------------------------------------------------
// Mocks de módulos que romperían en jsdom
// ---------------------------------------------------------------------------

// Supabase client — no queremos peticiones reales
vi.mock("@/integrations/supabase/client", () => ({
  supabase: { from: vi.fn() },
}));

// Hooks de datos — los controlamos completamente en cada test
vi.mock("@/hooks/usePlatos");
vi.mock("@/hooks/useCocteles");
vi.mock("@/hooks/useVinos");
vi.mock("@/hooks/useBebidas");

// Componentes pesados que no aportan al test de la página
vi.mock("@/components/layout/Layout", () => ({
  default: ({ children }: { children: React.ReactNode }) =>
    React.createElement("div", { "data-testid": "layout" }, children),
}));

vi.mock("@/components/Seo", () => ({
  default: () => null,
}));

vi.mock("@/components/ui/svg/LiquidLoaderSVG", () => ({
  LiquidLoaderSVG: () =>
    React.createElement("div", { "data-testid": "liquid-loader" }),
}));


// framer-motion — sin animaciones en tests
vi.mock("framer-motion", () => ({
  motion: new Proxy(
    {},
    {
      get: (_: object, tag: string) =>
        // eslint-disable-next-line react/display-name
        React.forwardRef(({ children, ...props }: any, ref: any) =>
          React.createElement(tag, { ...props, ref }, children)
        ),
    }
  ),
  AnimatePresence: ({ children }: { children: React.ReactNode }) =>
    React.createElement(React.Fragment, null, children),
}));

// ---------------------------------------------------------------------------
// Imports bajo test (DESPUÉS de los vi.mock)
// ---------------------------------------------------------------------------
import Carta from "../Carta";
import { AVISO_ALERGENOS_CARTA } from "@/lib/alergenos";
import * as usePlatosModule from "@/hooks/usePlatos";
import * as useCoctelesModule from "@/hooks/useCocteles";
import type { CoctelUI } from "@/hooks/useCocteles";
import * as useVinosModule from "@/hooks/useVinos";
import * as useBebidasModule from "@/hooks/useBebidas";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function buildQC() {
  return new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  });
}

function renderCarta() {
  const qc = buildQC();
  return render(
    React.createElement(
      QueryClientProvider,
      { client: qc },
      React.createElement(
        MemoryRouter,
        null,
        React.createElement(Carta)
      )
    )
  );
}

// Devuelve mocks vacíos para los hooks que no son el foco de cada test
function mockAllHooksIdle() {
  vi.mocked(useCoctelesModule.useCocteles).mockReturnValue({
    data: undefined,
    isLoading: false,
    isError: false,
    error: null,
  } as any);
  vi.mocked(useCoctelesModule.transformCoctelesToUI).mockReturnValue([]);

  vi.mocked(useVinosModule.useVinos).mockReturnValue({
    data: undefined,
    isLoading: false,
  } as any);
  vi.mocked(useVinosModule.transformVinosToUI).mockReturnValue([]);

  vi.mocked(useVinosModule.useEspumosos).mockReturnValue({
    data: undefined,
    isLoading: false,
  } as any);
  vi.mocked(useVinosModule.esChampagne).mockImplementation((categoria) =>
    /CHAMPAGNE\s*$/i.test(categoria ?? "")
  );

  vi.mocked(useBebidasModule.useBebidas).mockReturnValue({
    data: undefined,
    isLoading: false,
  } as any);
  vi.mocked(useBebidasModule.transformBebidasToUI).mockReturnValue([]);
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("Carta — sección Tapas", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAllHooksIdle();
  });

  it("muestra el loader (LiquidLoaderSVG) mientras se cargan los platos", () => {
    vi.mocked(usePlatosModule.usePlatosTouza).mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      error: null,
    } as any);
    vi.mocked(usePlatosModule.transformPlatosToUI).mockReturnValue([]);

    renderCarta();

    // El loader de tapas se muestra cuando loadingPlatos=true Y la sección es visible
    // (tapasData.length===0 pero loadingPlatos===true → sección visible)
    expect(screen.getAllByTestId("liquid-loader").length).toBeGreaterThanOrEqual(1);
  });

  it("muestra los platos cuando los datos están disponibles", () => {
    const tapas = [
      {
        id: "1",
        name: "Croquetas de jamón",
        description: "Suaves croquetas caseras",
        price: "7,50€",
        image: "https://example.com/croquetas.jpg",
        categoria: "tapas",
        alergenos: [],
        alergenosNota: null,
      },
      {
        id: "2",
        name: "Patatas bravas",
        description: "Con salsa brava",
        price: "5,00€",
        image: "/placeholder.svg",
        categoria: "tapas",
        alergenos: [],
        alergenosNota: null,
      },
    ];

    vi.mocked(usePlatosModule.usePlatosTouza).mockReturnValue({
      data: tapas as any,
      isLoading: false,
      isError: false,
      error: null,
    } as any);
    vi.mocked(usePlatosModule.transformPlatosToUI).mockReturnValue(tapas);

    renderCarta();

    expect(screen.getByText("Croquetas de jamón")).toBeInTheDocument();
    expect(screen.getByText("Patatas bravas")).toBeInTheDocument();
    expect(screen.getByText("7,50€")).toBeInTheDocument();
  });

  it("muestra las etiquetas de alérgenos de un plato cuando constan", () => {
    const tapas = [
      {
        id: "1",
        name: "Croquetas de jamón",
        description: "Suaves croquetas caseras",
        price: "7,50€",
        image: "https://example.com/croquetas.jpg",
        categoria: "tapas",
        alergenos: ["Gluten", "Lácteos"],
        alergenosNota: "Elaboradas con leche entera",
      },
    ];

    vi.mocked(usePlatosModule.usePlatosTouza).mockReturnValue({
      data: tapas as any,
      isLoading: false,
      isError: false,
      error: null,
    } as any);
    vi.mocked(usePlatosModule.transformPlatosToUI).mockReturnValue(tapas);

    renderCarta();

    expect(screen.getByText("Gluten")).toBeInTheDocument();
    expect(screen.getByText("Lácteos")).toBeInTheDocument();
    expect(screen.getByText("Elaboradas con leche entera")).toBeInTheDocument();
    // Con alérgenos declarados no debe verse el aviso de "no consta".
    expect(screen.queryByText(/sin información de alérgenos/i)).not.toBeInTheDocument();
  });

  // El aviso de "no consta" ya NO se pinta bajo cada tarjeta: con 13 cócteles
  // sin alérgenos declarados eran 13 bloques idénticos de tres líneas en una
  // rejilla de dos columnas. Ahora hay UN aviso por carta (visible en todas las
  // pestañas, que es lo que exige el Reglamento UE 1169/2011 para lo que se
  // prepara al momento) y el detalle por cóctel sigue en su diálogo.
  it("no repite el aviso de alérgenos en la tarjeta del plato; lo cubre el aviso único de la carta", () => {
    const tapas = [
      {
        id: "1",
        name: "Croquetas de jamón",
        description: "Suaves croquetas caseras",
        price: "7,50€",
        image: "https://example.com/croquetas.jpg",
        categoria: "tapas",
        alergenos: [],
        alergenosNota: null,
      },
    ];

    vi.mocked(usePlatosModule.usePlatosTouza).mockReturnValue({
      data: tapas as any,
      isLoading: false,
      isError: false,
      error: null,
    } as any);
    vi.mocked(usePlatosModule.transformPlatosToUI).mockReturnValue(tapas);

    renderCarta();

    // La tarjeta no lleva su propio bloque de "no consta"...
    expect(screen.queryByText(/sin información de alérgenos/i)).not.toBeInTheDocument();
    // ...pero el aviso sigue a la vista una sola vez, en la cabecera de la carta.
    expect(screen.getByText(AVISO_ALERGENOS_CARTA)).toBeInTheDocument();
  });

  it("muestra /placeholder.svg cuando imagen_url de un plato es null", () => {
    const tapas = [
      {
        id: "2",
        name: "Patatas bravas",
        description: "Con salsa brava",
        price: "5,00€",
        image: "/placeholder.svg",
        categoria: "tapas",
        alergenos: [],
        alergenosNota: null,
      },
    ];

    vi.mocked(usePlatosModule.usePlatosTouza).mockReturnValue({
      data: tapas as any,
      isLoading: false,
      isError: false,
      error: null,
    } as any);
    vi.mocked(usePlatosModule.transformPlatosToUI).mockReturnValue(tapas);

    renderCarta();

    // Busca la imagen del plato "Patatas bravas"
    const img = screen.getByAltText("Patatas bravas") as HTMLImageElement;
    expect(img.src).toContain("/placeholder.svg");
  });

  // Interruptor «Fotos de platos en Touza» apagado en el panel:
  // `transformPlatosToUI` devuelve `image: null` y la tarjeta no pinta ni la
  // foto ni el placeholder, pero sí el nombre y el precio.
  it("no pinta foto ni placeholder cuando las fotos de platos están apagadas", () => {
    const tapas = [
      {
        id: "1",
        name: "Croquetas de jamón",
        description: "Suaves croquetas caseras",
        price: "7,50€",
        image: null,
        categoria: "tapas",
        alergenos: [],
        alergenosNota: null,
      },
    ];

    vi.mocked(usePlatosModule.usePlatosTouza).mockReturnValue({
      data: tapas,
      isLoading: false,
      isError: false,
      error: null,
    } as never);
    vi.mocked(usePlatosModule.useMostrarFotosPlatosTouza).mockReturnValue(false);
    vi.mocked(usePlatosModule.transformPlatosToUI).mockReturnValue(tapas);

    renderCarta();

    expect(screen.getByText("Croquetas de jamón")).toBeInTheDocument();
    expect(screen.getByText("7,50€")).toBeInTheDocument();
    expect(screen.queryByAltText("Croquetas de jamón")).not.toBeInTheDocument();
    expect(usePlatosModule.transformPlatosToUI).toHaveBeenCalledWith(tapas, { mostrarFotos: false });
  });

  it("NO muestra la sección 'Tapea con tu Cóctel' cuando no hay platos y no está cargando", () => {
    vi.mocked(usePlatosModule.usePlatosTouza).mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
      error: null,
    } as any);
    vi.mocked(usePlatosModule.transformPlatosToUI).mockReturnValue([]);

    renderCarta();

    expect(screen.queryByText("Tapea con tu Cóctel")).not.toBeInTheDocument();
  });

  it("muestra el título 'Tapea con tu Cóctel' cuando hay platos", () => {
    const tapas = [
      {
        id: "1",
        name: "Croquetas",
        description: "Desc",
        price: "7,50€",
        image: "img.jpg",
        categoria: "tapas",
        alergenos: [],
        alergenosNota: null,
      },
    ];

    vi.mocked(usePlatosModule.usePlatosTouza).mockReturnValue({
      data: tapas as any,
      isLoading: false,
      isError: false,
      error: null,
    } as any);
    vi.mocked(usePlatosModule.transformPlatosToUI).mockReturnValue(tapas);

    renderCarta();

    expect(screen.getByText("Tapea con tu Cóctel")).toBeInTheDocument();
  });
});

describe("Carta — alérgenos en cócteles", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAllHooksIdle();

    vi.mocked(usePlatosModule.usePlatosTouza).mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
      error: null,
    } as any);
    vi.mocked(usePlatosModule.transformPlatosToUI).mockReturnValue([]);
  });

  // La pestaña "Cócteles" es la activa por defecto (activeMainCategory
  // inicial), así que esta rejilla es la que sale en el HTML prerenderizado.
  // Es el caso que usa la auditoría para verificar el arreglo: hoy hay 0
  // platos de Touza, pero sí hay cócteles con datos reales.
  const mockCoctel = (overrides: Partial<CoctelUI> = {}): CoctelUI => ({
    id: "c1",
    name: "Negroni Touza",
    category: "clasicos",
    base: "gin",
    price: "9,50€",
    description: "Nuestra versión del clásico",
    ingredients: ["Ginebra", "Campari", "Vermut rojo"],
    image: "https://example.com/negroni.jpg",
    alergenos: [],
    alergenosNota: null,
    ...overrides,
  });

  it("muestra las etiquetas de alérgenos de un cóctel cuando constan", () => {
    vi.mocked(useCoctelesModule.useCocteles).mockReturnValue({
      data: [{}] as any,
      isLoading: false,
      isError: false,
      error: null,
    } as any);
    vi.mocked(useCoctelesModule.transformCoctelesToUI).mockReturnValue([
      mockCoctel({ alergenos: ["Sulfitos", "Lácteos"] }),
    ]);

    renderCarta();

    expect(screen.getByText("Negroni Touza")).toBeInTheDocument();
    expect(screen.getByText("Sulfitos")).toBeInTheDocument();
    expect(screen.getByText("Lácteos")).toBeInTheDocument();
    expect(screen.queryByText(/sin información de alérgenos/i)).not.toBeInTheDocument();
  });

  it("no repite el aviso de alérgenos en la tarjeta del cóctel; lo cubre el aviso único de la carta", () => {
    vi.mocked(useCoctelesModule.useCocteles).mockReturnValue({
      data: [{}] as any,
      isLoading: false,
      isError: false,
      error: null,
    } as any);
    vi.mocked(useCoctelesModule.transformCoctelesToUI).mockReturnValue([mockCoctel()]);

    renderCarta();

    expect(screen.getByText("Negroni Touza")).toBeInTheDocument();
    expect(screen.queryByText(/sin información de alérgenos/i)).not.toBeInTheDocument();
    expect(screen.getByText(AVISO_ALERGENOS_CARTA)).toBeInTheDocument();
  });
});

describe("Carta — estructura general", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAllHooksIdle();

    vi.mocked(usePlatosModule.usePlatosTouza).mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
      error: null,
    } as any);
    vi.mocked(usePlatosModule.transformPlatosToUI).mockReturnValue([]);
  });

  it("renderiza el héroe con el título 'Nuestra carta'", () => {
    renderCarta();
    expect(screen.getByRole("heading", { level: 1, name: /nuestra carta/i })).toBeInTheDocument();
  });

  it("muestra todas las categorías principales en los tabs", () => {
    renderCarta();
    expect(screen.getByRole("tab", { name: "Cócteles" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Champagne" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Cavas" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Cervezas" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Por copas" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Whiskies" })).toBeInTheDocument();
  });

  it("pinta TODAS las secciones con su <h2> aunque solo se vea la activa (carta indexable)", () => {
    renderCarta();
    for (const nombre of ["Cócteles", "Champagne", "Cavas", "Cervezas", "Por copas", "Whiskies"]) {
      expect(screen.getByRole("heading", { level: 2, name: nombre, hidden: true })).toBeInTheDocument();
    }
    expect(screen.getByRole("heading", { level: 2, name: "Cócteles" })).toBeVisible();
    expect(screen.getByRole("heading", { level: 2, name: "Whiskies", hidden: true })).not.toBeVisible();
  });

  it("renderiza el campo de búsqueda", () => {
    renderCarta();
    expect(screen.getByPlaceholderText("Buscar...")).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// Touza solo tiene espumosos (13/11/2026). Champagne y Cavas salen de las
// categorías «VINOS ESPUMOSOS — …»; tintos y blancos no tienen pestaña.
// ---------------------------------------------------------------------------
describe("Carta — espumosos", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAllHooksIdle();

    vi.mocked(usePlatosModule.usePlatosTouza).mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
      error: null,
    } as any);
    vi.mocked(usePlatosModule.transformPlatosToUI).mockReturnValue([]);
    vi.mocked(useVinosModule.transformVinosToUI).mockImplementation(
      (vinos) =>
        (vinos ?? []).map((v) => ({
          id: v.id as string,
          name: v.nombre as string,
          price: `${v.precio_eur}€`,
          featured: false,
          image: v.imagen_url || undefined,
        })) as never
    );
  });

  function mockVino(overrides: Record<string, unknown> = {}) {
    return {
      id: "vino-1",
      nombre: "Vino de prueba",
      descripcion: null,
      precio_eur: 20,
      imagen_url: null,
      categoria: "VINOS ESPUMOSOS — CHAMPAGNE",
      ubicacion_region: null,
      ubicacion_pais: null,
      denominacion_origen: null,
      featured: false,
      orden: "1",
      ...overrides,
    };
  }

  it("no hay pestañas de tintos ni blancos", () => {
    renderCarta();
    expect(screen.queryByRole("tab", { name: "Blancos" })).not.toBeInTheDocument();
    expect(screen.queryByRole("tab", { name: "Tintos" })).not.toBeInTheDocument();
  });

  it("reparte los espumosos: champagne a Champagne y el resto a Cavas, con foto si la tienen", () => {
    vi.mocked(useVinosModule.useEspumosos).mockReturnValue({
      data: [
        mockVino({ id: "c1", nombre: "Krug Grande Cuvée", imagen_url: "https://x/krug.webp" }),
        mockVino({ id: "v1", nombre: "Gramona Imperial", categoria: "VINOS ESPUMOSOS — CAVA" }),
        mockVino({ id: "v2", nombre: "Moscato de prueba", categoria: "VINOS ESPUMOSOS — MOSCATO D’ASTI" }),
      ],
      isLoading: false,
    } as any);

    renderCarta();

    fireEvent.mouseDown(screen.getByRole("tab", { name: "Champagne" }));
    expect(screen.getByText("Krug Grande Cuvée")).toBeVisible();
    expect(screen.getByText("Gramona Imperial")).not.toBeVisible();
    expect(screen.getByRole("img", { name: "Krug Grande Cuvée" })).toHaveAttribute("src", "https://x/krug.webp");

    fireEvent.mouseDown(screen.getByRole("tab", { name: "Cavas" }));
    expect(screen.getByText("Gramona Imperial")).toBeVisible();
    expect(screen.getByText("Moscato de prueba")).toBeVisible();
    expect(screen.getByText("Krug Grande Cuvée")).not.toBeVisible();
    expect(screen.queryByRole("img", { name: "Gramona Imperial" })).not.toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// Pulido de la carta (auditoría del 15/11/2026)
// ---------------------------------------------------------------------------
describe("Carta — cócteles con y sin foto, anclas y pie", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAllHooksIdle();
    vi.mocked(usePlatosModule.usePlatosTouza).mockReturnValue({ data: [], isLoading: false } as never);
    vi.mocked(usePlatosModule.transformPlatosToUI).mockReturnValue([]);
  });

  const coctel = (overrides: Partial<CoctelUI>): CoctelUI => ({
    id: "x",
    name: "X",
    category: "clasicos",
    base: "gin",
    price: "9,00€",
    description: "Descripción",
    ingredients: [],
    image: "",
    alergenos: [],
    alergenosNota: null,
    ...overrides,
  });

  function conCocteles(lista: CoctelUI[], crudos: Record<string, unknown>[] = []) {
    vi.mocked(useCoctelesModule.useCocteles).mockReturnValue({ data: crudos, isLoading: false } as never);
    vi.mocked(useCoctelesModule.transformCoctelesToUI).mockReturnValue(lista);
  }

  it("los cócteles con foto propia van en tarjeta y los que no, en fila de texto sin caja «TOUZA»", () => {
    conCocteles([
      coctel({ id: "1", name: "Moscow Mule", image: "https://x.supabase.co/storage/mule.webp" }),
      coctel({ id: "2", name: "Espresso Martini", image: "" }),
    ]);
    renderCarta();

    expect(screen.getByRole("img", { name: "Moscow Mule" })).toHaveAttribute("src", "https://x.supabase.co/storage/mule.webp");
    expect(screen.queryByRole("img", { name: "Espresso Martini" })).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Espresso Martini" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Más cócteles" })).toBeInTheDocument();
    expect(screen.queryByText("TOUZA")).not.toBeInTheDocument();
  });

  it("cada cóctel lleva su ancla (id = slug) para enlazarlo desde otras páginas", () => {
    conCocteles([
      coctel({ id: "1", name: "Moscow Mule", image: "https://x/mule.webp" }),
      coctel({ id: "2", name: "Piña Colada", image: "" }),
    ]);
    const { container } = renderCarta();
    expect(container.querySelector("#moscow-mule")).not.toBeNull();
    expect(container.querySelector("#pina-colada")).not.toBeNull();
  });

  it("el precio del cóctel va como texto junto al nombre, no en una píldora sobre la foto", () => {
    conCocteles([coctel({ id: "1", name: "Mojito", price: "8,50€", image: "https://x/mojito.webp" })]);
    renderCarta();
    const precio = screen.getByText("8,50€");
    expect(precio.className).not.toMatch(/bg-white/);
    expect(precio.closest("[class*='aspect-']")).toBeNull();
  });

  it("si la foto de una tarjeta no carga, el cóctel pasa a la lista de texto", () => {
    conCocteles([coctel({ id: "1", name: "Mojito", image: "https://x/rota.webp" })]);
    renderCarta();
    fireEvent.error(screen.getByRole("img", { name: "Mojito" }));
    expect(screen.queryByRole("img", { name: "Mojito" })).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Mojito" })).toBeInTheDocument();
  });

  it("la línea bajo el h1 sale de los datos: cuántos cócteles y el rango de precios", () => {
    conCocteles(
      [coctel({ id: "1", name: "A" })],
      [
        { nombre: "A", categoria: "autor", precio_eur: 9 },
        { nombre: "B", categoria: "clasicos", precio_eur: 8.5 },
        { nombre: "C", categoria: "sin-alcohol", precio_eur: 7 },
      ]
    );
    renderCarta();
    expect(screen.getByText(/^3 cócteles de autor, clásicos y sin alcohol, de 7 a 9 €\./)).toBeInTheDocument();
  });

  it("el aviso de alérgenos sale una sola vez y al pie, con el enlace a «Cómo llegar»", () => {
    renderCarta();
    expect(screen.getAllByText(AVISO_ALERGENOS_CARTA)).toHaveLength(1);
    expect(screen.getByRole("link", { name: "Cómo llegar" })).toHaveAttribute("href", "/contacto");
    expect(screen.getByRole("link", { name: /copas después de cenar/i })).toHaveAttribute("href", "/despues-de-cenar");
  });
});

describe("Carta — botellas", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAllHooksIdle();
    vi.mocked(usePlatosModule.usePlatosTouza).mockReturnValue({ data: [], isLoading: false } as never);
    vi.mocked(usePlatosModule.transformPlatosToUI).mockReturnValue([]);
    vi.mocked(useBebidasModule.transformBebidasToUI).mockImplementation(
      (bebidas) =>
        (bebidas ?? []).map((b) => ({
          id: b.id,
          name: b.nombre ?? "",
          price: `${b.precio_eur}€`,
          featured: false,
          description: b.descripcion ?? undefined,
        })) as never
    );
    vi.mocked(useVinosModule.transformVinosToUI).mockImplementation(
      (vinos) =>
        (vinos ?? []).map((v) => ({
          id: v.id,
          name: v.nombre ?? "",
          price: `${v.precio_eur}€`,
          featured: false,
          image: v.imagen_url || undefined,
          description: v.descripcion ?? undefined,
        })) as never
    );
  });

  const bebida = (id: string, nombre: string) => ({
    id,
    nombre,
    descripcion: null,
    precio_eur: 3,
    categoria: "Cervezas",
    tipo: null,
    tag: null,
    featured: false,
    orden: 1,
    tamano: null,
  });

  it("no repite cervezas: Heineken una vez y Cruz Campo / Cruzcampo Gran Reserva una vez", () => {
    vi.mocked(useBebidasModule.useBebidas).mockImplementation(
      (categoria: string) =>
        ({
          data:
            categoria === "Cervezas"
              ? [
                  bebida("1", "Heineken"),
                  bebida("2", "Cruz Campo Gran Reserva"),
                  bebida("3", "Heineken"),
                  bebida("4", "Cruzcampo Gran Reserva"),
                ]
              : [],
          isLoading: false,
        }) as never
    );
    renderCarta();
    fireEvent.mouseDown(screen.getByRole("tab", { name: "Cervezas" }));
    expect(screen.getAllByRole("heading", { name: "Heineken" })).toHaveLength(1);
    expect(screen.getAllByRole("heading", { name: /cruz ?campo gran reserva/i })).toHaveLength(1);
  });

  it("la descripción larga va plegada a una línea en un <details>, con el texto entero en el HTML", () => {
    const larga =
      "El ensamblaje de distintas añadas y la larga crianza aportan profundidad a la fruta madura, con recuerdos de bollería.";
    vi.mocked(useVinosModule.useEspumosos).mockReturnValue({
      data: [{ id: "c1", nombre: "Grand Siècle", descripcion: larga, precio_eur: 270, imagen_url: null, categoria: "VINOS ESPUMOSOS — CHAMPAGNE" }],
      isLoading: false,
    } as never);
    const { container } = renderCarta();
    const detalles = container.querySelector("details");
    expect(detalles).not.toBeNull();
    expect(detalles?.textContent).toContain(larga);
  });

  it("agrupa el champagne por tipo (brut, rosado, de añada) cuando la lista es larga", () => {
    const nombres = [
      "Collet Brut", "Ruinart Brut", "Krug Grande Cuvée", "Piper‑Heidsieck",
      "Laurent‑Perrier Rosé", "Ruinart Rosé",
      "Dom Pérignon Vintage 2013", "Laurent‑Perrier Millésimé 2015",
    ];
    vi.mocked(useVinosModule.useEspumosos).mockReturnValue({
      data: nombres.map((nombre, i) => ({ id: `c${i}`, nombre, descripcion: null, precio_eur: 50, imagen_url: null, categoria: "VINOS ESPUMOSOS — CHAMPAGNE" })),
      isLoading: false,
    } as never);
    renderCarta();
    fireEvent.mouseDown(screen.getByRole("tab", { name: "Champagne" }));
    for (const grupo of ["Brut", "Rosado", "De añada"]) {
      expect(screen.getByRole("heading", { level: 3, name: grupo })).toBeVisible();
    }
    expect(screen.getByRole("heading", { level: 4, name: "Ruinart Rosé" })).toBeVisible();
  });
});
