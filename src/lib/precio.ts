/**
 * Formato único de precio en toda la web (auditoría visual v0.10, fallo 7):
 * antes el subtítulo de la carta decía «de 7 a 10 €» y las tarjetas «9,00€»
 * o «78,00€», sin espacio y siempre con dos decimales.
 *
 * - Sin decimales si es entero: «9 €», «78 €»; con dos si no: «8,50 €».
 * - Coma decimal y espacio NO separable antes del «€» (nunca se parte la
 *   línea entre el número y el símbolo).
 * - Sin separador de miles (en español, los números de cuatro cifras van
 *   juntos: «1200 €»).
 *
 * A mano y no con `Intl.NumberFormat`: el HTML del SSG se genera en Node y la
 * hidratación en el navegador; con Intl, un ICU distinto daría otro texto.
 */
export const ESPACIO_PRECIO = "\u00A0";

/** 7 → «7»; 8,5 → «8,50». */
export const importe = (n: number): string => (Number.isInteger(n) ? String(n) : n.toFixed(2).replace(".", ","));

/** 9 → «9 €»; 8,5 → «8,50 €»; vacío si no hay precio. */
export const formatearPrecio = (n: number | null | undefined): string =>
  typeof n === "number" && Number.isFinite(n) && n > 0 ? `${importe(n)}${ESPACIO_PRECIO}€` : "";
