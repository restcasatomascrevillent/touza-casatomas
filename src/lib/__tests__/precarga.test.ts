import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { _reiniciarPrecarga, precargarImagenes } from "@/lib/precarga";

/** Image falsa: apunta cada `src` pedido y deja terminar la carga a mano. */
const pedidas: { src: string; srcset: string; sizes: string; terminar: () => void }[] = [];
class ImagenFalsa {
  onload: (() => void) | null = null;
  onerror: (() => void) | null = null;
  decoding = "";
  fetchPriority = "";
  srcset = "";
  sizes = "";
  set src(valor: string) {
    pedidas.push({ src: valor, srcset: this.srcset, sizes: this.sizes, terminar: () => this.onload?.() });
  }
}

describe("precargarImagenes", () => {
  const original = globalThis.Image;
  beforeEach(() => {
    pedidas.length = 0;
    _reiniciarPrecarga();
    vi.stubGlobal("Image", ImagenFalsa);
  });
  afterEach(() => {
    vi.stubGlobal("Image", original);
  });

  it("pide en orden y de dos en dos", () => {
    precargarImagenes(["a", "b", "c", "d"]);
    expect(pedidas.map((p) => p.src)).toEqual(["a", "b"]);
    pedidas[0].terminar();
    expect(pedidas.map((p) => p.src)).toEqual(["a", "b", "c"]);
    pedidas[1].terminar();
    pedidas[2].terminar();
    expect(pedidas.map((p) => p.src)).toEqual(["a", "b", "c", "d"]);
  });

  it("cada URL una sola vez y sin vacíos", () => {
    precargarImagenes(["a", "", undefined, "a"]);
    precargarImagenes(["a"]);
    expect(pedidas.map((p) => p.src)).toEqual(["a"]);
  });

  it("con srcset y sizes, la precarga elige el mismo candidato que la <img> (no la original)", () => {
    precargarImagenes([{ src: "a-256", srcSet: "a-96 96w, a-256 256w", sizes: "60px" }, "b"]);
    expect(pedidas).toEqual([
      expect.objectContaining({ src: "a-256", srcset: "a-96 96w, a-256 256w", sizes: "60px" }),
      expect.objectContaining({ src: "b", srcset: "", sizes: "" }),
    ]);
  });

  it("`delante`: lo de la pestaña a la que se acerca el visitante pasa antes que la precarga «por si acaso»", () => {
    precargarImagenes(["a", "b", "c", "d"]);
    precargarImagenes(["x", "d"], { delante: true });
    pedidas[0].terminar();
    pedidas[1].terminar();
    expect(pedidas.map((p) => p.src)).toEqual(["a", "b", "x", "d"]);
  });
});
