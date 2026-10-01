/**
 * OptimizedImage con fotos que vienen de Supabase (`Cocteles.imagen_url`):
 * pueden faltar (NULL → "") o estar caídas (Unsplash 404), y en el HTML del
 * SSG el navegador puede terminar de cargarlas —o de fallar— ANTES de que
 * React hidrate, con lo que `onLoad`/`onError` no llegan nunca.
 */
import { afterEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { OptimizedImage } from "@/components/ui/optimized-image";

/** Simula una <img> que ya terminó (bien o mal) antes de montar React. */
function simularImagenTerminada(naturalWidth: number): () => void {
  const proto = HTMLImageElement.prototype;
  const completeOriginal = Object.getOwnPropertyDescriptor(proto, "complete");
  const anchoOriginal = Object.getOwnPropertyDescriptor(proto, "naturalWidth");
  Object.defineProperty(proto, "complete", { configurable: true, get: () => true });
  Object.defineProperty(proto, "naturalWidth", { configurable: true, get: () => naturalWidth });
  return () => {
    if (completeOriginal) Object.defineProperty(proto, "complete", completeOriginal);
    else delete (proto as unknown as Record<string, unknown>).complete;
    if (anchoOriginal) Object.defineProperty(proto, "naturalWidth", anchoOriginal);
    else delete (proto as unknown as Record<string, unknown>).naturalWidth;
  };
}

describe("OptimizedImage (fotos de Supabase)", () => {
  let restaurar: (() => void) | null = null;
  afterEach(() => {
    restaurar?.();
    restaurar = null;
  });

  it("sin URL (imagen_url NULL) pinta el relleno de marca y no un <img src=''>", () => {
    const { container } = render(<OptimizedImage src="" alt="Clover Club" />);
    expect(container.querySelector("img")).toBeNull();
    expect(screen.getByRole("img", { name: "Clover Club" })).toHaveTextContent("TOUZA");
  });

  it("una foto que ya falló antes de hidratar acaba en el relleno, no en un skeleton eterno", () => {
    restaurar = simularImagenTerminada(0);
    const { container } = render(<OptimizedImage src="https://images.unsplash.com/rota" alt="Clover Club" />);
    expect(container.querySelector("img")).toBeNull();
    expect(screen.getByRole("img", { name: "Clover Club" })).toHaveTextContent("TOUZA");
  });

  it("una foto que ya cargó antes de hidratar se ve (sin opacity-0 ni skeleton)", () => {
    restaurar = simularImagenTerminada(600);
    const { container } = render(<OptimizedImage src="https://example.com/ok.jpg" alt="Mojito" />);
    const img = screen.getByRole("img", { name: "Mojito" });
    expect(img).toHaveClass("opacity-100");
    expect(container.querySelector(".animate-pulse")).toBeNull();
  });
});
