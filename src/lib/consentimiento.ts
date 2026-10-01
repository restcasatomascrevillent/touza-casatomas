import { useEffect, useState } from "react";

/**
 * Consentimiento de cookies de terceros (hoy, solo el mapa de Google de
 * /contacto: la web no usa ninguna otra cookie; Vercel Analytics no usa
 * cookies). Antes "Rechazar" se guardaba en localStorage pero nadie lo leía:
 * el iframe de Google Maps cargaba igual. Ahora el mapa solo se carga con
 * "Aceptar" o si el visitante lo pide expresamente en la propia página.
 */
export const CLAVE_CONSENTIMIENTO = "touza_cookie_consent";
const EVENTO = "touza:consentimiento";

export type Consentimiento = "accepted" | "rejected" | null;

export function leerConsentimiento(): Consentimiento {
  try {
    const valor = window.localStorage.getItem(CLAVE_CONSENTIMIENTO);
    return valor === "accepted" || valor === "rejected" ? valor : null;
  } catch {
    // Modo privado / almacenamiento bloqueado: como si no hubiera respuesta.
    return null;
  }
}

export function guardarConsentimiento(valor: Exclude<Consentimiento, null>) {
  try {
    window.localStorage.setItem(CLAVE_CONSENTIMIENTO, valor);
  } catch {
    // Sin almacenamiento la elección vale para esta visita (se emite igual).
  }
  window.dispatchEvent(new CustomEvent(EVENTO, { detail: valor }));
}

/** Valor actual, y se actualiza si el visitante responde al aviso estando en la página. */
export function useConsentimiento(): Consentimiento {
  // null en el primer render (también en el SSG): no hay localStorage en Node.
  const [valor, setValor] = useState<Consentimiento>(null);
  useEffect(() => {
    setValor(leerConsentimiento());
    const alCambiar = (e: Event) => setValor((e as CustomEvent<Consentimiento>).detail);
    window.addEventListener(EVENTO, alCambiar);
    return () => window.removeEventListener(EVENTO, alCambiar);
  }, []);
  return valor;
}
