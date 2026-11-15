import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";

interface ScrollTextRevealProps {
  children: string;
  className?: string;
}

/**
 * Texto que se "enciende" palabra a palabra con el scroll.
 *
 * Solo CSS (`.texto-encendido` en index.css, con `animation-timeline`), en
 * todos los tamaños. Hasta el 15/11/2026, desde md lo hacía framer-motion con
 * un valor animado por palabra; en escritorio el texto se quedaba al 20 %
 * cuando la página iba en segundo plano (el requestAnimationFrame se congela)
 * y había dos sistemas para lo mismo. Ahora es uno, sin JS.
 *
 * Solo es una mejora: en el HTML del SSG, sin soporte de `animation-timeline`
 * y con `prefers-reduced-motion`, el texto sale entero y a opacidad completa.
 * Las palabras son <span> en línea con su espacio, así que el párrafo corta
 * las líneas como cualquier texto y se lee igual con lector de pantalla.
 */
const ScrollTextReveal = ({ children, className }: ScrollTextRevealProps) => {
  const palabras = children.split(" ");

  return (
    <p className={cn("texto-encendido", className)} style={{ "--n": palabras.length } as CSSProperties}>
      {palabras.map((palabra, i) => (
        <span key={i} style={{ "--i": i } as CSSProperties}>
          {palabra}
          {i < palabras.length - 1 ? " " : ""}
        </span>
      ))}
    </p>
  );
};

export default ScrollTextReveal;
