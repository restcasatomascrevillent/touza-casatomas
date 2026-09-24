import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OptimizedImage } from "@/components/ui/optimized-image";
import { HERO_VARIANTE_MOVIL, IMAGENES } from "@/assets/imagenes";

const appleEase = [0.25, 0.1, 0.25, 1] as const;

const HeroMobile = () => {
  return (
    <section className="relative h-[100dvh] flex items-end justify-center overflow-hidden pb-10 px-5">
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
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: appleEase }}
          className="font-serif text-[3.5rem] font-bold text-white leading-[0.85] tracking-tighter mb-3"
        >
          TOUZA
          <span className="sr-only"> · Cocktail Bar en Crevillente</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5, ease: appleEase }}
          className="text-white/80 text-[15px] font-light max-w-[260px] mx-auto mb-8 leading-relaxed"
        >
          Donde la alquimia de los cócteles se encuentra con la excelencia.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7, ease: appleEase }}
          className="flex flex-col gap-3 w-full"
        >
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
        </motion.div>

        {/* Scroll hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 0.8 }}
          className="mt-6 flex flex-col items-center"
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
