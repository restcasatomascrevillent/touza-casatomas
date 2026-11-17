import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import React from "react";

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

vi.mock("@/integrations/supabase/client", () => ({
  supabase: { from: vi.fn() },
}));

vi.mock("@/components/layout/Layout", () => ({
  default: ({ children }: { children: React.ReactNode }) =>
    React.createElement("div", { "data-testid": "layout" }, children),
}));

vi.mock("@/components/Seo", () => ({
  default: () => null,
}));

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

vi.mock("@/hooks/use-mobile", () => ({
  useIsMobile: () => false,
}));

// ---------------------------------------------------------------------------
// Import bajo test
// ---------------------------------------------------------------------------
import Contacto from "../Contacto";

function renderContacto() {
  return render(
    React.createElement(MemoryRouter, null, React.createElement(Contacto))
  );
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("Contacto — renderizado", () => {
  it("el h1 dice 'Cómo llegar'", () => {
    renderContacto();
    expect(screen.getByRole("heading", { level: 1, name: "Cómo llegar" })).toBeInTheDocument();
  });

  it("muestra la dirección del local", () => {
    renderContacto();
    expect(screen.getAllByText(/C\/ Santa María de la Cabeza, 4/i).length).toBeGreaterThan(0);
    expect(screen.queryByText(/San Vicente/i)).not.toBeInTheDocument();
  });

  it("ya no hay preguntas frecuentes (ni la pregunta en inglés)", () => {
    renderContacto();
    expect(screen.queryByRole("heading", { name: /preguntas frecuentes/i })).not.toBeInTheDocument();
    expect(screen.queryByText(/cocktail bar in Crevillent/i)).not.toBeInTheDocument();
  });

  it("muestra el número de teléfono", () => {
    renderContacto();
    expect(screen.getByText("966 782 000")).toBeInTheDocument();
  });

  it("muestra el email de contacto", () => {
    renderContacto();
    expect(screen.getByText("info@touzabar.es")).toBeInTheDocument();
  });

  it("muestra el horario del bar, sacado de NEGOCIO", () => {
    renderContacto();
    expect(screen.getByText(/Jueves: 16:00 – 01:00/)).toBeInTheDocument();
    expect(screen.getByText(/Viernes: 15:30 – 02:00/)).toBeInTheDocument();
    expect(screen.getByText(/Domingo: 15:00 – 20:00/)).toBeInTheDocument();
  });

  it("el enlace de teléfono tiene href=tel correcto", () => {
    renderContacto();
    const telLink = screen.getByRole("link", { name: /966 782 000/ });
    expect(telLink.getAttribute("href")).toBe("tel:+34966782000");
  });

  it("el enlace de email tiene href=mailto correcto", () => {
    renderContacto();
    const mailLink = screen.getByRole("link", { name: /info@touzabar.es/ });
    expect(mailLink.getAttribute("href")).toBe("mailto:info@touzabar.es");
  });

  it("el enlace de Instagram apunta a la cuenta correcta", () => {
    renderContacto();
    const igLink = screen.getByRole("link", { name: /instagram/i });
    expect(igLink.getAttribute("href")).toContain("instagram.com/touzabar");
  });

  it("el enlace de Facebook apunta a la cuenta correcta", () => {
    renderContacto();
    const fbLink = screen.getByRole("link", { name: /facebook/i });
    expect(fbLink.getAttribute("href")).toContain("facebook.com/touzabar");
  });

  it("botón 'Cómo llegar' a Google Maps en todos los tamaños (sin clases que lo oculten)", () => {
    renderContacto();
    const acciones = screen.getByRole("navigation", { name: /acciones rápidas/i });
    expect(acciones.className).not.toMatch(/(^|\s)(hidden|lg:hidden|md:hidden)(\s|$)/);
    const enlaces = Array.from(acciones.querySelectorAll("a")).map((a) => a.getAttribute("href"));
    expect(enlaces).toHaveLength(2);
    expect(enlaces[0]).toContain("google.com/maps/dir/");
    expect(enlaces[1]).toBe("mailto:info@touzabar.es");
    expect(acciones.textContent).toMatch(/Cómo llegar/);
    expect(acciones.textContent).not.toMatch(/llamar/i);
  });

  it("muestra el encabezado 'Encuéntranos'", () => {
    renderContacto();
    expect(screen.getByRole("heading", { name: /encuéntranos/i })).toBeInTheDocument();
  });
});

describe("Contacto — mapa", () => {
  it("por defecto, mapa estático alojado en la web con la atribución de OpenStreetMap", () => {
    localStorage.removeItem("touza_cookie_consent");
    renderContacto();
    expect(screen.getByRole("img", { name: /mapa del centro de crevillent/i })).toHaveAttribute("src", "/mapa-touza.webp");
    expect(screen.getByRole("link", { name: "© OpenStreetMap" })).toHaveAttribute(
      "href",
      "https://www.openstreetmap.org/copyright"
    );
    expect(screen.getByRole("link", { name: /abrir en google maps/i })).toBeInTheDocument();
  });

  it("sin elección, el iframe no se carga solo; al pedirlo, se pregunta en el hueco del mapa", () => {
    localStorage.removeItem("touza_cookie_consent");
    renderContacto();
    expect(screen.queryByTitle("Ubicación Touza")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Ver mapa interactivo de Google" }));
    expect(screen.queryByTitle("Ubicación Touza")).not.toBeInTheDocument();
    const pregunta = screen.getByRole("group", { name: "Mapa interactivo de Google" });
    expect(pregunta).toHaveAccessibleDescription(/cookies/);
    const aceptar = screen.getByRole("button", { name: "Aceptar" });
    expect(aceptar).toHaveFocus();
    expect(aceptar.className).toBe(screen.getByRole("button", { name: "Rechazar" }).className);
    expect(screen.getByRole("link", { name: "Más información" })).toHaveAttribute("href", "/cookies");

    fireEvent.click(aceptar);
    expect(localStorage.getItem("touza_cookie_consent")).toBe("accepted");
    expect(screen.getByTitle("Ubicación Touza")).toBeInTheDocument();
    localStorage.removeItem("touza_cookie_consent");
  });

  it("«Rechazar» guarda la elección y vuelve al mapa estático, sin iframe", () => {
    localStorage.removeItem("touza_cookie_consent");
    renderContacto();
    fireEvent.click(screen.getByRole("button", { name: "Ver mapa interactivo de Google" }));
    fireEvent.click(screen.getByRole("button", { name: "Rechazar" }));
    expect(localStorage.getItem("touza_cookie_consent")).toBe("rejected");
    expect(screen.queryByTitle("Ubicación Touza")).not.toBeInTheDocument();
    expect(screen.queryByRole("group", { name: "Mapa interactivo de Google" })).not.toBeInTheDocument();
    expect(screen.getByRole("img", { name: /mapa del centro de crevillent/i })).toBeInTheDocument();
    localStorage.removeItem("touza_cookie_consent");
  });

  it("con 'Aceptar' ya guardado, no se carga solo, pero al pedirlo sale directamente", () => {
    localStorage.setItem("touza_cookie_consent", "accepted");
    renderContacto();
    expect(screen.queryByTitle("Ubicación Touza")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Ver mapa interactivo de Google" }));
    expect(screen.getByTitle("Ubicación Touza")).toBeInTheDocument();
    localStorage.removeItem("touza_cookie_consent");
  });
});
