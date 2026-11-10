import { Suspense, useEffect, useLayoutEffect, useRef, type ComponentType } from "react";
import { Outlet, useLocation, useNavigationType } from "react-router-dom";
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
import CookieConsent from "./components/CookieConsent";
import BarraAccionesMovil from "./components/BarraAccionesMovil";
import { irA, irArriba } from "./lib/scroll";
import { PAGINAS, precargarAlApuntar, precargarRuta } from "./lib/precarga";
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

// En el prerender (SSG) no hay ventana y useLayoutEffect solo avisaría.
const useEfectoDeMaqueta = typeof window === "undefined" ? useEffect : useLayoutEffect;

/**
 * Por encima de esta altura de scroll, la foto de cabecera de la página que se
 * deja ya no está a la vista y no debe "volar" hacia la página nueva en la
 * transición (ver `.vt-foto` en index.css): se marca `<html data-vt-lejos>`.
 */
const marcarLejosDeArriba = () => {
  const lejos = window.scrollY > window.innerHeight * 0.5;
  document.documentElement.toggleAttribute("data-vt-lejos", lejos);
};

/**
 * Scroll al cambiar de página. Antes se subía arriba al terminar el fundido de
 * salida de framer-motion; ahora la transición la hace el navegador (View
 * Transitions, ver main.tsx) y esto corre DENTRO de la actualización, antes de
 * que el navegador fotografíe la página nueva: la nueva entra ya arriba.
 * - Enlace (PUSH/REPLACE): arriba del todo.
 * - Atrás/adelante (POP): vuelve a donde estaba el visitante en esa página
 *   (antes se perdía: volver de la carta a la portada abría arriba).
 */
const useScrollDePagina = () => {
  const location = useLocation();
  const tipo = useNavigationType();
  const posiciones = useRef(new Map<string, number>());
  const claveActual = useRef(location.key);
  const primera = useRef(true);

  useEffect(() => {
    if ("scrollRestoration" in window.history) window.history.scrollRestoration = "manual";
    const guardar = () => {
      posiciones.current.set(claveActual.current, window.scrollY);
      marcarLejosDeArriba();
    };
    window.addEventListener("scroll", guardar, { passive: true });
    return () => window.removeEventListener("scroll", guardar);
  }, []);

  useEfectoDeMaqueta(() => {
    claveActual.current = location.key;
    // La primera página la deja como está el navegador (recarga, ancla...).
    if (primera.current) {
      primera.current = false;
      return;
    }
    // Para que las animaciones distingan ir de volver (index.css).
    document.documentElement.dataset.navegacion = tipo === "POP" ? "atras" : "adelante";
    const guardada = tipo === "POP" ? posiciones.current.get(location.key) : undefined;
    if (guardada !== undefined) irA(guardada);
    else irArriba();
    marcarLejosDeArriba();
  }, [location.key, tipo]);
};

// Layout raíz: providers globales + transición de página alrededor del <Outlet />.
// vite-react-ssg construye el router internamente a partir de `routes`.
const RootLayout = () => {
  const location = useLocation();
  useScrollDePagina();

  // Precarga: el JS (y la foto de cabecera) de una página se pide al apuntar
  // a su enlace, y la carta —el destino de casi todas las visitas desde la
  // portada— en cuanto el navegador queda libre. Así el toque en "Nuestra
  // Carta" cambia de página al momento, sin hueco en negro.
  useEffect(() => precargarAlApuntar(), []);
  useEffect(() => {
    const precargarCarta = () => precargarRuta("/carta");
    if (typeof window.requestIdleCallback === "function") {
      const id = window.requestIdleCallback(precargarCarta, { timeout: 2000 });
      return () => window.cancelIdleCallback(id);
    }
    const id = window.setTimeout(precargarCarta, 1500);
    return () => window.clearTimeout(id);
  }, []);

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
              {/* Sin AnimatePresence: antes la página vieja se fundía a negro
                  (0,45 s) y solo entonces entraba la nueva, con un fotograma
                  en negro entre las dos. Ahora el cambio lo anima el navegador
                  (View Transitions, ver main.tsx y index.css) y PageTransition
                  solo pone un fundido de entrada donde no las hay. */}
              <PageTransition key={location.pathname}>
                <Suspense fallback={<PageLoader />}>
                  <Outlet />
                </Suspense>
              </PageTransition>
              {/* Fuera de <PageTransition>: su transform de framer-motion crearía
                  un containing block y la barra `fixed` dejaría de anclarse al viewport. */}
              <BarraAccionesMovil />
              <CookieConsent />
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
// Las fábricas `import()` están en src/lib/precarga.ts (para poder precargarlas).
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
      { index: true, lazy: lazyRoute(PAGINAS["/"]) },
      { path: "carta", lazy: lazyRoute(PAGINAS["/carta"]) },
      { path: "galeria", lazy: lazyRoute(PAGINAS["/galeria"]) },
      // `handle: SIN_BARRA_MOVIL`: sin la barra fija "Cómo llegar"
      // del móvil (ver src/lib/barra-movil.ts). Contacto ya lleva ese mismo botón
      // arriba del todo.
      // Touza no acepta reservas por la web (decisión del dueño, 01/10/2026):
      // /reservado y /reserva/respuesta ya no existen y vercel.json las
      // redirige (301) a /contacto.
      { path: "contacto", handle: SIN_BARRA_MOVIL, lazy: lazyRoute(PAGINAS["/contacto"]) },
      // Textos legales (LSSI-CE, RGPD/LOPDGDD y cookies). Datos del titular en
      // src/lib/legal.ts; el pie y el aviso de cookies enlazan aquí.
      { path: "aviso-legal", lazy: lazyRoute(PAGINAS["/aviso-legal"]) },
      { path: "privacidad", lazy: lazyRoute(PAGINAS["/privacidad"]) },
      { path: "cookies", lazy: lazyRoute(PAGINAS["/cookies"]) },
      // Ruta literal para que el SSG prerenderice `404.html` (vite-react-ssg
      // descarta la ruta "*" al recolectar paths). Vercel sirve ese fichero con
      // status 404 para cualquier URL que no resuelva en el filesystem.
      // Las dos rutas del 404 llevan la barra del móvil (sin `handle`): así
      // `/404` y una URL inventada se ven igual (ver src/lib/barra-movil.ts).
      { path: "404", lazy: lazyRoute(PAGINAS["/404"]) },
      { path: "*", lazy: lazyRoute(PAGINAS["/404"]) },
    ],
  },
];
