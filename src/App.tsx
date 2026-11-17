import { Suspense, useEffect, useLayoutEffect, useRef, type ComponentType } from "react";
import { Outlet, useLocation, type Location } from "react-router-dom";
import type { RouteRecord } from "vite-react-ssg";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MotionConfig } from "framer-motion";
import { Analytics } from "@vercel/analytics/react";
import ErrorBoundary from "./components/ui/error-boundary";
import PageTransition from "./components/PageTransition";
import SmoothScroll from "./components/SmoothScroll";
import BarraAccionesMovil from "./components/BarraAccionesMovil";
import { irArriba } from "./lib/scroll";
import { SIN_BARRA_MOVIL } from "./lib/barra-movil";

const queryClient = new QueryClient();

// La intro "PremiumLoader" (overlay negro de ~1,9 s: 50 ticks × 30 ms + 400 ms)
// se ha eliminado: todo visitante nuevo desde Google veía pantalla negra antes
// del hero, lo que hundía el LCP y disparaba el rebote en móvil.

// Fallback para navegaciones lazy
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="animate-pulse flex flex-col items-center gap-4">
      <span className="font-serif text-2xl font-bold tracking-wider text-primary">TOUZA</span>
    </div>
  </div>
);

// En el navegador, `useLayoutEffect` (antes de pintar); en el SSG, `useEffect`,
// que en Node ni corre ni avisa.
const useEfectoAntesDePintar = typeof window === "undefined" ? useEffect : useLayoutEffect;

/**
 * Vuelve arriba en cada navegación: si no, la página nueva se abría a la
 * altura de scroll de la anterior (a media página o en el pie).
 *
 * - Va ligado a la ruta y a nada más: no espera a ninguna animación (antes
 *   colgaba del `onExitComplete` de la transición y, si la salida no acababa,
 *   tampoco se subía). También con el botón atrás/adelante del navegador, y
 *   al pulsar el enlace de la página en la que ya se está («Inicio» en el pie
 *   de la portada).
 * - Antes de pintar: la página nueva no llega a verse a media altura, y los
 *   <Reveal> y el ancla de la carta (efectos normales, que corren después) ya
 *   miden con el scroll arriba.
 * - No se toca la carga inicial (llegar con ancla) ni un cambio de ancla
 *   dentro de la misma página. Un enlace a un cóctel desde otra página
 *   (`/carta#moscow-mule`) sube aquí y la carta lo lleva luego a su ficha
 *   (ver el efecto de `hash` en pages/Carta.tsx).
 * - `scrollRestoration = "manual"`: con atrás/adelante el navegador repone
 *   por su cuenta el scroll que tenía esa entrada, y si la página que se deja
 *   es más corta lo hace DESPUÉS de pintarse la nueva: unas veces se volvía
 *   arriba y otras a media página (y en Contacto, con el título ya
 *   desvanecido por su escena de scroll). Así es siempre arriba; a cambio,
 *   recargar a media página también empieza arriba.
 */
function useArribaAlNavegar({ key, pathname, hash }: Location) {
  useEffect(() => {
    if ("scrollRestoration" in window.history) window.history.scrollRestoration = "manual";
  }, []);

  const anterior = useRef({ key, pathname });
  useEfectoAntesDePintar(() => {
    const { key: claveAnterior, pathname: rutaAnterior } = anterior.current;
    if (claveAnterior === key) return;
    anterior.current = { key, pathname };
    if (rutaAnterior === pathname && hash) return;
    irArriba();
    // `key` cambia en cada navegación; `pathname` y `hash` van con ella.
  }, [key, pathname, hash]);
}

// Layout raíz: providers globales + contenedor de página alrededor del <Outlet />.
// vite-react-ssg construye el router internamente a partir de `routes`.
const RootLayout = () => {
  const location = useLocation();
  const { pathname } = location;
  useArribaAlNavegar(location);
  return (
    <div className="min-h-screen bg-background font-sans antialiased">
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          {/* reducedMotion="user": con "reducir movimiento" activado en el
              sistema, framer-motion quita los desplazamientos y escalados
              (parallax, rebotes infinitos, entradas) y deja solo los fundidos.
              La regla CSS de index.css solo cubría animaciones CSS. */}
          <MotionConfig reducedMotion="user">
          <SmoothScroll>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              {/* Sin <AnimatePresence> ni animación de salida: con `key`, al
                  cambiar de ruta nace un contenedor nuevo con la página nueva
                  ya dentro y visible; el fundido de entrada es CSS (ver
                  PageTransition.tsx). Que una página se vea no depende de que
                  termine ninguna animación de JavaScript. */}
              <PageTransition key={pathname}>
                <Suspense fallback={<PageLoader />}>
                  <Outlet />
                </Suspense>
              </PageTransition>
              {/* Fuera de <PageTransition>: no es parte de la página y no debe
                  fundirse ni volver a montarse con cada navegación. */}
              <BarraAccionesMovil />
              {/* Vercel Web Analytics (sin cookies). Renderiza `null` y solo inyecta
                  el script en un useEffect → no afecta al HTML del SSG. El script
                  sigue los cambios de history (react-router): cada navegación en
                  cliente cuenta como page view.
                  Fuera de Vercel (`npm run preview`, `npm run dev`) el script
                  /_vercel/insights/script.js da 404 en cada página: es lo
                  esperado, en producción responde 200. */}
              <Analytics />
            </TooltipProvider>
          </SmoothScroll>
          </MotionConfig>
        </QueryClientProvider>
      </ErrorBoundary>
    </div>
  );
};

// Adapta el `export default` de cada página al contrato `lazy` de react-router.
// vite-react-ssg espera (await) este `lazy` antes de renderizar → el HTML del
// SSG contiene el contenido real (a diferencia de React.lazy + Suspense).
const lazyRoute =
  (factory: () => Promise<{ default: ComponentType }>) =>
  async () => ({ Component: (await factory()).default });

export const routes: RouteRecord[] = [
  {
    path: "/",
    element: <RootLayout />,
    children: [
      { index: true, lazy: lazyRoute(() => import("./pages/Index")) },
      { path: "carta", lazy: lazyRoute(() => import("./pages/Carta")) },
      // `handle: SIN_BARRA_MOVIL`: sin la barra fija "Cómo llegar"
      // del móvil (ver src/lib/barra-movil.ts). Contacto ya lleva ese mismo botón
      // arriba del todo.
      // Touza no acepta reservas por la web (decisión del dueño, 01/10/2026):
      // /reservado y /reserva/respuesta ya no existen y vercel.json las
      // redirige (301) a /contacto.
      { path: "contacto", handle: SIN_BARRA_MOVIL, lazy: lazyRoute(() => import("./pages/Contacto")) },
      // «Copas después de cenar en Casa Tomás» (auditoría SEO/GEO del
      // 15/11/2026). El SSG la prerenderiza como las demás (sale de esta
      // lista) y el sitemap la recoge del `dist/despues-de-cenar.html`.
      { path: "despues-de-cenar", lazy: lazyRoute(() => import("./pages/DespuesDeCenar")) },
      // Textos legales (LSSI-CE, RGPD/LOPDGDD y cookies). Datos del titular en
      // src/lib/legal.ts; el pie y el mapa de /contacto enlazan aquí.
      { path: "aviso-legal", lazy: lazyRoute(() => import("./pages/AvisoLegal")) },
      { path: "privacidad", lazy: lazyRoute(() => import("./pages/Privacidad")) },
      { path: "cookies", lazy: lazyRoute(() => import("./pages/Cookies")) },
      // Ruta literal para que el SSG prerenderice `404.html` (vite-react-ssg
      // descarta la ruta "*" al recolectar paths). Vercel sirve ese fichero con
      // status 404 para cualquier URL que no resuelva en el filesystem.
      // Las dos rutas del 404 llevan la barra del móvil (sin `handle`): así
      // `/404` y una URL inventada se ven igual (ver src/lib/barra-movil.ts).
      { path: "404", lazy: lazyRoute(() => import("./pages/NotFound")) },
      { path: "*", lazy: lazyRoute(() => import("./pages/NotFound")) },
    ],
  },
];
