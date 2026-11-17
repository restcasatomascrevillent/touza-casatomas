import { describe, it, expect, vi, afterEach } from "vitest";
import { act, render } from "@testing-library/react";
import Reveal from "@/components/Reveal";

/** Caja falsa del elemento (jsdom no maqueta). */
function caja(top: number, height: number) {
  return { top, bottom: top + height, height, left: 0, right: 100, width: 100, x: 0, y: top, toJSON: () => ({}) } as DOMRect;
}

describe("Reveal efecto=destapar", () => {
  // Solo el espía de cada test: el requestAnimationFrame de setup.ts se queda.
  let rect: ReturnType<typeof vi.spyOn>;
  afterEach(() => {
    rect.mockRestore();
    vi.useRealTimers();
  });

  // 16/11/2026: en Chrome, el IntersectionObserver mide el elemento con su
  // propio clip-path (inset(100%) mientras está pendiente) y no avisaba si se
  // llegaba con el borde de arriba ya fuera de la pantalla: el marco de
  // «El local» se quedaba tapado (≈700 px de negro en escritorio).
  it("se destapa al llegar de un salto, con el borde de arriba ya por encima de la pantalla", () => {
    vi.useFakeTimers();
    rect = vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockReturnValue(caja(3000, 774));
    const { container } = render(
      <Reveal efecto="destapar">
        <img alt="" className="foto-asienta" />
      </Reveal>
    );
    const marco = container.firstElementChild as HTMLElement;
    expect(marco.dataset.reveal).toBe("pendiente");

    // Salto: el marco ocupa la mitad de arriba de la pantalla, empezando 116 px por encima.
    rect.mockReturnValue(caja(-116, 774));
    act(() => {
      window.dispatchEvent(new Event("scroll"));
      vi.advanceTimersByTime(20);
    });
    expect(marco.dataset.reveal).toBe("visto");
  });

  it("no se destapa mientras sigue entero por encima o por debajo de la pantalla", () => {
    vi.useFakeTimers();
    rect = vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockReturnValue(caja(3000, 774));
    const { container } = render(
      <Reveal efecto="destapar">
        <img alt="" />
      </Reveal>
    );
    const marco = container.firstElementChild as HTMLElement;
    for (const top of [-900, window.innerHeight]) {
      rect.mockReturnValue(caja(top, 774));
      act(() => {
        window.dispatchEvent(new Event("scroll"));
        vi.advanceTimersByTime(20);
      });
      expect(marco.dataset.reveal).toBe("pendiente");
    }
  });
});
