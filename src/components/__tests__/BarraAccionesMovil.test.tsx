import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import React from "react";
import BarraAccionesMovil from "../BarraAccionesMovil";
import { SIN_BARRA_MOVIL } from "@/lib/barra-movil";

// Router de datos (como el de vite-react-ssg): la barra lee el `handle` de la
// ruta con useMatches.
const pintar = (handle?: unknown) =>
  render(
    React.createElement(RouterProvider, {
      router: createMemoryRouter([{ path: "*", handle, element: React.createElement(BarraAccionesMovil) }]),
    }),
  );

describe("BarraAccionesMovil", () => {
  it("ofrece Llamar (al 966 782 000) y Cómo llegar (ruta en Google Maps), sin reservar", () => {
    pintar();
    const barra = screen.getByRole("navigation", { name: "Acciones rápidas" });
    const llamar = screen.getByRole("link", { name: /^Llamar/ });
    const llegar = screen.getByRole("link", { name: /^Cómo llegar/ });

    expect(llamar).toHaveAttribute("href", "tel:+34966782000");
    expect(llamar).toHaveAccessibleName(/966 782 000/);
    const url = new URL(llegar.getAttribute("href") ?? "");
    expect(url.origin + url.pathname).toBe("https://www.google.com/maps/dir/");
    expect(url.searchParams.get("destination")).toBe("C/ San Vicente, 14, 03330 Crevillente, Alicante");
    expect(llegar).toHaveAttribute("target", "_blank");
    expect(barra.textContent).not.toMatch(/reserv/i);
  });

  it("no sale en las rutas con SIN_BARRA_MOVIL", () => {
    pintar(SIN_BARRA_MOVIL);
    expect(screen.queryByRole("navigation", { name: "Acciones rápidas" })).not.toBeInTheDocument();
  });
});
