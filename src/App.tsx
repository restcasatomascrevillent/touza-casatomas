import { Suspense, useState, useEffect, type ComponentType } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { ClientOnly, type RouteRecord } from "vite-react-ssg";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import ErrorBoundary from "./components/ui/error-boundary";
import PageTransition from "./components/PageTransition";
import SmoothScroll from "./components/SmoothScroll";
import CookieConsent from "./components/CookieConsent";

const queryClient = new QueryClient();

// Premium loading screen
const PremiumLoader = ({ onComplete }: { onComplete: () => void }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(onComplete, 400);
          return 100;
        }
        return prev + 2;
      });
    }, 30);
    return () => clearInterval(timer);
  }, [onComplete]);

  return (
    <motion.div
      className="fixed inset-0 z-[9999] bg-black flex flex-col items-center justify-center"
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
    >
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="font-serif text-4xl md:text-6xl font-bold tracking-wider text-primary mb-8"
      >
        TOUZA
      </motion.span>
      <div className="w-48 h-px bg-white/10 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-primary/60"
          style={{ width: `${progress}%` }}
          transition={{ duration: 0.1 }}
        />
      </div>
    </motion.div>
  );
};

// El loader es una intro 100% de cliente. Va dentro de <ClientOnly> para que
// NO se prerenderice (si no, el overlay negro fixed taparía el contenido en el
// HTML estático). sessionStorage es seguro aquí porque solo corre en cliente.
const PremiumLoaderGate = () => {
  const [showLoader, setShowLoader] = useState(() => !sessionStorage.getItem("touza-loaded"));

  const handleLoaderComplete = () => {
    setShowLoader(false);
    sessionStorage.setItem("touza-loaded", "1");
  };

  return (
    <AnimatePresence>
      {showLoader && <PremiumLoader onComplete={handleLoaderComplete} />}
    </AnimatePresence>
  );
};

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
          <SmoothScroll>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <ClientOnly>{() => <PremiumLoaderGate />}</ClientOnly>
              <AnimatePresence mode="wait">
                <PageTransition key={location.pathname}>
                  <Suspense fallback={<PageLoader />}>
                    <Outlet />
                  </Suspense>
                </PageTransition>
              </AnimatePresence>
              <CookieConsent />
            </TooltipProvider>
          </SmoothScroll>
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
      { path: "*", lazy: lazyRoute(() => import("./pages/NotFound")) },
    ],
  },
];
