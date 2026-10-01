import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OptimizedImage } from "@/components/ui/optimized-image";
import { HERO_VARIANTE_MOVIL, IMAGENES } from "@/assets/imagenes";

const HeroMobile = () => {
  // pb-24 (y no pb-10): la barra fija de "Llamar / Reservar"
  // (MobileReserveCTA) ocupa los ~81 px inferiores del viewport. Con pb-10 los
  // dos botones del hero caían JUSTO DEBAJO de esa barra y no se veían en la
  // primera pantalla. El alto del hero no cambia (sigue 100dvh); solo sube su
  // contenido para dejar libre la franja de la barra.
  return (
    <section className="relative h-[100dvh] flex items-end justify-center overflow-hidden pb-24 px-5">
      {/* Background image — static on mobile for perf */}
      <div className="absolute inset-0 z-0 bg-black">
        <OptimizedImage
          imagen={IMAGENES.interior}
          alt="Bar ambiente oscuro y elegante"
          className="w-full h-full object-cover opacity-50 absolute inset-0"
          sizes="100vw"
          variante={HERO_VARIANTE_MOVIL}
          priority={true}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black pointer-events-none" />
      </div>

      <div className="relative z-10 w-full text-center">
        {/* Entrada con animación CSS: arranca con el HTML del SSG, sin
            esperar al JS (con framer-motion el titular llegaba con opacity:0). */}
        <h1
          className="entrada-hero font-serif text-[4.25rem] font-bold text-white leading-[0.85] tracking-tighter mb-4"
          style={{ animationDelay: "0.1s" }}
        >
          TOUZA
          <span className="sr-only"> · Cocktail Bar en Crevillente</span>
        </h1>

        <p
          style={{ animationDelay: "0.3s" }}
          className="entrada-hero text-white/80 text-[15px] font-light max-w-[260px] mx-auto mb-8 leading-relaxed"
        >
          Donde la alquimia de los cócteles se encuentra con la excelencia.
        </p>

        <div className="entrada-hero flex flex-col gap-3 w-full" style={{ animationDelay: "0.45s" }}>
          <Button
            asChild
            size="lg"
            className="h-[52px] w-full bg-white text-black hover:bg-white/90 text-[15px] font-medium rounded-2xl active:scale-[0.98] transition-transform"
          >
            <Link to="/carta">Nuestra Carta</Link>
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="h-[52px] w-full border-white/20 text-white hover:bg-white/10 text-[15px] font-light rounded-2xl backdrop-blur-sm active:scale-[0.98] transition-transform"
          >
            <Link to="/reservado">El Reservado</Link>
          </Button>
        </div>

        {/* Scroll hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 0.8 }}
          className="mt-4 flex flex-col items-center"
        >
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <ChevronDown className="w-5 h-5 text-white/30" />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroMobile;
