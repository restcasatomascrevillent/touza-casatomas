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
