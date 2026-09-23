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

vi.mock("@/components/ui/svg/CocktailHoverOutlineSVG", () => ({
  CocktailHoverOutlineSVG: () => null,
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

  vi.mocked(useVinosModule.useVinosRestantes).mockReturnValue({
    data: undefined,
    isLoading: false,
  } as any);

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

  it("muestra el aviso de 'no consta' (no 'sin alérgenos') cuando el plato no tiene alergenos_oficiales", () => {
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

    expect(screen.getByText(/sin información de alérgenos/i)).toBeInTheDocument();
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

  it("muestra el aviso de 'no consta' cuando el cóctel no tiene alergenos_oficiales", () => {
    vi.mocked(useCoctelesModule.useCocteles).mockReturnValue({
      data: [{}] as any,
      isLoading: false,
      isError: false,
      error: null,
    } as any);
    vi.mocked(useCoctelesModule.transformCoctelesToUI).mockReturnValue([mockCoctel()]);

    renderCarta();

    expect(screen.getByText("Negroni Touza")).toBeInTheDocument();
    expect(screen.getByText(/sin información de alérgenos/i)).toBeInTheDocument();
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

  it("renderiza el héroe con el título 'Nuestra Carta'", () => {
    renderCarta();
    expect(screen.getByText("Nuestra Carta")).toBeInTheDocument();
  });

  it("muestra todas las categorías principales en los tabs", () => {
    renderCarta();
    expect(screen.getByText("Cócteles")).toBeInTheDocument();
    expect(screen.getByText("Champagne")).toBeInTheDocument();
    expect(screen.getByText("Cavas")).toBeInTheDocument();
    expect(screen.getByText("Cervezas")).toBeInTheDocument();
    expect(screen.getByText("Copas de Vino")).toBeInTheDocument();
    expect(screen.getByText("Whiskies")).toBeInTheDocument();
  });

  it("renderiza el campo de búsqueda", () => {
    renderCarta();
    expect(screen.getByPlaceholderText("Buscar...")).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// Regresión: antes de este cambio, Carta.tsx solo pedía las categorías de
// Vinos "CHAMPAGNES" y "CAVAS Y OTROS ESPUMOSOS" (escritas a mano). Cualquier
// otra categoría —tintos, blancos...— no tenía pestaña donde caer y
// desaparecía de la carta aunque estuviera marcada touza=true, activado=true.
// ---------------------------------------------------------------------------
describe("Carta — vinos con denominación de origen (Blancos/Tintos)", () => {
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

  function mockVino(overrides: Record<string, unknown> = {}) {
    return {
      id: "vino-1",
      nombre: "Vino de prueba",
      descripcion: null,
      precio_eur: 20,
      categoria: "VINOS TINTOS — RIBERA DEL DUERO",
      ubicacion_region: null,
      ubicacion_pais: null,
      denominacion_origen: null,
      featured: false,
      touza: true,
      restaurante: null,
      orden: "1",
      ...overrides,
    };
  }

  it("no añade pestañas de vino nuevas cuando useVinosRestantes no devuelve datos (mismo comportamiento que antes)", () => {
    renderCarta();
    expect(screen.queryByText("Blancos")).not.toBeInTheDocument();
    expect(screen.queryByText("Tintos")).not.toBeInTheDocument();
  });

  it("deriva pestañas 'Blancos' y 'Tintos' de categorías reales, y cada una muestra sus propios vinos", () => {
    vi.mocked(useVinosModule.useVinosRestantes).mockReturnValue({
      data: [
        mockVino({ id: "t1", nombre: "Pesus", categoria: "VINOS TINTOS — RIBERA DEL DUERO" }),
        mockVino({ id: "b1", nombre: "Martín Códax", categoria: "VINOS BLANCOS — ALBARIÑO (RÍAS BAIXAS)" }),
      ],
      isLoading: false,
    } as any);
    // agruparVinosPorTipo llama a transformVinosToUI de verdad (no es lo que
    // se está probando aquí): se reemplaza el mock automático del módulo por
    // una implementación equivalente para que el nombre llegue a pantalla.
    vi.mocked(useVinosModule.transformVinosToUI).mockImplementation(
      (vinos) =>
        (vinos ?? []).map((v) => ({
          id: v.id as string,
          name: v.nombre as string,
          price: `${v.precio_eur}€`,
          featured: false,
        })) as never
    );

    renderCarta();

    expect(screen.getByText("Blancos")).toBeInTheDocument();
    expect(screen.getByText("Tintos")).toBeInTheDocument();

    // "Cócteles" es la pestaña activa por defecto: el tinto aún no se ve.
    expect(screen.queryByText("Pesus")).not.toBeInTheDocument();

    // Radix activa TabsTrigger en onMouseDown (no en onClick), igual que en
    // el navegador un click real dispara mousedown antes que click.
    fireEvent.mouseDown(screen.getByText("Tintos"));
    expect(screen.getByText("Pesus")).toBeInTheDocument();
    expect(screen.queryByText("Martín Códax")).not.toBeInTheDocument();

    fireEvent.mouseDown(screen.getByText("Blancos"));
    expect(screen.getByText("Martín Códax")).toBeInTheDocument();
    expect(screen.queryByText("Pesus")).not.toBeInTheDocument();
  });

  it("dentro de una pestaña de vino, filtra por denominación de origen al elegir un filtro", () => {
    vi.mocked(useVinosModule.useVinosRestantes).mockReturnValue({
      data: [
        mockVino({ id: "t1", nombre: "Pesus", categoria: "VINOS TINTOS — RIBERA DEL DUERO" }),
        mockVino({ id: "t2", nombre: "Muga Reserva", categoria: "VINOS TINTOS — RIOJA" }),
      ],
      isLoading: false,
    } as any);
    vi.mocked(useVinosModule.transformVinosToUI).mockImplementation(
      (vinos) =>
        (vinos ?? []).map((v) => ({
          id: v.id as string,
          name: v.nombre as string,
          price: `${v.precio_eur}€`,
          featured: false,
        })) as never
    );

    renderCarta();
    fireEvent.mouseDown(screen.getByText("Tintos"));

    // Con "Todos" (estado inicial del filtro) se ven las dos denominaciones.
    expect(screen.getByText("Pesus")).toBeInTheDocument();
    expect(screen.getByText("Muga Reserva")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Ribera del Duero"));
    expect(screen.getByText("Pesus")).toBeInTheDocument();
    expect(screen.queryByText("Muga Reserva")).not.toBeInTheDocument();
  });
});
