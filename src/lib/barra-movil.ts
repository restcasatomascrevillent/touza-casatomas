import { useMatches } from "react-router-dom";

/**
 * Barra fija "Llamar / Reservar" del móvil (MobileReserveCTA).
 *
 * La decide la ruta que pinta la página, no la URL: cada ruta que no quiere
 * barra lo declara en su `handle` (`handle: SIN_BARRA_MOVIL`, en App.tsx).
 * Antes había una lista de rutas (`/reservado`, `/contacto`, `/404`, ...) y
 * el 404 salía distinto según la URL: en `/404` sin barra y en una URL
 * inventada (`/no-existe`, la ruta `*`) con barra, aunque las dos pintan
 * NotFound. Con el `handle` las dos rutas del 404 se comportan igual, y
 * funciona también en el HTML del SSG (el router estático tiene los mismos
 * `matches`; un contexto rellenado desde un efecto no llegaría al HTML).
 *
 * Quién no la lleva: El Reservado y Contacto, porque ya son el destino de
 * esos dos botones, y la respuesta a la reserva (pantalla final con sus
 * propias acciones).
 *
 * El 404 SÍ la lleva (decisión de 01/10/2026): quien llega de un enlace roto
 * casi siempre buscaba la carta, la reserva o el teléfono, y "Llamar" y
 * "Reservar" son las salidas más útiles, al alcance del pulgar, junto a los
 * enlaces de la propia página.
 *
 * Lo comparten la barra y el aviso de cookies: el aviso se apoya encima de la
 * barra cuando la hay y baja al borde de la pantalla cuando no.
 */
export interface DatosRutaBarraMovil {
  barraMovil?: boolean;
}

export const SIN_BARRA_MOVIL: DatosRutaBarraMovil = { barraMovil: false };

/** `false` si alguna ruta de la jerarquía actual declara `barraMovil: false`. */
export const muestraBarraMovil = (matches: ReadonlyArray<{ handle?: unknown }>): boolean =>
  !matches.some((m) => (m.handle as DatosRutaBarraMovil | undefined)?.barraMovil === false);

/** Necesita un router de datos (el de vite-react-ssg en el navegador y en el SSG). */
export const useBarraMovil = (): boolean => muestraBarraMovil(useMatches());
