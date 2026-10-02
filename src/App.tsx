import { Suspense, type ComponentType } from "react";
import { Outlet, useLocation } from "react-router-dom";
import type { RouteRecord } from "vite-react-ssg";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AnimatePresence, MotionConfig } from "framer-motion";
import { Analytics } from "@vercel/analytics/react";
import ErrorBoundary from "./components/ui/error-boundary";
import PageTransition from "./components/PageTransition";
import SmoothScroll from "./components/SmoothScroll";
import CookieConsent from "./components/CookieConsent";
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

// Layout raíz: providers globales + transición de página alrededor del <Outlet />.
// vite-react-ssg construye el router internamente a partir de `routes`.
const RootLayout = () => {
  const location = useLocation();
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
              {/* Al terminar de salir la página anterior (y antes de que entre la
                  nueva) se vuelve arriba: si no, la página nueva se abría a la
                  altura de scroll de la anterior. */}
              <AnimatePresence mode="wait" onExitComplete={irArriba}>
                <PageTransition key={location.pathname}>
                  <Suspense fallback={<PageLoader />}>
                    <Outlet />
                  </Suspense>
                </PageTransition>
              </AnimatePresence>
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
      { path: "galeria", lazy: lazyRoute(() => import("./pages/Galeria")) },
      // `handle: SIN_BARRA_MOVIL`: sin la barra fija "Cómo llegar"
      // del móvil (ver src/lib/barra-movil.ts). Contacto ya lleva ese mismo botón
      // arriba del todo.
      // Touza no acepta reservas por la web (decisión del dueño, 01/10/2026):
      // /reservado y /reserva/respuesta ya no existen y vercel.json las
      // redirige (301) a /contacto.
      { path: "contacto", handle: SIN_BARRA_MOVIL, lazy: lazyRoute(() => import("./pages/Contacto")) },
      // Textos legales (LSSI-CE, RGPD/LOPDGDD y cookies). Datos del titular en
      // src/lib/legal.ts; el pie y el aviso de cookies enlazan aquí.
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
