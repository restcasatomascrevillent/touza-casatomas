import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, within } from "@testing-library/react";
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
      },
      {
        id: "2",
        name: "Patatas bravas",
        description: "Con salsa brava",
        price: "5,00€",
        image: "/placeholder.svg",
        categoria: "tapas",
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

  it("muestra /placeholder.svg cuando imagen_url de un plato es null", () => {
    const tapas = [
      {
        id: "2",
        name: "Patatas bravas",
        description: "Con salsa brava",
        price: "5,00€",
        image: "/placeholder.svg",
        categoria: "tapas",
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
