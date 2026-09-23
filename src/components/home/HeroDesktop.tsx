import { motion, useScroll, useTransform } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { OptimizedImage } from "@/components/ui/optimized-image";
import { IMAGENES } from "@/assets/imagenes";
import { lazy, Suspense, useRef } from "react";
import { HeroBackgroundSVG } from "@/components/ui/svg/HeroBackgroundSVG";
import { Scene3DErrorBoundary } from "@/components/3d/Scene3DErrorBoundary";
import { useDeferred3D } from "@/hooks/use-deferred-3d";

// Three.js (~478KB raw / ~193KB brotli) se carga de forma diferida y SOLO en
// cliente: queda fuera del HTML del SSG (que requeriría WebGL en Node) y fuera
// del chunk principal. Además `useDeferred3D` lo limita a escritorio con puntero
// fino, sin reduced-motion ni ahorro de datos, y lo pide tras `load` + idle.
// La imagen del hero + HeroBackgroundSVG son el póster estático: siempre se
// pintan y la escena solo se superpone (con fade-in) cuando está lista.
const Scene3D = lazy(() => import("@/components/3d/Scene3D"));

const appleEase = [0.25, 0.1, 0.25, 1] as const;

const HeroDesktop = () => {
  const ref = useRef<HTMLDivElement>(null);
  const mostrar3D = useDeferred3D();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <section ref={ref} className="relative h-[100dvh] flex items-center justify-center overflow-hidden">
      <motion.div style={{ y }} className="absolute inset-0 z-0 bg-black">
        <motion.div
          initial={{ scale: 1.05, opacity: 0 }}
          animate={{ scale: 1.15, opacity: 1 }}
          transition={{
            opacity: { duration: 2, ease: appleEase },
            scale: { duration: 30, repeat: Infinity, repeatType: "reverse", ease: "linear" }
          }}
          className="absolute inset-0"
        >
          <OptimizedImage
            imagen={IMAGENES.interior}
            alt="Bar ambiente oscuro y elegante"
            className="w-full h-[100dvh] object-cover opacity-60"
            sizes="100vw"
            priority={true}
          />
        </motion.div>

        <HeroBackgroundSVG />

        {mostrar3D && (
          <Scene3DErrorBoundary>
            <Suspense fallback={null}>
              <Scene3D />
            </Suspense>
          </Scene3DErrorBoundary>
        )}

        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-black/90 pointer-events-none" />
      </motion.div>

      <motion.div style={{ opacity }} className="relative z-10 text-center px-6">
        <motion.span
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: appleEase }}
          className="inline-block text-foreground/50 text-xs tracking-[0.5em] uppercase font-light mb-8"
        >
          Est. 2023 · Crevillente
        </motion.span>

        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 0.5, ease: appleEase }}
          className="font-serif text-[10rem] xl:text-[12rem] font-bold text-white leading-[0.85] tracking-tighter mb-8"
        >
          TOUZA
          <span className="sr-only"> · Cocktail Bar en Crevillente</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.9, ease: appleEase }}
          className="text-white/80 text-xl font-light max-w-lg mx-auto mb-14 leading-relaxed"
          style={{ textWrap: "balance" }}
        >
          Donde la alquimia de los cócteles se encuentra con la excelencia.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.3, ease: appleEase }}
          className="flex gap-5 justify-center"
        >
          <Button
            asChild
            size="lg"
            className="h-14 px-10 bg-white text-black hover:bg-white/90 text-base font-medium rounded-full transition-all duration-300 hover:scale-105"
          >
            <Link to="/carta">Nuestra Carta</Link>
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="h-14 px-10 border-white/20 text-white hover:bg-white/10 hover:border-white/40 text-base font-light rounded-full backdrop-blur-sm transition-all duration-300"
          >
            <Link to="/reservado">El Reservado</Link>
          </Button>
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 2.5 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="w-[1px] h-12 bg-gradient-to-b from-white/40 to-transparent"
        />
      </motion.div>
    </section>
  );
};

export default HeroDesktop;
