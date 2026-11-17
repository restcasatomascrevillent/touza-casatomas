import { useEffect, useState } from "react";

/**
 * Consentimiento de cookies de terceros (hoy, solo el mapa interactivo de
 * Google de /contacto: la web no usa ninguna otra cookie; Vercel Analytics no
 * usa cookies). No hay aviso global (se quitó el 15/11/2026: tapaba el hero y
 * pedía permiso para algo que casi nadie usa): se pregunta en el propio hueco
 * del mapa cuando el visitante pide el mapa interactivo, y se puede cambiar
 * en /cookies (ConfigurarCookies).
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

/** Escucha cambios de consentimiento (aceptar, rechazar o reiniciar). */
export function alCambiarConsentimiento(fn: (valor: Consentimiento) => void): () => void {
  const manejador = (e: Event) => fn((e as CustomEvent<Consentimiento>).detail);
  window.addEventListener(EVENTO, manejador);
  return () => window.removeEventListener(EVENTO, manejador);
}

/** Valor actual, y se actualiza si el visitante cambia su elección estando en la página. */
export function useConsentimiento(): Consentimiento {
  // null en el primer render (también en el SSG): no hay localStorage en Node.
  const [valor, setValor] = useState<Consentimiento>(null);
  useEffect(() => {
    setValor(leerConsentimiento());
    return alCambiarConsentimiento(setValor);
  }, []);
  return valor;
}
