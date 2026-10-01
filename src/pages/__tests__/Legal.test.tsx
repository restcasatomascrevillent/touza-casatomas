import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import React from "react";

// ---------------------------------------------------------------------------
// Mocks (mismo patrón que Contacto.test.tsx)
// ---------------------------------------------------------------------------

vi.mock("@/integrations/supabase/client", () => ({
  supabase: { from: vi.fn() },
}));

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
        React.forwardRef<HTMLElement, { children?: React.ReactNode } & Record<string, unknown>>(
          ({ children, ...props }, ref) => React.createElement(tag, { ...props, ref }, children as React.ReactNode),
        ),
    }
  ),
  AnimatePresence: ({ children }: { children: React.ReactNode }) =>
    React.createElement(React.Fragment, null, children),
}));

import { routes } from "../../App";
import AvisoLegal from "../AvisoLegal";
import Privacidad from "../Privacidad";
import Cookies from "../Cookies";
import CookieConsent from "@/components/CookieConsent";
import AvisoProteccionDatos from "@/components/legal/AvisoProteccionDatos";
import { TITULAR } from "@/lib/legal";

// Router de datos (como el de vite-react-ssg): el aviso de cookies lee los
// `handle` de la ruta con useMatches para saber si hay barra en el móvil.
const enRouter = (el: React.ReactElement) =>
  render(React.createElement(RouterProvider, { router: createMemoryRouter([{ path: "*", element: el }]) }));

beforeEach(() => localStorage.clear());

describe("Textos legales — rutas", () => {
  it("App declara /aviso-legal, /privacidad y /cookies (las prerenderiza el SSG)", () => {
    const hijas = routes[0].children?.map((r) => r.path) ?? [];
    expect(hijas).toEqual(expect.arrayContaining(["aviso-legal", "privacidad", "cookies"]));
  });
});

describe("Aviso legal", () => {
  it("identifica al titular con denominación, CIF y domicilio", () => {
    enRouter(React.createElement(AvisoLegal));
    expect(screen.getByRole("heading", { level: 1, name: "Aviso legal" })).toBeInTheDocument();
    expect(screen.getByText(TITULAR.denominacion)).toBeInTheDocument();
    expect(screen.getByText(TITULAR.cif)).toBeInTheDocument();
    expect(screen.getByText(TITULAR.domicilio)).toBeInTheDocument();
  });

  it("señala de forma visible el dato registral que falta (no se inventa)", () => {
    enRouter(React.createElement(AvisoLegal));
    expect(screen.getByText(/PENDIENTES\]/)).toBeInTheDocument();
  });
});

describe("Política de privacidad", () => {
  it("cubre el formulario de El Reservado, la base legal, los derechos y la AEPD", () => {
    enRouter(React.createElement(Privacidad));
    expect(screen.getByRole("heading", { level: 1, name: "Política de privacidad" })).toBeInTheDocument();
    expect(screen.getByText(/Si nos envías una solicitud de El Reservado/)).toBeInTheDocument();
    expect(screen.getByText(/medidas precontractuales a petición tuya \(art\. 6\.1\.b\)/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "www.aepd.es" })).toHaveAttribute("href", "https://www.aepd.es");
    for (const proveedor of ["Supabase, Inc.", "Vercel, Inc.", "Resend"]) {
      expect(screen.getByText(proveedor)).toBeInTheDocument();
    }
  });
});

describe("Política de cookies", () => {
  it("lista la clave real de localStorage y Google Maps", () => {
    enRouter(React.createElement(Cookies));
    expect(screen.getByText("touza_cookie_consent")).toBeInTheDocument();
    expect(screen.getByText("Google Maps (Google Ireland Ltd.)")).toBeInTheDocument();
  });

  it("«Configurar cookies» borra la elección y vuelve a abrir el aviso", () => {
    localStorage.setItem("touza_cookie_consent", "accepted");
    enRouter(
      React.createElement(
        React.Fragment,
        null,
        React.createElement(Cookies),
        React.createElement(CookieConsent),
      ),
    );
    expect(screen.queryByRole("region", { name: "Aviso de cookies" })).not.toBeInTheDocument();
    expect(screen.getByText(/Has aceptado/)).toBeInTheDocument();

    act(() => {
      fireEvent.click(screen.getByRole("button", { name: "Configurar cookies" }));
    });

    expect(localStorage.getItem("touza_cookie_consent")).toBeNull();
    expect(screen.getByRole("region", { name: "Aviso de cookies" })).toBeInTheDocument();
    expect(screen.getByText(/Todavía no has elegido/)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Rechazar" }));
    expect(localStorage.getItem("touza_cookie_consent")).toBe("rejected");
    expect(screen.getByText(/Has rechazado/)).toBeInTheDocument();
  });
});

describe("Aviso de cookies", () => {
  it("Aceptar y Rechazar tienen el mismo peso visual y nada va premarcado", () => {
    enRouter(React.createElement(CookieConsent));
    const aviso = screen.getByRole("region", { name: "Aviso de cookies" });
    expect(aviso).toHaveAccessibleDescription(/Cookies del mapa de Google/);
    const aceptar = screen.getByRole("button", { name: "Aceptar" });
    const rechazar = screen.getByRole("button", { name: "Rechazar" });
    expect(aceptar.className).toBe(rechazar.className);
    expect(aviso.querySelector("input")).toBeNull();
  });

  it("publica su alto para el hero mientras está abierto y lo retira al responder", () => {
    enRouter(React.createElement(CookieConsent));
    expect(document.documentElement.style.getPropertyValue("--aviso-cookies")).toMatch(/px$/);
    fireEvent.click(screen.getByRole("button", { name: "Aceptar" }));
    expect(localStorage.getItem("touza_cookie_consent")).toBe("accepted");
    expect(document.documentElement.style.getPropertyValue("--aviso-cookies")).toBe("");
  });

  it("reabierto desde «Configurar cookies» toma el foco y lo devuelve al responder", () => {
    localStorage.setItem("touza_cookie_consent", "rejected");
    enRouter(
      React.createElement(
        React.Fragment,
        null,
        React.createElement(Cookies),
        React.createElement(CookieConsent),
      ),
    );
    const configurar = screen.getByRole("button", { name: "Configurar cookies" });
    configurar.focus();
    act(() => {
      fireEvent.click(configurar);
    });
    expect(screen.getByRole("button", { name: "Aceptar" })).toHaveFocus();

    fireEvent.click(screen.getByRole("button", { name: "Aceptar" }));
    expect(configurar).toHaveFocus();
  });
});

describe("Enlaces a los textos legales", () => {
  it("el aviso de cookies enlaza «Más información» a /cookies", () => {
    enRouter(React.createElement(CookieConsent));
    expect(screen.getByRole("link", { name: "Más información" })).toHaveAttribute("href", "/cookies");
  });

  it("la información básica de protección de datos enlaza a /privacidad", () => {
    enRouter(React.createElement(AvisoProteccionDatos, { finalidad: "gestionar tu solicitud." }));
    expect(screen.getByText(TITULAR.denominacion, { exact: false })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /política de privacidad/i })).toHaveAttribute("href", "/privacidad");
  });
});
