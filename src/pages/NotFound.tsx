import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import Layout from "@/components/layout/Layout";
import Seo from "@/components/Seo";

const appleEase = [0.25, 0.1, 0.25, 1] as const;

// Salidas útiles desde el 404: antes solo había "Volver al inicio" y ni
// siquiera cabecera, así que quien llegaba de un enlace roto a la carta o a
// la reserva tenía que empezar desde la portada.
const salidas = [
  { to: "/carta", texto: "Ver la carta" },
  { to: "/reservado", texto: "El Reservado" },
  { to: "/contacto", texto: "Contacto y horario" },
];

const NotFound = () => {
  // Sin console.error: en producción cada 404 (bots incluidos) ensuciaba la
  // consola como si fuera un fallo de la web. Vercel ya registra los 404.
  return (
    <Layout>
      <Seo
        title="Página no encontrada"
        description="La página que buscas no existe."
        keywords={[]}
        noindex={true}
      />
      <section className="flex min-h-[80vh] flex-col items-center justify-center bg-black px-6 pt-32 pb-20 text-center">
        <motion.p
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: appleEase }}
          className="font-serif text-[8rem] md:text-[12rem] font-light text-primary/25 leading-none mb-2 select-none"
          aria-hidden="true"
        >
          404
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: appleEase }}
          className="font-serif text-3xl md:text-5xl text-white mb-4"
        >
          Página no encontrada
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4, ease: appleEase }}
          className="text-white/65 font-light max-w-sm mb-10 leading-relaxed"
        >
          Lo sentimos, la página que buscas no existe o ha cambiado de sitio.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6, ease: appleEase }}
          className="flex flex-col items-center gap-6"
        >
          <Button
            asChild
            size="lg"
            className="h-14 px-10 bg-white text-black hover:bg-white/90 font-medium rounded-full"
          >
            <Link to="/">Volver al inicio</Link>
          </Button>
          <nav aria-label="Otras secciones">
            <ul className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm">
              {salidas.map((s) => (
                <li key={s.to}>
                  <Link
                    to={s.to}
                    className="inline-block py-2 text-white/70 hover:text-primary underline-offset-4 hover:underline transition-colors rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  >
                    {s.texto}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </motion.div>
      </section>
    </Layout>
  );
};

export default NotFound;
