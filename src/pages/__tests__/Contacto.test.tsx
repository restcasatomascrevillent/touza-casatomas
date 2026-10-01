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
  it("muestra el título 'Contacto'", () => {
    renderContacto();
    expect(screen.getByRole("heading", { level: 1, name: /contacto/i })).toBeInTheDocument();
  });

  it("muestra la dirección del local", () => {
    renderContacto();
    expect(screen.getByText(/C\/ San Vicente, 14/i)).toBeInTheDocument();
  });

  it("muestra el número de teléfono", () => {
    renderContacto();
    expect(screen.getByText("966 782 000")).toBeInTheDocument();
  });

  it("muestra el email de contacto", () => {
    renderContacto();
    expect(screen.getByText("info@touzabar.es")).toBeInTheDocument();
  });

  it("muestra el horario del bar", () => {
    renderContacto();
    expect(screen.getByText(/Jue - Sáb/i)).toBeInTheDocument();
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

  it("sin consentimiento, NO carga el iframe de Google Maps (cookies de terceros)", () => {
    localStorage.removeItem("touza_cookie_consent");
    renderContacto();
    expect(screen.queryByTitle("Ubicación Touza")).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: /abrir en google maps/i })).toBeInTheDocument();
  });

  it("con 'Rechazar' guardado, el mapa tampoco se carga solo", () => {
    localStorage.setItem("touza_cookie_consent", "rejected");
    renderContacto();
    expect(screen.queryByTitle("Ubicación Touza")).not.toBeInTheDocument();
    localStorage.removeItem("touza_cookie_consent");
  });

  it("el iframe del mapa aparece al pedirlo, con su título de accesibilidad", () => {
    localStorage.removeItem("touza_cookie_consent");
    renderContacto();
    fireEvent.click(screen.getByRole("button", { name: /cargar mapa/i }));
    expect(screen.getByTitle("Ubicación Touza")).toBeInTheDocument();
  });

  it("con 'Aceptar' guardado, el mapa se carga directamente", () => {
    localStorage.setItem("touza_cookie_consent", "accepted");
    renderContacto();
    expect(screen.getByTitle("Ubicación Touza")).toBeInTheDocument();
    localStorage.removeItem("touza_cookie_consent");
  });

  it("en el móvil, acciones rápidas para llamar, llegar y escribir", () => {
    renderContacto();
    const acciones = screen.getByRole("navigation", { name: /acciones rápidas/i });
    const enlaces = Array.from(acciones.querySelectorAll("a")).map((a) => a.getAttribute("href"));
    expect(enlaces[0]).toBe("tel:+34966782000");
    expect(enlaces[1]).toContain("google.com/maps/dir/");
    expect(enlaces[2]).toBe("mailto:info@touzabar.es");
  });

  it("muestra el encabezado 'Encuéntranos'", () => {
    renderContacto();
    expect(screen.getByRole("heading", { name: /encuéntranos/i })).toBeInTheDocument();
  });
});
