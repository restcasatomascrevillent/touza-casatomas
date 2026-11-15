/**
 * Datos de la portada: frases de horario generadas desde NEGOCIO y la lectura
 * de los vídeos de src/assets/videos (components/home/hechos.ts y medios.ts).
 */
import { describe, it, expect } from "vitest";
import { fraseHorario, filasHorario, hastaLaHora, lineaDeHechos, nombreDias } from "@/components/home/hechos";
import { agruparClips, nombreDeClip } from "@/components/home/medios";

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

describe("vídeos de la portada", () => {
  it("nombre legible del clip a partir del fichero", () => {
    expect(nombreDeClip("03-clover-club")).toBe("Clover Club");
    expect(nombreDeClip("05-gin-de-la-casa")).toBe("Gin de la Casa");
    expect(nombreDeClip("1_moscow_mule")).toBe("Moscow Mule");
  });

  it("agrupa webm, mp4 y póster por nombre, ordena por número y descarta los que no tienen vídeo", () => {
    const clips = agruparClips(
      {
        "../../assets/videos/clips/10-aperol.mp4": "/a/10.mp4",
        "../../assets/videos/clips/02-clover-club.webm": "/a/02.webm",
        "../../assets/videos/clips/02-clover-club.mp4": "/a/02.mp4",
        "../../assets/videos/clips/02-clover-club.webp": "/a/02.webp",
        "../../assets/videos/clips/05-solo-poster.webp": "/a/05.webp",
      },
      "barra"
    );
    expect(clips.map((c) => c.id)).toEqual(["02-clover-club", "10-aperol"]);
    expect(clips[0]).toMatchObject({ nombre: "Clover Club", webm: "/a/02.webm", mp4: "/a/02.mp4", poster: "/a/02.webp", origen: "barra" });
    expect(clips[1].poster).toBeUndefined();
  });
});
