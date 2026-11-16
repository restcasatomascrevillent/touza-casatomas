/**
 * El único vídeo de la portada (la trasbarra, en «El local»): en el HTML del
 * SSG solo hay su póster, diferido, y nunca un <video>.
 */
import { describe, it, expect } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { render, screen } from "@testing-library/react";
import React from "react";
import VideoAmbiente from "@/components/home/VideoAmbiente";

describe("VideoAmbiente («El local»)", () => {
  const props = {
    clip: { mp4: "/l/v.mp4", poster: "/l/v.webp" },
    medidas: { width: 1080, height: 1920 },
    alternativo: {
      clip: { mp4: "/l/h.mp4", poster: "/l/h.webp" },
      media: "(min-width: 768px)",
      medidas: { width: 1920, height: 1080 },
    },
    alt: "La trasbarra",
    etiquetaPausa: "Pausar el vídeo de la trasbarra",
  };

  it("en el HTML estático: el póster vertical y, desde md, el horizontal; diferido y sin <video>", () => {
    const html = renderToStaticMarkup(React.createElement(VideoAmbiente, props));
    expect(html).toContain('media="(min-width: 768px)"');
    expect(html).toContain('srcSet="/l/h.webp"');
    expect(html).toContain('src="/l/v.webp"');
    expect(html).toContain('loading="lazy"');
    expect(html).not.toContain("fetchpriority");
    expect(html).not.toContain("<video");
  });

  it("en el navegador, el vídeo no se crea hasta acercarse", () => {
    render(React.createElement(VideoAmbiente, props));
    expect(screen.getByRole("img", { name: "La trasbarra" })).toBeInTheDocument();
    expect(document.querySelector("video")).toBeNull();
  });
});
