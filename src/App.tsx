import { Suspense, lazy, useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { AnimatePresence, motion } from "framer-motion";
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

// Simple fallback for subsequent navigations
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="animate-pulse flex flex-col items-center gap-4">
      <span className="font-serif text-2xl font-bold tracking-wider text-primary">TOUZA</span>
    </div>
  </div>
);

const App = () => {
  const [showLoader, setShowLoader] = useState(() => {
    if (typeof window !== "undefined" && sessionStorage.getItem("touza-loaded")) {
      return false;
    }
    return true;
  });

  const handleLoaderComplete = () => {
    setShowLoader(false);
    if (typeof window !== "undefined") {
      sessionStorage.setItem("touza-loaded", "1");
    }
  };

  return (
    <QueryClientProvider client={queryClient}>
      <HelmetProvider>
        <SmoothScroll>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <AnimatePresence>
              {showLoader && <PremiumLoader onComplete={handleLoaderComplete} />}
            </AnimatePresence>
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
};

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
