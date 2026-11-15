import { describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
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
