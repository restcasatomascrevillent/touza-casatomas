import { describe, expect, it } from "vitest";
import { muestraBarraMovil } from "../barra-movil";

describe("muestraBarraMovil", () => {
  it("sale en las páginas de contenido", () => {
    for (const ruta of ["/", "/carta", "/galeria", "/aviso-legal", "/privacidad", "/cookies"]) {
      expect(muestraBarraMovil(ruta)).toBe(true);
    }
  });

  it("no sale donde ya se llama o se reserva, ni en las pantallas finales", () => {
    for (const ruta of ["/reservado", "/contacto", "/404", "/reserva/respuesta"]) {
      expect(muestraBarraMovil(ruta)).toBe(false);
    }
  });

  it("ignora la barra final de la URL", () => {
    expect(muestraBarraMovil("/reservado/")).toBe(false);
    expect(muestraBarraMovil("/carta/")).toBe(true);
  });
});
