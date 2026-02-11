import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { AnimatePresence } from "framer-motion";
import PageTransition from "./components/PageTransition";
import SmoothScroll from "./components/SmoothScroll";

// Lazy load pages for better performance
const Index = lazy(() => import("./pages/Index"));
const Carta = lazy(() => import("./pages/Carta"));
const Galeria = lazy(() => import("./pages/Galeria"));
const Reservado = lazy(() => import("./pages/Reservado"));
const Contacto = lazy(() => import("./pages/Contacto"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

// Loading component
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="animate-pulse flex flex-col items-center gap-4">
      <div className="h-12 w-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
      <p className="text-muted-foreground font-display text-lg">Cargando...</p>
    </div>
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <HelmetProvider>
      <SmoothScroll>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Suspense fallback={<PageLoader />}>
              <AnimatedRoutes />
            </Suspense>
          </BrowserRouter>
        </TooltipProvider>
      </SmoothScroll>
    </HelmetProvider>
  </QueryClientProvider>
);

// Separate component to use useLocation hook
import { useLocation } from "react-router-dom";

const AnimatedRoutes = () => {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageTransition><Index /></PageTransition>} />
        <Route path="/carta" element={<PageTransition><Carta /></PageTransition>} />
        <Route path="/galeria" element={<PageTransition><Galeria /></PageTransition>} />
        <Route path="/reservado" element={<PageTransition><Reservado /></PageTransition>} />
        <Route path="/contacto" element={<PageTransition><Contacto /></PageTransition>} />
        <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
      </Routes>
    </AnimatePresence>
  );
};

export default App;
