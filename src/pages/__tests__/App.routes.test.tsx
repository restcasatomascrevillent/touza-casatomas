/**
 * Test de navegación básico para App.tsx
 *
 * Verifica que cada ruta principal renderiza sin crashear y muestra el
 * contenido mínimo esperado.  Todos los componentes pesados (Three.js,
 * Supabase, Lenis…) se mockean para aislar el test de dependencias externas.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import React, { Suspense } from "react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// ---------------------------------------------------------------------------
// Mocks globales
// ---------------------------------------------------------------------------

vi.mock("@/integrations/supabase/client", () => ({
  supabase: { from: vi.fn() },
}));

// Hooks de datos — vacíos para todas las rutas
vi.mock("@/hooks/usePlatos", () => ({
  usePlatosTouza: () => ({ data: [], isLoading: false, isError: false }),
  useMostrarFotosPlatosTouza: () => true,
  transformPlatosToUI: () => [],
}));
vi.mock("@/hooks/useCocteles", () => ({
  useCocteles: () => ({ data: [], isLoading: false }),
  transformCoctelesToUI: () => [],
}));
vi.mock("@/hooks/useVinos", () => ({
  useVinos: () => ({ data: [], isLoading: false }),
  useVinosRestantes: () => ({ data: [], isLoading: false }),
  transformVinosToUI: () => [],
}));
vi.mock("@/hooks/useBebidas", () => ({
  useBebidas: () => ({ data: [], isLoading: false }),
  transformBebidasToUI: () => [],
}));

// Layout — contenedor transparente
vi.mock("@/components/layout/Layout", () => ({
  default: ({ children }: { children: React.ReactNode }) =>
    React.createElement("div", { "data-testid": "layout" }, children),
}));

vi.mock("@/components/Seo", () => ({ default: () => null }));

vi.mock("framer-motion", () => ({
  motion: new Proxy(
    {},
    {
      get: (_: object, tag: string) =>
        React.forwardRef(({ children, ...props }: any, ref: any) =>
          React.createElement(tag, { ...props, ref }, children)
        ),
    }
  ),
  AnimatePresence: ({ children }: { children: React.ReactNode }) =>
    React.createElement(React.Fragment, null, children),
}));

vi.mock("@/hooks/use-mobile", () => ({ useIsMobile: () => false }));
vi.mock("@/hooks/use-toast", () => ({
  useToast: () => ({ toast: vi.fn() }),
}));

vi.mock("@/components/ui/optimized-image", () => ({
  OptimizedImage: ({ src, alt }: { src: string; alt: string }) =>
    React.createElement("img", { src, alt }),
}));

vi.mock("@/components/ui/svg/LiquidLoaderSVG", () => ({
  LiquidLoaderSVG: () => React.createElement("div", { "data-testid": "liquid-loader" }),
}));
vi.mock("@/components/ui/svg/CocktailHoverOutlineSVG", () => ({
  CocktailHoverOutlineSVG: () => null,
}));

vi.mock("lenis", () => ({
  default: vi.fn().mockImplementation(() => ({
    raf: vi.fn(),
    destroy: vi.fn(),
    on: vi.fn(),
    off: vi.fn(),
  })),
}));

// CookieConsent y PageTransition — no relevantes para este test
vi.mock("@/components/CookieConsent", () => ({ default: () => null }));
vi.mock("@/components/PageTransition", () => ({
  default: ({ children }: { children: React.ReactNode }) =>
    React.createElement(React.Fragment, null, children),
}));
vi.mock("@/components/SmoothScroll", () => ({
  default: ({ children }: { children: React.ReactNode }) =>
    React.createElement(React.Fragment, null, children),
}));

// Componentes del home que pueden tener dependencias pesadas
vi.mock("@/components/home/HeroDesktop", () => ({
  default: () => React.createElement("div", { "data-testid": "hero-desktop" }, "TOUZA Hero"),
}));
vi.mock("@/components/home/HeroMobile", () => ({
  default: () => React.createElement("div", { "data-testid": "hero-mobile" }, "TOUZA Hero"),
}));
vi.mock("@/components/home/ShowcaseSection", () => ({
  default: () => null,
}));
vi.mock("@/components/home/ShowcaseMobile", () => ({
  default: () => null,
}));
vi.mock("@/components/home/FeaturesGrid", () => ({
  default: () => null,
}));
vi.mock("@/components/home/FeaturesMobile", () => ({
  default: () => null,
}));
vi.mock("@/components/ScrollTextReveal", () => ({
  default: () => null,
}));
vi.mock("@/components/VisitUs", () => ({
  default: () => null,
}));
vi.mock("@/components/CustomCursor", () => ({
  default: () => null,
}));
vi.mock("@/components/layout/Footer", () => ({
  default: () => null,
}));
vi.mock("@/components/layout/Header", () => ({
  default: () => null,
}));

// ---------------------------------------------------------------------------
// Imports lazy de las páginas
// ---------------------------------------------------------------------------
const Index = React.lazy(() => import("../Index"));
const Carta = React.lazy(() => import("../Carta"));
const Reservado = React.lazy(() => import("../Reservado"));
const Contacto = React.lazy(() => import("../Contacto"));
const NotFound = React.lazy(() => import("../NotFound"));

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function buildQC() {
  return new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  });
}

function renderRoute(path: string) {
  const qc = buildQC();
  return render(
    React.createElement(
      QueryClientProvider,
      { client: qc },
      React.createElement(
        MemoryRouter,
        { initialEntries: [path] },
        React.createElement(
          Suspense,
          { fallback: React.createElement("div", null, "Cargando...") },
          React.createElement(
            Routes,
            null,
            React.createElement(Route, { path: "/", element: React.createElement(Index) }),
            React.createElement(Route, { path: "/carta", element: React.createElement(Carta) }),
            React.createElement(Route, { path: "/reservado", element: React.createElement(Reservado) }),
            React.createElement(Route, { path: "/contacto", element: React.createElement(Contacto) }),
            React.createElement(Route, { path: "*", element: React.createElement(NotFound) })
          )
        )
      )
    )
  );
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("Rutas de la aplicación — renderizan sin crash", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("ruta '/' — renderiza la página Index sin crash", async () => {
    renderRoute("/");
    await waitFor(
      () => expect(screen.queryByText("Cargando...")).not.toBeInTheDocument(),
      { timeout: 5000 }
    );
    // HeroDesktop (mocked) se renderiza en la ruta raíz
    expect(screen.getByTestId("hero-desktop")).toBeInTheDocument();
  });

  it("ruta '/carta' — renderiza la página Carta", async () => {
    renderRoute("/carta");
    await waitFor(
      () => expect(screen.queryByText("Cargando...")).not.toBeInTheDocument(),
      { timeout: 5000 }
    );
    expect(screen.getByText("Nuestra Carta")).toBeInTheDocument();
  });

  it("ruta '/reservado' — renderiza la página El Reservado", async () => {
    renderRoute("/reservado");
    await waitFor(
      () => expect(screen.queryByText("Cargando...")).not.toBeInTheDocument(),
      { timeout: 5000 }
    );
    expect(screen.getByText("El Reservado")).toBeInTheDocument();
  });

  it("ruta '/contacto' — renderiza la página Contacto", async () => {
    renderRoute("/contacto");
    await waitFor(
      () => expect(screen.queryByText("Cargando...")).not.toBeInTheDocument(),
      { timeout: 5000 }
    );
    expect(
      screen.getByRole("heading", { level: 1, name: /contacto/i })
    ).toBeInTheDocument();
  });

  it("ruta desconocida '*/no-existe' — renderiza NotFound con texto 404", async () => {
    renderRoute("/ruta-que-no-existe");
    await waitFor(
      () => expect(screen.queryByText("Cargando...")).not.toBeInTheDocument(),
      { timeout: 5000 }
    );
    expect(screen.getByText("404")).toBeInTheDocument();
    expect(screen.getByText("Página no encontrada")).toBeInTheDocument();
  });
});
