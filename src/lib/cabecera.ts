/**
 * Curva con la que la cabecera fija se esconde y reaparece (equivale a `ease`).
 */
export const CURVA_CABECERA = "cubic-bezier(0.25, 0.1, 0.25, 1)";

/**
 * Clases de las barras pegajosas que van justo debajo de la cabecera (pestañas
 * de la carta, filtros de la galería). `--offset-cabecera` lo publica Header:
 * el alto real de la cabecera cuando se ve y 0 cuando se esconde.
 *
 * La transición de `top` tiene que ir con la misma duración y la misma curva
 * que el `transform` de la cabecera: con la curva por defecto de Tailwind la
 * cabecera bajaba más deprisa que la barra y se le montaba encima ~10 px a
 * mitad de camino al volver a subir. Va como propiedad arbitraria porque
 * `ease-[…]` es ambiguo con el `ease-*` de tailwindcss-animate y Tailwind no
 * lo genera.
 */
export const BARRA_BAJO_CABECERA =
  "sticky top-[var(--offset-cabecera,0px)] transition-[top] duration-500 [transition-timing-function:cubic-bezier(0.25,0.1,0.25,1)] z-40";
