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

describe("FilaBotella — la «i» de la descripción", () => {
  const texto = "Champagne de prestigio, ensamblaje de más de 120 vinos de diez añadas distintas.";

  it("sin descripción no hay «i»", () => {
    render(fila());
    expect(screen.queryByRole("button", { name: /más información/i })).not.toBeInTheDocument();
  });

  it("la descripción está en el HTML pero plegada, y la «i» la abre y la cierra", () => {
    expect(renderToString(fila({ descripcion: texto }))).toContain(texto);
    render(fila({ descripcion: texto }));
    const boton = screen.getByRole("button", { name: "Más información de Krug Grande Cuvée" });
    const parrafo = screen.getByText(texto);
    expect(boton).toHaveAttribute("aria-expanded", "false");
    expect(document.getElementById(boton.getAttribute("aria-controls") ?? "")).toContainElement(parrafo);
    expect(parrafo).not.toBeVisible();
    fireEvent.click(boton);
    expect(boton).toHaveAttribute("aria-expanded", "true");
    expect(parrafo).toBeVisible();
    fireEvent.click(boton);
    expect(parrafo).not.toBeVisible();
  });

  it("el precio por copa y el tipo van dentro de la «i», aunque no haya descripción", () => {
    render(fila({ tipo: "Brut", porCopa: "13,50 €" }));
    const boton = screen.getByRole("button", { name: "Más información de Krug Grande Cuvée" });
    expect(screen.getByText(/Por copa:/)).not.toBeVisible();
    fireEvent.click(boton);
    expect(screen.getByText(/Por copa:/)).toBeVisible();
    expect(screen.getByText(/Por copa:/).textContent).toBe("Por copa: 13,50 €");
    expect(screen.getByText("Brut")).toBeVisible();
  });

  it("con la fila entera pulsable no hay «i»: la descripción va a la vista", () => {
    render(fila({ descripcion: texto, alPulsar: () => {} }));
    expect(screen.queryByRole("button", { name: /más información/i })).not.toBeInTheDocument();
    expect(screen.getByText(texto)).toBeVisible();
  });
});
