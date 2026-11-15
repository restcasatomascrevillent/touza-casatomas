import { formatearPrecio, importe } from "@/lib/precio";

describe("formatearPrecio", () => {
  it("sin decimales si es entero y con dos si no, con espacio no separable antes del €", () => {
    expect(formatearPrecio(9)).toBe("9\u00A0€");
    expect(formatearPrecio(78)).toBe("78\u00A0€");
    expect(formatearPrecio(8.5)).toBe("8,50\u00A0€");
    expect(formatearPrecio(12.95)).toBe("12,95\u00A0€");
    expect(formatearPrecio(1200)).toBe("1200\u00A0€");
  });

  it("vacío sin precio", () => {
    expect(formatearPrecio(null)).toBe("");
    expect(formatearPrecio(undefined)).toBe("");
    expect(formatearPrecio(0)).toBe("");
    expect(formatearPrecio(Number.NaN)).toBe("");
  });

  it("importe: el número solo, para rangos («de 7 a 10 €»)", () => {
    expect(importe(7)).toBe("7");
    expect(importe(8.5)).toBe("8,50");
  });
});
