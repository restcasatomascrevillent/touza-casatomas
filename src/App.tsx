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
import MobileReserveCTA from "./components/MobileReserveCTA";
import { irArriba } from "./lib/scroll";

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
              <MobileReserveCTA />
              <CookieConsent />
              {/* Vercel Web Analytics (sin cookies). Renderiza `null` y solo inyecta
                  el script en un useEffect → no afecta al HTML del SSG. El script
                  sigue los cambios de history (react-router): cada navegación en
                  cliente cuenta como page view. */}
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
      { path: "reservado", lazy: lazyRoute(() => import("./pages/Reservado")) },
      { path: "contacto", lazy: lazyRoute(() => import("./pages/Contacto")) },
      // Página de los enlaces de los correos de reserva (Supabase sirve el HTML
      // de sus funciones como text/plain, así que la sirve la web). `noindex`;
      // el SSG prerenderiza un cascarón vacío: el token se lee en el navegador.
      // Queda fuera del sitemap porque vive en una subcarpeta (reserva/).
      { path: "reserva/respuesta", lazy: lazyRoute(() => import("./pages/RespuestaReserva")) },
      // Ruta literal para que el SSG prerenderice `404.html` (vite-react-ssg
      // descarta la ruta "*" al recolectar paths). Vercel sirve ese fichero con
      // status 404 para cualquier URL que no resuelva en el filesystem.
      { path: "404", lazy: lazyRoute(() => import("./pages/NotFound")) },
      { path: "*", lazy: lazyRoute(() => import("./pages/NotFound")) },
    ],
  },
];
