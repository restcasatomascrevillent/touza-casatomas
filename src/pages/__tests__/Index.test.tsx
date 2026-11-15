/**
 * Portada (rediseño del 15/11/2026): cinco bloques, SEO de la portada y
 * limpieza de textos. Se pinta con el Layout real (cabecera y pie).
 */
import { describe, it, expect, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import React from "react";
import { MemoryRouter } from "react-router-dom";
import Index from "../Index";

const seo = vi.hoisted(() => ({ props: null as null | { title: string; description: string } }));

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

  it("hero: TOUZA en el h1, la línea de hechos con Crevillent en un h2 y «Cómo llegar» a Google Maps", () => {
    pintar();
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(/TOUZA/);
    expect(screen.getByRole("heading", { level: 2, name: /Crevillent/ })).toBeInTheDocument();
    expect(
      screen.getByText("Abrimos de jueves a sábado hasta las 2:00 y el domingo hasta medianoche. Sin reservas: ven directamente.")
    ).toBeInTheDocument();

    const llegar = screen.getAllByRole("link", { name: "Cómo llegar a Touza (abre Google Maps)" });
    expect(llegar.length).toBeGreaterThan(0);
    for (const enlace of llegar) {
      expect(enlace.getAttribute("href")).toMatch(/^https:\/\/www\.google\.com\/maps\/dir\//);
    }
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

  it("los bloques: cócteles, el local y visítanos; fuera los pasos numerados de «En la barra»", () => {
    pintar();
    expect(screen.getByRole("heading", { level: 2, name: "Cócteles de autor" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: "El local" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: "Visítanos" })).toBeInTheDocument();
    // «En la barra» ahora es el título de la franja de clips (solo sale si hay
    // vídeos en src/assets/videos/clips); los pasos de la sección vieja no vuelven.
    expect(screen.queryByRole("heading", { name: "Se sirve" })).not.toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Y a disfrutarla" })).not.toBeInTheDocument();
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
