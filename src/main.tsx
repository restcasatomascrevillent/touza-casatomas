import { ViteReactSSG } from "vite-react-ssg";
import { createBrowserRouter } from "react-router-dom";
import { routes } from "./App";
import "./index.css";

/**
 * Router del navegador con View Transitions en TODAS las navegaciones
 * internas (enlaces de la cabecera, el menú, el pie, la portada...), sin
 * tener que marcar cada <Link viewTransition>. react-router espera a tener
 * cargada la página nueva y solo entonces llama a
 * `document.startViewTransition`: la página vieja sigue en pantalla hasta
 * ese momento (nada de pantallazo en negro) y el navegador anima el cambio
 * con las reglas `::view-transition-*` de index.css. Al volver atrás,
 * react-router repite la transición de la ida. En navegadores sin la API
 * react-router actualiza sin más y entra el fundido de respaldo
 * (PageTransition).
 */
const crearRouter: typeof createBrowserRouter = (rutas, opciones) => {
  const router = createBrowserRouter(rutas, opciones);
  const navegar = router.navigate.bind(router);
  router.navigate = ((destino: Parameters<typeof navegar>[0], opts?: Record<string, unknown>) =>
    typeof destino === "number"
      ? navegar(destino)
      : // `?? true` y no un spread por delante: <Link> pasa siempre la clave
        // `viewTransition` (undefined si no se marcó) y la pisaría.
        navegar(destino, { ...opts, viewTransition: opts?.viewTransition ?? true })) as typeof router.navigate;
  return router;
};

// Entry de vite-react-ssg: monta/hidrata en cliente y prerenderiza en build.
// El HelmetProvider lo aporta vite-react-ssg internamente (componente <Head />).
export const createRoot = ViteReactSSG({ routes, customCreateRouter: crearRouter }, ({ isClient }) => {
  // PWA service worker: solo en cliente (en Node/SSG `navigator` no existe).
  if (isClient && "serviceWorker" in navigator) {
    import("virtual:pwa-register").then(({ registerSW }) => {
      registerSW({ immediate: true });
    });
  }
});
