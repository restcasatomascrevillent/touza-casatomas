/**
 * Rutas sin la barra fija "Llamar / Reservar" del móvil (MobileReserveCTA):
 * El Reservado y Contacto ya son el destino de esos dos botones, y el 404 y
 * la respuesta a la reserva son pantallas finales con sus propias acciones.
 *
 * Lo comparten la barra y el aviso de cookies: el aviso se apoya encima de la
 * barra cuando la hay y baja al borde de la pantalla cuando no (antes flotaba
 * a 76 px del borde también en El Reservado, dejando un hueco por el que se
 * veía pasar el formulario).
 */
export const RUTAS_SIN_BARRA_MOVIL = ["/reservado", "/contacto", "/404", "/reserva/respuesta"];

export const muestraBarraMovil = (pathname: string): boolean =>
  !RUTAS_SIN_BARRA_MOVIL.includes(pathname.replace(/\/+$/, "") || "/");
