/**
 * Vídeos de la portada: en el HTML del SSG solo hay imágenes (el póster del
 * hero con prioridad alta, los pósters de la franja) y nunca un <video>.
 */
import { describe, it, expect, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { render, screen } from "@testing-library/react";
import React from "react";
import type { Clip } from "@/components/home/medios";

vi.mock("@/components/home/medios", async (original) => ({
  ...(await original<typeof import("@/components/home/medios")>()),
  VIDEO_HERO: { webm: "/v/bucle.webm", mp4: "/v/bucle.mp4", poster: "/v/poster.webp" },
  HERO_CON_FOTO_INTERIOR: false,
}));

const { default: HeroVideo } = await import("@/components/home/HeroVideo");
const { default: FranjaClips } = await import("@/components/home/FranjaClips");
const { default: VideoAmbiente } = await import("@/components/home/VideoAmbiente");

const clips: Clip[] = [
  { id: "01-clover-club", nombre: "Clover Club", webm: "/c/01.webm", mp4: "/c/01.mp4", poster: "/c/01.webp", origen: "barra" },
  { id: "02-moscow-mule", nombre: "Moscow Mule", mp4: "/c/02.mp4", poster: "/c/02.webp", origen: "barra" },
];

describe("HeroVideo", () => {
  it("en el HTML estático: el póster con fetchpriority alto y sin <video>", () => {
    const html = renderToStaticMarkup(React.createElement(HeroVideo));
    expect(html).toContain('src="/v/poster.webp"');
    expect(html).toContain('fetchpriority="high"');
    expect(html).not.toContain("<video");
    expect(html).not.toContain("opacity-0");
  });
});

describe("FranjaClips", () => {
  it("sin clips no pinta nada", () => {
    const { container } = render(React.createElement(FranjaClips, { clips: [] }));
    expect(container).toBeEmptyDOMElement();
  });

  it("en el HTML estático: los pósters con su nombre y ningún <video>", () => {
    const html = renderToStaticMarkup(React.createElement(FranjaClips, { clips }));
    expect(html).toContain('src="/c/01.webp"');
    expect(html).toContain("Clover Club");
    expect(html).toContain("Moscow Mule");
    expect(html).not.toContain("<video");
  });

  it("en el navegador, los vídeos no se crean hasta acercarse a ellos", () => {
    render(React.createElement(FranjaClips, { clips }));
    expect(screen.getByRole("heading", { level: 2, name: "En la barra" })).toBeInTheDocument();
    expect(screen.getAllByRole("figure")).toHaveLength(2);
    expect(document.querySelector("video")).toBeNull();
    expect(screen.getByRole("button", { name: "Pausar los vídeos" })).toBeInTheDocument();
  });
});

describe("VideoAmbiente («El local»)", () => {
  const props = {
    clip: { webm: "/l/v.webm", mp4: "/l/v.mp4", poster: "/l/v.webp" },
    medidas: { width: 406, height: 720 },
    alternativo: {
      clip: { webm: "/l/h.webm", mp4: "/l/h.mp4", poster: "/l/h.webp" },
      media: "(min-width: 768px) and (orientation: landscape)",
      medidas: { width: 1280, height: 720 },
    },
    alt: "Las vitrinas",
    etiquetaPausa: "Pausar el vídeo de las vitrinas",
  };

  it("en el HTML estático: el póster vertical y, para pantallas anchas, el horizontal; diferido y sin <video>", () => {
    const html = renderToStaticMarkup(React.createElement(VideoAmbiente, props));
    expect(html).toContain('media="(min-width: 768px) and (orientation: landscape)"');
    expect(html).toContain('srcSet="/l/h.webp"');
    expect(html).toContain('src="/l/v.webp"');
    expect(html).toContain('loading="lazy"');
    expect(html).not.toContain("fetchpriority");
    expect(html).not.toContain("<video");
  });

  it("en el navegador, el vídeo no se crea hasta acercarse", () => {
    render(React.createElement(VideoAmbiente, props));
    expect(screen.getByRole("img", { name: "Las vitrinas" })).toBeInTheDocument();
    expect(document.querySelector("video")).toBeNull();
  });
});

describe("FranjaClips en una página interior", () => {
  it("con su título y el texto alternativo de cada clip", () => {
    const delLocal: Clip[] = [
      { id: "barra-botellas", nombre: "La trasbarra", alt: "La trasbarra de Touza", mp4: "/l/b.mp4", poster: "/l/b.webp", origen: "local" },
    ];
    render(React.createElement(FranjaClips, { clips: delLocal, titulo: "Dentro de Touza", id: "dentro-titulo", estilo: "pagina" }));
    expect(screen.getByRole("heading", { level: 2, name: "Dentro de Touza" })).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "La trasbarra de Touza" })).toBeInTheDocument();
    expect(screen.getByText("La trasbarra")).toBeInTheDocument();
  });
});
