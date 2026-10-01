import type Lenis from "lenis";

/**
 * Instancia de Lenis activa (o null si no hay: SSG, tests o el visitante pide
 * menos movimiento). Vive aquí y no en SmoothScroll.tsx para que ese fichero
 * solo exporte componentes (regla react-refresh).
 */
let lenisActivo: Lenis | null = null;

export const registrarLenis = (lenis: Lenis | null) => {
  lenisActivo = lenis;
};

/**
 * Sube al principio de la página sin animación. Se llama al cambiar de ruta:
 * sin esto, al pulsar un enlace del pie la página nueva se abría a la misma
 * altura de scroll que la anterior (a media página o directamente en el pie).
 * Primero el scroll nativo (síncrono, siempre funciona) y después se avisa a
 * Lenis para que su estado interno no se quede con la posición vieja: su
 * `scrollTo` por sí solo no basta, porque si cree que ya está en el destino
 * (p. ej. tras un recorte de altura de la página) sale sin hacer nada.
 */
export function irArriba() {
  if (typeof window === "undefined") return;
  window.scrollTo(0, 0);
  lenisActivo?.scrollTo(0, { immediate: true, force: true });
}
