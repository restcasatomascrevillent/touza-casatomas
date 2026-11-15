import { readFileSync } from "node:fs";
import path from "node:path";
import {
  ANCHOS_FOTO,
  CALIDAD_FOTO,
  FOTO_BOTELLA,
  FOTO_DETALLE,
  FOTO_SOBREMESA,
  FOTO_TARJETA,
  HOSTS_FOTOS,
  OPTIMIZAR_FOTOS,
  anchoPermitido,
  esFotoOptimizable,
  fotoResponsive,
  urlFoto,
  volverAFotoOriginal,
} from "@/lib/foto";

const DEMO = "https://sfonaclosuafvlhutkon.supabase.co/storage/v1/object/public/vinos/krug-grande.webp?t=1731600000";
const PROD = "https://haqmmdfdzzatdnrrcgez.supabase.co/storage/v1/object/public/cocteles/clover-club.webp";
const LOCAL = "/assets/touza-logo-640-abc123.webp";

const vercel = JSON.parse(readFileSync(path.resolve(__dirname, "../../../vercel.json"), "utf8")) as {
  images: {
    sizes: number[];
    qualities: number[];
    formats: string[];
    minimumCacheTTL: number;
    remotePatterns: { protocol: string; hostname: string; pathname: string }[];
  };
};

const parametros = (url: string) => new URL(url, "https://touza.test").searchParams;

describe("urlFoto", () => {
  it("pasa por /_vercel/image las fotos de Supabase de demo y de producción", () => {
    for (const original of [DEMO, PROD]) {
      const url = urlFoto(original, 128, { optimizar: true });
      expect(url.startsWith("/_vercel/image?")).toBe(true);
      const p = parametros(url);
      expect(p.get("url")).toBe(original); // con su ?t= intacto
      expect(p.get("w")).toBe("128");
      expect(p.get("q")).toBe(String(CALIDAD_FOTO));
    }
  });

  it("redondea el ancho hacia arriba a uno de la lista (o al mayor)", () => {
    expect(anchoPermitido(60)).toBe(96);
    expect(anchoPermitido(136)).toBe(192);
    expect(anchoPermitido(256)).toBe(256);
    expect(anchoPermitido(5000)).toBe(1080);
    expect(parametros(urlFoto(DEMO, 136, { optimizar: true })).get("w")).toBe("192");
  });

  it("devuelve tal cual las fotos que no son de Supabase y las de otros proyectos", () => {
    const otras = [
      LOCAL,
      "https://images.unsplash.com/photo-123?w=800",
      "https://jeamoczmbfsnwkfjxcyo.supabase.co/storage/v1/object/public/vinos/a.webp",
      "https://sfonaclosuafvlhutkon.supabase.co/storage/v1/object/sign/vinos/a.webp?token=x",
      "http://sfonaclosuafvlhutkon.supabase.co/storage/v1/object/public/vinos/a.webp",
      "",
    ];
    for (const url of otras) expect(urlFoto(url, 256, { optimizar: true })).toBe(url);
  });

  it("fuera de Vercel (dev, preview, tests) devuelve la URL original", () => {
    expect(OPTIMIZAR_FOTOS).toBe(false);
    expect(urlFoto(DEMO, 256)).toBe(DEMO);
    expect(urlFoto(DEMO, 256, { optimizar: false })).toBe(DEMO);
  });
});

describe("fotoResponsive", () => {
  it("da un candidato por ancho, ordenados, y el mayor como src", () => {
    const foto = fotoResponsive(DEMO, [256, 128, 96, 192], FOTO_BOTELLA.sizes, { optimizar: true });
    const candidatos = foto.srcSet!.split(", ").map((c) => c.split(" "));
    expect(candidatos.map(([, w]) => w)).toEqual(["96w", "128w", "192w", "256w"]);
    for (const [url, w] of candidatos) expect(parametros(url).get("w")).toBe(w.replace("w", ""));
    expect(parametros(foto.src).get("w")).toBe("256");
    expect(foto.sizes).toBe(FOTO_BOTELLA.sizes);
  });

  it("sin optimizar o con fotos locales, solo src (sin srcset que el navegador no pueda servir)", () => {
    expect(fotoResponsive(DEMO, FOTO_TARJETA.anchos, FOTO_TARJETA.sizes)).toEqual({ src: DEMO });
    expect(fotoResponsive(LOCAL, FOTO_TARJETA.anchos, FOTO_TARJETA.sizes, { optimizar: true })).toEqual({ src: LOCAL });
  });
});

describe("vercel.json (images)", () => {
  it("los anchos y la calidad coinciden con los de urlFoto: si no, Vercel responde 400", () => {
    expect(vercel.images.sizes).toEqual([...ANCHOS_FOTO]);
    expect(vercel.images.qualities).toEqual([CALIDAD_FOTO]);
  });

  it("todos los anchos que piden las fotos están permitidos", () => {
    for (const uso of [FOTO_BOTELLA, FOTO_TARJETA, FOTO_SOBREMESA, FOTO_DETALLE]) {
      for (const ancho of uso.anchos) expect(vercel.images.sizes).toContain(ancho);
    }
  });

  it("admite los dos Supabase (demo y producción) solo en la ruta pública de Storage", () => {
    expect(vercel.images.remotePatterns).toHaveLength(HOSTS_FOTOS.length);
    for (const host of HOSTS_FOTOS) {
      const patron = vercel.images.remotePatterns.find((p) => new RegExp(p.hostname).test(host));
      expect(patron).toBeDefined();
      expect(patron!.protocol).toBe("https");
      expect(new RegExp(patron!.pathname).test("/storage/v1/object/public/vinos/a.webp")).toBe(true);
      expect(new RegExp(patron!.pathname).test("/storage/v1/object/sign/vinos/a.webp")).toBe(false);
    }
    expect(vercel.images.remotePatterns.some((p) => new RegExp(p.hostname).test("jeamoczmbfsnwkfjxcyo.supabase.co"))).toBe(
      false,
    );
  });

  it("AVIF y WebP, con caché larga", () => {
    expect(vercel.images.formats).toEqual(["image/avif", "image/webp"]);
    expect(vercel.images.minimumCacheTTL).toBeGreaterThanOrEqual(60 * 60 * 24 * 30);
  });
});

describe("volverAFotoOriginal", () => {
  it("si falla /_vercel/image, quita el srcset y pide la original una sola vez", () => {
    const img = document.createElement("img");
    const foto = fotoResponsive(DEMO, FOTO_BOTELLA.anchos, FOTO_BOTELLA.sizes, { optimizar: true });
    img.setAttribute("src", foto.src);
    img.setAttribute("srcset", foto.srcSet!);
    img.setAttribute("sizes", foto.sizes!);

    expect(volverAFotoOriginal(img, DEMO)).toBe(true);
    expect(img.getAttribute("src")).toBe(DEMO);
    expect(img.hasAttribute("srcset")).toBe(false);
    expect(img.hasAttribute("sizes")).toBe(false);
    // Si también falla la original, el error ya es definitivo.
    expect(volverAFotoOriginal(img, DEMO)).toBe(false);
  });

  it("con la URL original no hay nada que reintentar", () => {
    const img = document.createElement("img");
    img.setAttribute("src", DEMO);
    expect(volverAFotoOriginal(img, DEMO)).toBe(false);
    expect(volverAFotoOriginal(img, undefined)).toBe(false);
  });
});
