/**
 * Datos de la portada: frases de horario generadas desde NEGOCIO
 * (components/home/hechos.ts), el clip de «El local» (medios.ts) y qué
 * cócteles salen en «La carta» (`elegirCoctelesPortada`, lib/carta.ts).
 */
import { describe, it, expect } from "vitest";
import { fraseHorario, filasHorario, hastaLaHora, lineaDeHechos, nombreDias } from "@/components/home/hechos";
import { CLIP_EL_LOCAL } from "@/components/home/medios";
import { cuantosCaben, elegirCoctelesPortada as elegirCocteles } from "@/lib/carta";
import type { CoctelUI } from "@/hooks/useCocteles";

describe("hechos de la portada", () => {
  it("frase de horario desde NEGOCIO: días y hora de cierre", () => {
    expect(fraseHorario()).toBe("Abrimos el jueves hasta la 1:00, el viernes y sábado hasta las 2:00 y el domingo hasta las 20:00.");
    expect(lineaDeHechos()).toBe(
      "Abrimos el jueves hasta la 1:00, el viernes y sábado hasta las 2:00 y el domingo hasta las 20:00. Sin reservas: ven directamente."
    );
  });

  it("filas de la tabla de horario", () => {
    expect(filasHorario()).toEqual([
      { dias: "Jueves", horas: "16:00 – 01:00" },
      { dias: "Viernes", horas: "15:30 – 02:00" },
      { dias: "Sábado", horas: "15:00 – 02:00" },
      { dias: "Domingo", horas: "15:00 – 20:00" },
    ]);
  });

  it("días y horas en castellano", () => {
    expect(nombreDias(["Friday", "Saturday"])).toBe("viernes y sábado");
    expect(nombreDias(["Monday", "Wednesday", "Friday"])).toBe("lunes, miércoles y viernes");
    expect(hastaLaHora("01:30")).toBe("hasta la 1:30");
    expect(hastaLaHora("23:00")).toBe("hasta las 23:00");
    expect(
      fraseHorario([
        { dias: ["Friday", "Saturday"], abre: "21:00", cierra: "03:00" },
      ] as never)
    ).toBe("Abrimos el viernes y sábado hasta las 3:00.");
  });
});

describe("el clip de «El local»", () => {
  it("la trasbarra en vertical y en horizontal, con MP4 y póster", () => {
    for (const fuentes of Object.values(CLIP_EL_LOCAL)) {
      expect(fuentes.mp4).toBeTruthy();
      expect(fuentes.poster).toBeTruthy();
    }
  });
});

describe("cócteles de «La carta» en la portada", () => {
  const coctel = (name: string, extra: Partial<CoctelUI> = {}): CoctelUI => ({
    id: name,
    name,
    category: "autor",
    base: "all",
    price: "9 €",
    description: "",
    ingredients: [],
    image: `https://sfonaclosuafvlhutkon.supabase.co/storage/v1/object/public/cocteles/${name}.webp`,
    alergenos: [],
    alergenosNota: null,
    ...extra,
  });

  it("solo los que tienen foto propia: la genérica de la «T» no cuenta", () => {
    const elegidos = elegirCocteles([
      coctel("Mojito"),
      coctel("Sin foto", { image: "/assets/touza-logo-640.webp", fotoGenerica: true }),
      coctel("Aperol Spritz"),
    ]);
    expect(elegidos.map((c) => c.name)).toEqual(["Mojito", "Aperol Spritz"]);
  });

  it("como mucho ocho, y siempre filas enteras (8, 6 o 4)", () => {
    expect(cuantosCaben(12)).toBe(8);
    expect(cuantosCaben(8)).toBe(8);
    expect(cuantosCaben(7)).toBe(6);
    expect(cuantosCaben(5)).toBe(4);
    expect(cuantosCaben(3)).toBe(3);
    expect(cuantosCaben(0)).toBe(0);
    const doce = Array.from({ length: 12 }, (_, i) => coctel(`Cóctel ${i}`));
    expect(elegirCocteles(doce)).toHaveLength(8);
    expect(elegirCocteles(doce)[0].name).toBe("Cóctel 0");
  });
});
