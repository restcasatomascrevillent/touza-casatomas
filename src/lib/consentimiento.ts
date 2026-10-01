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

/**
 * Retira la elección guardada y vuelve a mostrar el aviso de cookies (botón
 * "Configurar cookies" de /cookies). Retirar el consentimiento tiene que ser
 * tan fácil como darlo (art. 7.3 RGPD). Quien escuche `useConsentimiento`
 * recibe `null`, así que el mapa de Google deja de cargarse en la próxima
 * visita a /contacto.
 */
export function reiniciarConsentimiento() {
  try {
    window.localStorage.removeItem(CLAVE_CONSENTIMIENTO);
  } catch {
    // Sin almacenamiento no había nada guardado.
  }
  window.dispatchEvent(new CustomEvent<Consentimiento>(EVENTO, { detail: null }));
}

/** Escucha cambios de consentimiento (aceptar, rechazar o reiniciar). */
export function alCambiarConsentimiento(fn: (valor: Consentimiento) => void): () => void {
  const manejador = (e: Event) => fn((e as CustomEvent<Consentimiento>).detail);
  window.addEventListener(EVENTO, manejador);
  return () => window.removeEventListener(EVENTO, manejador);
}

/** Valor actual, y se actualiza si el visitante responde al aviso estando en la página. */
export function useConsentimiento(): Consentimiento {
  // null en el primer render (también en el SSG): no hay localStorage en Node.
  const [valor, setValor] = useState<Consentimiento>(null);
  useEffect(() => {
    setValor(leerConsentimiento());
    return alCambiarConsentimiento(setValor);
  }, []);
  return valor;
}
