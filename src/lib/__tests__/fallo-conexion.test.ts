/**
 * Clasificación del fallo de red (`src/lib/supabase-functions.ts`) y los textos
 * que salen de ella en la página de respuesta (`src/lib/respuesta-reserva.ts`).
 *
 * El bug que estos tests vigilan: la Edge Function `reservas-web` se desplegó
 * muerta, el worker devolvía 500 incluso en el `OPTIONS` de preflight, el
 * navegador lo enseñó como error de CORS (`fetch` lanza `TypeError: Failed to
 * fetch`, sin `status`) y la web le decía al cliente "Comprueba tu conexión".
 * El cliente miraba su wifi, no veía nada raro y se iba a otro sitio. Con red
 * buena (`navigator.onLine === true`) ese fallo es NUESTRO, y así hay que
 * contarlo.
 */
import { describe, it, expect, afterEach } from "vitest";
import { clasificarFallo, estaEnLinea } from "@/lib/supabase-functions";
import { textosSinConexion } from "@/lib/respuesta-reserva";

/** Sustituye `navigator.onLine` y devuelve cómo restaurarlo. */
function forzarOnLine(valor: unknown): () => void {
  const original = Object.getOwnPropertyDescriptor(navigator, "onLine");
  Object.defineProperty(navigator, "onLine", { value: valor, configurable: true });
  return () => {
    if (original) Object.defineProperty(navigator, "onLine", original);
    else delete (navigator as unknown as Record<string, unknown>).onLine;
  };
}

let restaurar: (() => void) | null = null;
afterEach(() => {
  restaurar?.();
  restaurar = null;
});

describe("clasificarFallo", () => {
  it("con respuesta HTTP el fallo es NUESTRO, sea 5xx o incluso 2xx ilegible", () => {
    // Si han llegado bytes desde nuestro host, la red del visitante funciona
    // por definición: no hay nada que "comprobar" en su wifi.
    expect(clasificarFallo(500)).toBe("servidor");
    expect(clasificarFallo(200)).toBe("servidor");
  });

  it("status 0 con red buena es NUESTRO: es el caso exacto del bug (CORS / función caída)", () => {
    expect(clasificarFallo(0, true)).toBe("servidor");
  });

  it("status 0 sin red sí es del dispositivo", () => {
    expect(clasificarFallo(0, false)).toBe("sin_red");
  });

  it("status > 0 gana a `navigator.onLine`: aunque el navegador diga que no hay red, hubo respuesta", () => {
    expect(clasificarFallo(503, false)).toBe("servidor");
  });
});

describe("estaEnLinea", () => {
  it("devuelve true cuando `navigator.onLine` no es booleano (ante la duda, el fallo es nuestro)", () => {
    restaurar = forzarOnLine(undefined);
    expect(estaEnLinea()).toBe(true);
    // Y por tanto el fallo ambiguo se cuenta como nuestro, no como del cliente.
    expect(clasificarFallo(0)).toBe("servidor");
  });

  it("respeta el `false` del navegador, que es el único valor fiable", () => {
    restaurar = forzarOnLine(false);
    expect(estaEnLinea()).toBe(false);
    expect(clasificarFallo(0)).toBe("sin_red");
  });
});

describe("textosSinConexion", () => {
  it("cuando el fallo es nuestro asume la culpa y da el teléfono, sin mandar a nadie a mirar su wifi", () => {
    const { titulo, parrafos } = textosSinConexion("servidor", "consultar", "966 782 000");
    expect(titulo).toBe("No es cosa tuya: el fallo es nuestro");
    expect(parrafos.join(" ")).toContain("966 782 000");
    expect(parrafos.join(" ").toLowerCase()).not.toContain("comprueba tu conexión");
  });

  it("al ejecutar avisa de que la respuesta pudo llegar: reintentar es seguro", () => {
    const { parrafos } = textosSinConexion("servidor", "ejecutar", "966 782 000");
    expect(parrafos[0]).toContain("No sabemos si tu respuesta ha llegado");
    expect(parrafos.join(" ")).toContain("966 782 000");
  });

  it("sin red sí habla de la conexión del visitante, que es el único caso en que procede", () => {
    const { titulo, parrafos } = textosSinConexion("sin_red", "consultar", "966 782 000");
    expect(titulo).toBe("Parece que te has quedado sin conexión");
    expect(parrafos).toEqual(["En cuanto la recuperes, vuelve a intentarlo."]);
  });

  it("sin red + ejecutar: pide esperar a recuperarla antes de reintentar", () => {
    const { parrafos } = textosSinConexion("sin_red", "ejecutar", "966 782 000");
    expect(parrafos[0]).toContain("En cuanto recuperes la conexión");
  });
});
