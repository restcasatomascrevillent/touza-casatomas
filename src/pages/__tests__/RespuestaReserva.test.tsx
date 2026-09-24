/**
 * Página /reserva/respuesta (enlaces de los correos de reserva de El
 * Reservado) y su contrato con la Edge Function emails-reserva.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import {
  ENLACE_CONSULTAR_URL,
  ENLACE_EJECUTAR_URL,
  llamarEnlace,
  normalizarRespuesta,
  textosEstado,
  type RespuestaEnlace,
} from "@/lib/respuesta-reserva";

vi.mock("@/components/Seo", () => ({ default: () => null }));

const respuesta = (over: Partial<RespuestaEnlace> = {}): RespuestaEnlace => ({
  ok: true,
  estado: "pendiente",
  tipo: "propuesta",
  accion: "rechazar",
  negocio: { marca: "touza", nombre: "Touza", telefonoTexto: "966 782 000", telefonoDigits: "966782000", web: "https://t" },
  detalles: { nombre: "Luis", fecha: "2026-10-10", hora: "20:00", comensales: 12, espacio: "El Reservado" },
  ...over,
});

const json = (body: unknown) => new Response(JSON.stringify(body), { status: 200, headers: { "Content-Type": "application/json" } });

describe("lib respuesta-reserva (Touza)", () => {
  it("llama a emails-reserva por POST JSON", async () => {
    const f = vi.fn().mockImplementation(async () => json(respuesta()));
    await llamarEnlace("consultar", "tok", f);
    expect(f.mock.calls[0][0]).toBe(ENLACE_CONSULTAR_URL);
    expect(f.mock.calls[0][1]).toMatchObject({ method: "POST", body: JSON.stringify({ token: "tok" }) });
  });

  it("valida el contrato y usa el nombre del negocio en los textos", () => {
    expect(normalizarRespuesta({ estado: "x" })).toBeNull();
    expect(textosEstado(respuesta({ estado: "hecho", accion: "aceptar" }), "Touza").parrafos[0]).toContain("Touza");
  });
});

describe("<RespuestaReserva />", () => {
  const original = window.location;
  beforeEach(() => {
    Object.defineProperty(window, "location", { configurable: true, value: { ...original, search: "?token=tok" } });
  });
  afterEach(() => {
    Object.defineProperty(window, "location", { configurable: true, value: original });
    vi.unstubAllGlobals();
  });

  it("rechazo en dos pasos con el teléfono de Touza", async () => {
    const f = vi
      .fn()
      .mockResolvedValueOnce(json(respuesta()))
      .mockResolvedValueOnce(json(respuesta({ estado: "hecho" })));
    vi.stubGlobal("fetch", f);
    const { default: RespuestaReserva } = await import("@/pages/RespuestaReserva");
    render(
      <MemoryRouter>
        <RespuestaReserva />
      </MemoryRouter>,
    );

    expect(await screen.findByRole("heading", { name: "¿No te viene bien esta propuesta?" })).toBeInTheDocument();
    expect(screen.getByText("El Reservado")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /966 782 000/ })).toHaveAttribute("href", "tel:+34966782000");
    expect(f).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole("button", { name: "Sí, rechazar la propuesta" }));
    expect(await screen.findByRole("heading", { name: "Gracias por avisarnos" })).toBeInTheDocument();
    expect(f.mock.calls[1][0]).toBe(ENLACE_EJECUTAR_URL);
  });
});
