import { useEffect, useState } from "react";

/**
 * Hero de la carta: la copa llenándose.
 *
 * Diez fotos de una ráfaga del bartender sirviendo un Clover Club
 * (IMG_0284–0293 de la carpeta «Touza» de Drive), alineadas entre sí para
 * que la copa no tiemble. La primera (copa vacía, empieza a caer el cóctel)
 * es una <img> normal con prioridad: es el LCP y es lo que trae el HTML del
 * SSG. Cuando la página ha cargado se piden las otras nueve y, en cuanto
 * están decodificadas, se pasan una vez hasta la copa llena, y ahí se queda.
 * Con reduced-motion se salta directamente a la copa llena, sin animar.
 */
const fotogramas = Object.entries(
  import.meta.glob("../../assets/secuencias/llenado/*.webp", { eager: true, query: "?url", import: "default" }) as Record<
    string,
    string
  >
)
  .sort(([a], [b]) => a.localeCompare(b))
  .map(([, url]) => url);

const MS_POR_FOTOGRAMA = 210;
const ULTIMO = fotogramas.length - 1;

interface Props {
  alt: string;
  className?: string;
}

const HeroLlenado = ({ alt, className }: Props) => {
  const [listos, setListos] = useState(false);
  const [actual, setActual] = useState(0);

  useEffect(() => {
    let cancelado = false;
    let temporizador: number | undefined;
    const quieto = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;

    const empezar = () => {
      const cargas = fotogramas.slice(1).map((src) => {
        const img = new Image();
        img.src = src;
        // `decode` no existe en navegadores viejos ni en jsdom (tests).
        if (typeof img.decode !== "function") return new Promise<void>((ok) => { img.onload = img.onerror = () => ok(); });
        return img.decode().catch(() => undefined);
      });
      Promise.all(cargas).then(() => {
        if (cancelado) return;
        setListos(true);
        if (quieto) {
          setActual(ULTIMO);
          return;
        }
        let i = 0;
        temporizador = window.setInterval(() => {
          i += 1;
          setActual(i);
          if (i >= ULTIMO) window.clearInterval(temporizador);
        }, MS_POR_FOTOGRAMA);
      });
    };

    // No compite con el LCP: espera a que la página haya cargado.
    if (document.readyState === "complete") empezar();
    else window.addEventListener("load", empezar, { once: true });
    return () => {
      cancelado = true;
      window.removeEventListener("load", empezar);
      window.clearInterval(temporizador);
    };
  }, []);

  return (
    <div className={className}>
      <img
        src={fotogramas[0]}
        alt={alt}
        width={1280}
        height={1024}
        {...{ fetchpriority: "high" }}
        decoding="async"
        className="absolute inset-0 w-full h-full object-cover md:object-[50%_22%]"
      />
      {listos &&
        fotogramas.slice(1).map((src, i) => (
          <img
            key={src}
            src={src}
            alt=""
            aria-hidden="true"
            width={1280}
            height={1024}
            className="absolute inset-0 w-full h-full object-cover md:object-[50%_22%] transition-opacity duration-150 ease-linear"
            style={{ opacity: i + 1 <= actual ? 1 : 0 }}
          />
        ))}
    </div>
  );
};

export default HeroLlenado;
