import { describe, expect, it } from "vitest";
import { copasPorBotella } from "../copas";

const botellas = [
  { id: "lc", name: "Laurent‑Perrier La Cuvée" },
  { id: "lr", name: "Laurent‑Perrier Rosé" },
  { id: "lrm", name: "Laurent‑Perrier Rosé Magnum" },
  { id: "lm", name: "Laurent‑Perrier Millésimé 2015" },
  { id: "lu", name: "Laurent‑Perrier Ultra Brut" },
];

describe("copasPorBotella", () => {
  it("casa cada copa con su botella: idéntica, por prefijo único o por alias", () => {
    const { precioPorBotella, sinBotella } = copasPorBotella(
      [
        { nombre: "Copa Champagne Laurent-Perrier", precio: "13,50 €" },
        { nombre: "Copa Champagne Laurent-Perrier Rosé", precio: "25 €" },
        { nombre: "Copa Champagne Laurent-Perrier Millésime", precio: "28 €" },
        { nombre: "Copa Champagne Laurent-Perrier Ultra Brut", precio: "25 €" },
      ],
      botellas,
    );
    expect(Object.fromEntries(precioPorBotella)).toEqual({ lc: "13,50 €", lr: "25 €", lm: "28 €", lu: "25 €" });
    expect(sinBotella).toEqual([]);
  });

  it("las copas sin botella en la carta se devuelven aparte", () => {
    const { precioPorBotella, sinBotella } = copasPorBotella(
      [{ nombre: "Copa Cava Edone", precio: "5 €" }],
      botellas,
    );
    expect(precioPorBotella.size).toBe(0);
    expect(sinBotella).toEqual(["Copa Cava Edone"]);
  });
});
