import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import Seo from "@/components/Seo";

const appleEase = [0.25, 0.1, 0.25, 1] as const;

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <>
      <Seo
        title="Página no encontrada"
        description="La página que buscas no existe."
        keywords={[]}
        noindex={true}
      />
      <div className="flex min-h-screen flex-col items-center justify-center bg-black p-6 text-center">
        <motion.h1
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: appleEase }}
          className="font-sans text-[8rem] md:text-[12rem] font-extralight text-white/10 leading-none mb-4"
        >
          404
        </motion.h1>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: appleEase }}
          className="font-serif text-2xl md:text-3xl text-white/80 mb-4"
        >
          Página no encontrada
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4, ease: appleEase }}
          className="text-white/30 font-light max-w-sm mb-10 leading-relaxed"
        >
          Lo sentimos, la página que buscas no existe o ha sido movida.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6, ease: appleEase }}
        >
          <Button
            asChild
            size="lg"
            className="h-14 px-10 bg-white text-black hover:bg-white/90 font-medium rounded-full"
          >
            <Link to="/">Volver al Inicio</Link>
          </Button>
        </motion.div>
      </div>
    </>
  );
};

export default NotFound;
