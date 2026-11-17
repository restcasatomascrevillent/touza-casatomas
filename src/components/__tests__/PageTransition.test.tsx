/**
 * Regla (17/11/2026): que el contenido de una página se vea NO puede depender
 * de que termine una animación de JavaScript.
 *
 * La transición de página era un `motion.div` de framer-motion dentro de
 * `<AnimatePresence mode="wait">`: la página nueva nacía con `opacity: 0` en
 * línea y solo el JS la subía a 1. Al entrar en /carta la salida no terminaba
 * nunca y la página se quedaba en negro para siempre (demo v0.19).
 *
 * Estos tests fallan si el contenedor de página (o cualquier otro ancestro
 * del contenido) vuelve a llevar una opacidad en línea por debajo de 1, al
 * nacer o durante la navegación. framer-motion NO se mockea a propósito: si
 * alguien lo vuelve a poner, aquí se ve lo que hace de verdad.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { Link, MemoryRouter, Route, Routes, useNavigate } from "react-router-dom";
import PageTransition from "../PageTransition";
import { routes } from "@/App";

vi.mock("@vercel/analytics/react", () => ({ Analytics: () => null }));
// Fuera del contenedor de página y con `useMatches` (solo router de datos).
vi.mock("@/components/BarraAccionesMovil", () => ({ default: () => null }));
// Su bucle de requestAnimationFrame no acaba con el `cancelAnimationFrame` de pega.
vi.mock("@/components/SmoothScroll", () => ({
  default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

/** Ancestros (él incluido) escondidos con un estilo en línea. */
function escondidosEnLinea(desde: Element): string[] {
  const escondidos: string[] = [];
  for (let el: Element | null = desde; el; el = el.parentElement) {
    const { opacity, visibility, display } = (el as HTMLElement).style;
    if ((opacity !== "" && Number(opacity) < 1) || visibility === "hidden" || display === "none") {
      escondidos.push(`<${el.tagName.toLowerCase()} style="${el.getAttribute("style")}">`);
    }
  }
  return escondidos;
}

const espera = (ms: number) => act(() => new Promise<void>((ok) => setTimeout(ok, ms)));

describe("PageTransition — el contenedor de página nunca nace escondido", () => {
  it("la primera página (la del SSG) sale sin estilo en línea y sin animación", () => {
    const { container } = render(
      <PageTransition>
        <h1>Portada</h1>
      </PageTransition>
    );
    const pagina = container.firstElementChild as HTMLElement;
    expect(pagina.getAttribute("style")).toBeNull();
    expect(pagina).not.toHaveClass("entrada-pagina");
    expect(escondidosEnLinea(screen.getByRole("heading", { level: 1 }))).toEqual([]);
  });

  it("las siguientes (navegación en cliente) nacen visibles: el fundido es una clase CSS", () => {
    render(
      <PageTransition>
        <h1>Portada</h1>
      </PageTransition>
    ).unmount();
    const { container } = render(
      <PageTransition>
        <h1>Carta</h1>
      </PageTransition>
    );
    const pagina = container.firstElementChild as HTMLElement;
    // Recién nacida, antes de que corra ningún fotograma de animación.
    expect(pagina.style.opacity).toBe("");
    expect(pagina.getAttribute("style")).toBeNull();
    expect(pagina).toHaveClass("entrada-pagina");
    expect(escondidosEnLinea(screen.getByRole("heading", { level: 1 }))).toEqual([]);
  });
});

describe("Layout raíz — navegar no esconde la página ni la deja a media altura", () => {
  // El layout de verdad (providers, transición y scroll) con páginas de pega.
  const Pagina = ({ titulo }: { titulo: string }) => {
    const navegar = useNavigate();
    return (
      <main>
        <h1>{titulo}</h1>
        <Link to="/carta">A la carta</Link>
        <Link to="/carta#moscow-mule">A un cóctel</Link>
        <Link to="/">Inicio</Link>
        <button onClick={() => navegar(-1)}>Atrás</button>
      </main>
    );
  };

  const montar = () =>
    render(
      <MemoryRouter initialEntries={["/"]}>
        <Routes>
          <Route path="/" element={routes[0].element}>
            <Route index element={<Pagina titulo="Portada" />} />
            <Route path="carta" element={<Pagina titulo="Carta" />} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

  const pulsar = (nombre: string) => fireEvent.click(screen.getByText(nombre));

  beforeEach(() => {
    vi.mocked(window.scrollTo).mockClear();
  });

  it("la página nueva está en el DOM y visible en el mismo render, y sigue así", async () => {
    montar();
    expect(screen.getByRole("heading", { level: 1, name: "Portada" })).toBeInTheDocument();

    // Cualquier opacidad en línea < 1 que aparezca mientras dura la navegación.
    const vistos: string[] = [];
    const observador = new MutationObserver(() => {
      const h1 = document.querySelector("h1");
      if (h1) vistos.push(...escondidosEnLinea(h1));
    });
    observador.observe(document.body, { attributes: true, attributeFilter: ["style"], childList: true, subtree: true });

    pulsar("A la carta");

    // Sin esperar a ninguna animación de salida: ya está la página nueva.
    const h1 = screen.getByRole("heading", { level: 1, name: "Carta" });
    expect(screen.queryByRole("heading", { level: 1, name: "Portada" })).not.toBeInTheDocument();
    expect(escondidosEnLinea(h1)).toEqual([]);

    // Y pasado el tiempo de cualquier transición, igual.
    await espera(700);
    observador.disconnect();
    expect(vistos).toEqual([]);
    expect(escondidosEnLinea(screen.getByRole("heading", { level: 1, name: "Carta" }))).toEqual([]);
  });

  it("cada navegación sube arriba; la carga inicial y un cambio de ancla, no", () => {
    montar();
    expect(window.scrollTo).not.toHaveBeenCalled();

    // El enlace de la página en la que ya se está («Inicio» en el pie).
    pulsar("Inicio");
    expect(window.scrollTo).toHaveBeenCalledTimes(1);

    pulsar("A la carta");
    expect(window.scrollTo).toHaveBeenCalledTimes(2);
    expect(window.scrollTo).toHaveBeenLastCalledWith(0, 0);

    // Misma página, otra ancla: de eso se ocupa la carta, no el layout.
    pulsar("A un cóctel");
    expect(window.scrollTo).toHaveBeenCalledTimes(2);

    // Atrás del navegador: de `/carta#moscow-mule` a `/carta`, y a la portada.
    pulsar("Atrás");
    expect(window.scrollTo).toHaveBeenCalledTimes(3);
    pulsar("Atrás");
    expect(screen.getByRole("heading", { level: 1, name: "Portada" })).toBeInTheDocument();
    expect(window.scrollTo).toHaveBeenCalledTimes(4);
    expect(window.scrollTo).toHaveBeenLastCalledWith(0, 0);
  });
});
