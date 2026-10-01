import { useEffect, useState } from "react";

/**
 * `true` cuando se cumple la media query. Vale `false` en el SSG y en el
 * primer render del navegador (así la hidratación coincide con el HTML
 * estático) y se actualiza justo después de montar.
 *
 * Pensado para *mejoras* que solo existen con JS (parallax, revelado de texto
 * con el scroll), nunca para decidir la maquetación: eso va con clases
 * responsive de Tailwind, que funcionan desde el primer pintado.
 */
export function useMediaQuery(query: string): boolean {
  const [cumple, setCumple] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia(query);
    const actualizar = () => setCumple(mql.matches);
    actualizar();
    mql.addEventListener("change", actualizar);
    return () => mql.removeEventListener("change", actualizar);
  }, [query]);

  return cumple;
}

/** Escritorio/tablet (≥ md) y sin `prefers-reduced-motion`: efectos ligados al scroll. */
export const QUERY_EFECTOS_SCROLL = "(min-width: 768px) and (prefers-reduced-motion: no-preference)";
