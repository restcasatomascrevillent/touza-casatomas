import { motion, useScroll, useTransform } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { OptimizedImage } from "@/components/ui/optimized-image";
import { HERO_VARIANTE_MOVIL, IMAGENES } from "@/assets/imagenes";
import { useRef } from "react";
import { HeroBackgroundSVG } from "@/components/ui/svg/HeroBackgroundSVG";

// La escena 3D (react-three-fiber: cristal flotante + estrellas) está retirada
// por ahora: el fondo es la imagen del hero (la misma que en móvil) +
// HeroBackgroundSVG + un halo dorado estático tras el titular, que ocupa el
// sitio donde flotaba el cristal. Para recuperarla, ver el historial de git
// (src/components/3d/Scene3D.tsx y src/hooks/use-deferred-3d.ts).

const HeroDesktop = () => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <section ref={ref} className="relative h-[100dvh] flex items-center justify-center overflow-hidden">
      <motion.div style={{ y }} className="absolute inset-0 z-0 bg-black">
        {/* Sin fundido de opacidad de entrada: la foto es el LCP y con
            `initial={{ opacity: 0 }}` llegaba invisible en el HTML del SSG
            hasta hidratar + 2 s. Solo queda el zoom lento (ken burns). */}
        <motion.div
          initial={{ scale: 1.05 }}
          animate={{ scale: 1.15 }}
          transition={{ duration: 30, repeat: Infinity, repeatType: "reverse", ease: "linear" }}
          className="absolute inset-0"
        >
          <OptimizedImage
            imagen={IMAGENES.interior}
            alt="Bar ambiente oscuro y elegante"
            className="w-full h-[100dvh] object-cover opacity-60"
            sizes="100vw"
            variante={HERO_VARIANTE_MOVIL}
            priority={true}
          />
        </motion.div>

        <HeroBackgroundSVG />

        {/* Halo cálido estático detrás del titular (relevo del cristal 3D). */}
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_45%_40%_at_50%_48%,hsl(var(--gold)/0.14),transparent_70%)]"
        />

        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-black/90 pointer-events-none" />
      </motion.div>

      {/* Fundido al fondo de la página: con el parallax la foto bajaba y
          dejaba un corte duro contra la sección siguiente. */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 h-40 z-[1] bg-gradient-to-t from-background to-transparent pointer-events-none"
      />

      <motion.div style={{ opacity }} className="relative z-10 text-center px-6">
        {/* Entrada con animación CSS (no framer-motion): arranca con el HTML
            del SSG, sin esperar a que cargue e hidrate el JS. */}
        <span
          className="entrada-hero inline-block text-foreground/70 text-xs tracking-[0.5em] uppercase font-light mb-8"
          style={{ animationDelay: "0.2s" }}
        >
          Cocktail bar · Crevillente
        </span>

        <h1
          className="entrada-hero font-serif text-[10rem] xl:text-[12rem] font-bold text-white leading-[0.85] tracking-tighter mb-8"
          style={{ animationDelay: "0.35s" }}
        >
          TOUZA
          <span className="sr-only"> · Cocktail Bar en Crevillente</span>
        </h1>

        <p
          className="entrada-hero text-white/80 text-xl font-light max-w-lg mx-auto mb-14 leading-relaxed"
          style={{ textWrap: "balance", animationDelay: "0.6s" }}
        >
          Donde la alquimia de los cócteles se encuentra con la excelencia.
        </p>

        <div className="entrada-hero flex gap-5 justify-center" style={{ animationDelay: "0.85s" }}>
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
        </div>
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
