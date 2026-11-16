/**
 * Hero de /carta: la copa que se llena sola. En el HTML del SSG solo va el
 * póster (la imagen prioritaria); el vídeo se añade en el navegador, arranca
 * solo, no hace bucle y deja la copa llena al terminar.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { fireEvent, render, screen } from "@testing-library/react";
import HeroCopa from "../HeroCopa";

const hero = (
  <HeroCopa alt="Una copa llenándose">
    <h1>Nuestra carta</h1>
  </HeroCopa>
);

const matchMediaDeSiempre = window.matchMedia;
/** Hace que se cumplan solo las media queries que contengan `texto`. */
function conMedia(texto: string) {
  window.matchMedia = ((query: string) => ({
    ...matchMediaDeSiempre(query),
    matches: query.includes(texto),
  })) as typeof window.matchMedia;
}

// `play` y `pause` son espías compartidos (src/test/setup.ts): a cero antes
// de cada test, porque el desmontaje del anterior también pausa.
beforeEach(() => {
  vi.mocked(window.HTMLMediaElement.prototype.play).mockClear();
  vi.mocked(window.HTMLMediaElement.prototype.pause).mockClear();
});

afterEach(() => {
  window.matchMedia = matchMediaDeSiempre;
  Reflect.deleteProperty(navigator, "connection");
});

describe("HeroCopa (hero de /carta)", () => {
  it("en el HTML estático: el póster con prioridad alta, el título y ningún <video>", () => {
    const html = renderToStaticMarkup(hero);
    expect(html).toContain('alt="Una copa llenándose"');
    expect(html).toContain('fetchpriority="high"');
    expect(html).not.toContain('loading="lazy"');
    expect(html).toContain('width="1920" height="1080"');
    expect(html).toContain("<h1>Nuestra carta</h1>");
    expect(html).not.toContain("<video");
    expect(html.match(/<img/g)).toHaveLength(1);
  });

  it("el <picture> elige por CSS: recorte vertical en pantallas verticales y la copa llena con «reducir movimiento»", () => {
    const html = renderToStaticMarkup(hero);
    expect(html).toMatch(/media="\(orientation: portrait\)" srcSet="[^"]*copa-vertical-inicio-1080\.avif 1080w"/);
    expect(html).toMatch(/media="\(prefers-reduced-motion: reduce\)" srcSet="[^"]*copa-horizontal-llena-/);
    expect(html).toMatch(/media="\(prefers-reduced-motion: reduce\) and \(orientation: portrait\)" srcSet="[^"]*copa-vertical-llena-/);
    expect(html).toMatch(/copa-horizontal-inicio-1280\.avif 1280w, [^"]*copa-horizontal-inicio-1920\.avif 1920w/);
  });

  it("en el navegador arranca solo: vídeo silenciado, sin bucle, con botón de pausa", () => {
    const { container } = render(hero);
    const video = container.querySelector("video") as HTMLVideoElement;
    expect(video).not.toBeNull();
    expect(video.getAttribute("src")).toContain("copa-horizontal.mp4");
    expect(video).toHaveAttribute("autoplay");
    expect(video).toHaveAttribute("playsinline");
    expect(video).toHaveAttribute("preload", "auto");
    expect(video).not.toHaveAttribute("loop");
    expect(video.muted).toBe(true);
    expect(video.play).toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "Pausar la animación de la copa" })).toBeInTheDocument();
  });

  it("en una pantalla vertical usa el recorte vertical", () => {
    conMedia("portrait");
    const { container } = render(hero);
    expect(container.querySelector("video")?.getAttribute("src")).toContain("copa-vertical.mp4");
  });

  it("el botón pausa y reanuda; al terminar queda la copa llena y el botón repite", () => {
    const { container } = render(hero);
    const video = container.querySelector("video") as HTMLVideoElement;
    const boton = screen.getByRole("button");
    // jsdom no reproduce: el estado del vídeo se pone a mano.
    const enPausa = (valor: boolean) => Object.defineProperty(video, "paused", { configurable: true, get: () => valor });

    enPausa(false);
    fireEvent.click(boton);
    expect(video.pause).toHaveBeenCalledTimes(1);
    enPausa(true);
    fireEvent.pause(video);
    expect(boton).toHaveAccessibleName("Reanudar la animación de la copa");

    vi.mocked(video.play).mockClear();
    fireEvent.click(boton);
    expect(video.play).toHaveBeenCalledTimes(1);
    enPausa(false);
    fireEvent.play(video);
    expect(boton).toHaveAccessibleName("Pausar la animación de la copa");

    expect(container.querySelectorAll("picture")).toHaveLength(1);
    fireEvent.ended(video);
    expect(boton).toHaveAccessibleName("Repetir la animación de la copa");
    const fotos = container.querySelectorAll("picture");
    expect(fotos).toHaveLength(2);
    expect(fotos[1].innerHTML).toContain("copa-horizontal-llena-");
    // La copa llena es decorativa: el texto alternativo ya lo da el póster.
    expect(screen.getAllByRole("img")).toHaveLength(1);

    fireEvent.click(boton);
    expect(container.querySelectorAll("picture")).toHaveLength(1);
    expect(boton).toHaveAccessibleName("Pausar la animación de la copa");
  });

  it("con «reducir movimiento» no hay vídeo ni botón: solo el póster", () => {
    conMedia("prefers-reduced-motion");
    const { container } = render(hero);
    expect(container.querySelector("video")).toBeNull();
    expect(screen.queryByRole("button")).toBeNull();
    expect(container.querySelectorAll("picture")).toHaveLength(1);
  });

  it("con ahorro de datos no hay vídeo: se enseña la copa llena", () => {
    Object.defineProperty(navigator, "connection", { configurable: true, value: { saveData: true } });
    const { container } = render(hero);
    expect(container.querySelector("video")).toBeNull();
    const fotos = container.querySelectorAll("picture");
    expect(fotos).toHaveLength(2);
    expect(fotos[1].innerHTML).toContain("copa-horizontal-llena-");
  });
});
