import { describe, expect, it } from "vitest";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import FilaBotella from "../FilaBotella";

const fila = (props: Partial<Parameters<typeof FilaBotella>[0]> = {}) => (
  <ul>
    <FilaBotella nombre="Krug Grande Cuvée" precio="330,00€" imagen="https://x/krug.webp" indice={0} {...props} />
  </ul>
);

describe("FilaBotella — la foto del nicho", () => {
  it("en el HTML del SSG la foto se ve tal cual (sin data-foto, nada oculto)", () => {
    const html = renderToString(fila());
    expect(html).toContain("https://x/krug.webp");
    expect(html).not.toContain("data-foto");
  });

  it("si aún no ha llegado, espera oculta sobre el fondo cálido y sube cuando carga", () => {
    const { container } = render(fila());
    const nicho = container.querySelector(".nicho-botella");
    expect(nicho).toHaveAttribute("data-foto", "esperando");
    fireEvent.load(screen.getByRole("img", { name: "Krug Grande Cuvée" }));
    expect(nicho).toHaveAttribute("data-foto", "llego");
  });

  it("si falla, se queda el fondo cálido (sin icono de imagen rota)", () => {
    const { container } = render(fila());
    fireEvent.error(screen.getByRole("img", { name: "Krug Grande Cuvée" }));
    expect(container.querySelector(".nicho-botella")).toHaveAttribute("data-foto", "esperando");
  });

  it("las primeras filas de la pestaña abierta van sin lazy; el resto, con lazy", () => {
    const { rerender } = render(fila({ prioritaria: true }));
    expect(screen.getByRole("img", { name: "Krug Grande Cuvée" })).toHaveAttribute("loading", "eager");
    rerender(fila({ prioritaria: false }));
    expect(screen.getByRole("img", { name: "Krug Grande Cuvée" })).toHaveAttribute("loading", "lazy");
  });
});

describe("FilaBotella — descripción, tipo y precio por copa", () => {
  const texto = "Champagne de prestigio, ensamblaje de más de 120 vinos de diez añadas distintas.";

  it("ya no hay «i»: la descripción entera va a la vista (también en el HTML del SSG)", () => {
    expect(renderToString(fila({ descripcion: texto }))).toContain(texto);
    render(fila({ descripcion: texto }));
    expect(screen.queryByRole("button", { name: /más información/i })).not.toBeInTheDocument();
    const parrafo = screen.getByText(texto);
    expect(parrafo).toBeVisible();
    expect(parrafo.className).not.toMatch(/line-clamp/);
  });

  it("el tipo y el precio por copa se ven, aunque no haya descripción", () => {
    render(fila({ tipo: "Brut", porCopa: "13,50 €" }));
    expect(screen.getByText(/Por copa:/)).toBeVisible();
    expect(screen.getByText(/Por copa:/).textContent).toBe("Por copa: 13,50 €");
    expect(screen.getByText("Brut")).toBeVisible();
  });

  it("con la fila entera pulsable (cóctel sin foto) la descripción va en dos líneas", () => {
    render(fila({ imagen: undefined, descripcion: texto, alPulsar: () => {} }));
    expect(screen.getByText(texto)).toBeVisible();
    expect(screen.getByText(texto).className).toMatch(/line-clamp-2/);
  });

  it("sin foto y con hueco, la silueta guarda el sitio del nicho; sin hueco, nada", () => {
    const { container, rerender } = render(fila({ imagen: undefined, conHueco: true }));
    expect(container.querySelector("li > div[aria-hidden='true'] svg")).not.toBeNull();
    rerender(fila({ imagen: undefined, conHueco: false }));
    expect(container.querySelector("li > div[aria-hidden='true'] svg")).toBeNull();
  });
});

describe("FilaBotella — ampliar la foto", () => {
  it("al pulsar la foto se abre en grande con el nombre de la botella", () => {
    render(fila());
    fireEvent.click(screen.getByRole("button", { name: "Ampliar la foto de Krug Grande Cuvée" }));
    const visor = screen.getByRole("dialog", { name: "Krug Grande Cuvée" });
    expect(within(visor).getByRole("img", { name: "Krug Grande Cuvée" })).toHaveAttribute(
      "src",
      expect.stringContaining("krug.webp"),
    );
  });

  it("la caja tiene su tamaño desde el principio: miniatura desenfocada de base y la grande entra al cargar", () => {
    render(fila());
    fireEvent.click(screen.getByRole("button", { name: "Ampliar la foto de Krug Grande Cuvée" }));
    const visor = screen.getByRole("dialog", { name: "Krug Grande Cuvée" });
    const caja = visor.querySelector(".visor-botella");
    expect(caja?.className).toMatch(/aspect-\[3\/5\]/);
    expect(caja).toHaveAttribute("data-grande", "cargando");
    const imagenes = caja!.querySelectorAll("img");
    expect(imagenes).toHaveLength(2);
    expect(imagenes[0]).toHaveAttribute("aria-hidden", "true");
    expect(imagenes[0].className).toMatch(/blur/);
    fireEvent.load(within(visor).getByRole("img", { name: "Krug Grande Cuvée" }));
    expect(caja).toHaveAttribute("data-grande", "llego");
  });

  it("precarga la foto grande al pasar el ratón, tocar o enfocar el botón (una sola vez)", () => {
    const creadas: HTMLImageElement[] = [];
    const Original = window.Image;
    window.Image = class extends Original {
      constructor() {
        super();
        creadas.push(this);
      }
    } as typeof Image;
    try {
      render(fila());
      const boton = screen.getByRole("button", { name: "Ampliar la foto de Krug Grande Cuvée" });
      fireEvent.pointerEnter(boton);
      fireEvent.focus(boton);
      fireEvent.touchStart(boton);
      expect(creadas).toHaveLength(1);
      expect(creadas[0].src).toContain("krug.webp");
    } finally {
      window.Image = Original;
    }
  });

  it("sin foto no hay botón de ampliar", () => {
    render(fila({ imagen: undefined }));
    expect(screen.queryByRole("button", { name: /ampliar la foto/i })).not.toBeInTheDocument();
  });
});
