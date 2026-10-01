import { motion } from "framer-motion";
import Layout from "@/components/layout/Layout";
import HeroMobile from "./HeroMobile";
import ShowcaseMobile from "./ShowcaseMobile";
import FeaturesMobile from "./FeaturesMobile";
import VisitUs from "@/components/VisitUs";
import { IMAGENES } from "@/assets/imagenes";


const appleEase = [0.25, 0.1, 0.25, 1] as const;

const IndexMobile = () => {
  return (
    <Layout>
      <HeroMobile />

      {/* Philosophy — simple fade, no scroll-reveal on mobile */}
      <section className="py-10 px-5">
        <motion.span
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: appleEase }}
          className="text-primary text-[11px] tracking-[0.3em] uppercase mb-3 block font-medium text-center"
        >
          Filosofía
        </motion.span>
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: appleEase }}
          className="font-serif text-[1.4rem] text-foreground leading-snug text-center"
        >
          Touza no es solo un bar; es una declaración de intenciones. Un espacio donde el tiempo se detiene.
        </motion.p>
      </section>

      <ShowcaseMobile
        title="Cócteles de Autor"
        description="Cada copa que servimos cuenta una historia. Ingredientes seleccionados y técnicas de vanguardia."
        imagen={IMAGENES.barra}
        ctaText="Ver Carta Completa"
        ctaLink="/carta"
        label="Descubre"
      />

      <ShowcaseMobile
        title="El Privado"
        description="Un espacio exclusivo diseñado para la intimidad. Perfecto para celebraciones especiales."
        imagen={IMAGENES.decoracion}
        ctaText="Reservar ahora"
        ctaLink="/reservado"
        label="Espacio Exclusivo"
      />

      <FeaturesMobile />

      {/* Import directo, no lazy: la portada de escritorio ya lo trae en el
          mismo chunk y, al prerenderizarse ahora también esta composición,
          un lazy dejaba el hueco vacío en el HTML estático. */}
      <VisitUs />
    </Layout>
  );
};

export default IndexMobile;
