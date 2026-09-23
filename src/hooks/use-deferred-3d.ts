import { useEffect, useState } from "react";

/**
 * Decide si la escena 3D del hero debe cargarse y CUÁNDO.
 *
 * El chunk de three.js pesa ~193 KB brotli: solo se pide si el dispositivo
 * puede aprovecharlo y cuando la página ya ha terminado lo importante.
 *
 * Requisitos (todos):
 *  - Escritorio real: ancho >= 1024px y puntero fino (descarta tablets/móvil).
 *  - Sin `prefers-reduced-motion: reduce` (la escena es animación continua).
 *  - Sin "ahorro de datos" (`navigator.connection.saveData`).
 *  - WebGL disponible.
 *
 * Momento: tras el evento `load` y en un hueco ocioso del hilo principal
 * (`requestIdleCallback`, con `setTimeout` de respaldo), así no compite con el
 * LCP (la imagen del hero, que ya actúa de póster estático) ni con la hidratación.
 *
 * Devuelve `false` en SSG y en el primer render de cliente (hidratación estable).
 */
const DESKTOP_QUERY = "(min-width: 1024px) and (pointer: fine) and (prefers-reduced-motion: no-preference)";

function puedeRenderizar3D(): boolean {
  if (typeof window === "undefined") return false;
  if (!window.matchMedia?.(DESKTOP_QUERY).matches) return false;
  const conn = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
  if (conn?.saveData) return false;
  try {
    const canvas = document.createElement("canvas");
    return !!(canvas.getContext("webgl2") || canvas.getContext("webgl"));
  } catch {
    return false;
  }
}

type IdleWindow = Window & {
  requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
  cancelIdleCallback?: (id: number) => void;
};

export function useDeferred3D(): boolean {
  const [listo, setListo] = useState(false);

  useEffect(() => {
    if (!puedeRenderizar3D()) return;

    const w = window as IdleWindow;
    let idleId: number | undefined;
    let timeoutId: number | undefined;
    let cancelado = false;

    const programar = () => {
      if (cancelado) return;
      if (w.requestIdleCallback) {
        idleId = w.requestIdleCallback(() => !cancelado && setListo(true), { timeout: 3000 });
      } else {
        timeoutId = window.setTimeout(() => !cancelado && setListo(true), 1500);
      }
    };

    if (document.readyState === "complete") programar();
    else window.addEventListener("load", programar, { once: true });

    return () => {
      cancelado = true;
      window.removeEventListener("load", programar);
      if (idleId !== undefined) w.cancelIdleCallback?.(idleId);
      if (timeoutId !== undefined) window.clearTimeout(timeoutId);
    };
  }, []);

  return listo;
}
