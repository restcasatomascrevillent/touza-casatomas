import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { OptimizedImage } from "@/components/ui/optimized-image";

const appleEase = [0.25, 0.1, 0.25, 1] as const;

const HeroMobile = () => {
  return (
    <section className="relative h-[90dvh] flex items-end justify-center overflow-hidden pb-16 px-6">
      <motion.div
        initial={{ scale: 1.1, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1.5, ease: appleEase }}
        className="absolute inset-0 z-0"
      >
        <OptimizedImage
          src="https://restaurantecasatomascrevillente.es/wp-content/uploads/2023/11/Touza-2-scaled.webp"
          alt="Bar ambiente oscuro y elegante"
          className="w-full h-full object-cover"
          priority={true}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/95" />
      </motion.div>

      <div className="relative z-10 w-full text-center">
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3, ease: appleEase }}
          className="font-serif text-6xl font-bold text-white leading-[0.85] tracking-tighter mb-4"
        >
          TOUZA
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.7, ease: appleEase }}
          className="text-white/50 text-base font-light max-w-[280px] mx-auto mb-10 leading-relaxed"
        >
          Donde la alquimia de los cócteles se encuentra con la excelencia.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1, ease: appleEase }}
          className="flex flex-col gap-3 w-full"
        >
          <Button
            asChild
            size="lg"
            className="h-14 w-full bg-white text-black hover:bg-white/90 text-base font-medium rounded-2xl"
          >
            <Link to="/carta">Nuestra Carta</Link>
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="h-14 w-full border-white/20 text-white hover:bg-white/10 text-base font-light rounded-2xl backdrop-blur-sm"
          >
            <Link to="/reservado">El Reservado</Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroMobile;
