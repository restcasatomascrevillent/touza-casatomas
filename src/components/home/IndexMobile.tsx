import { motion } from "framer-motion";
import { lazy, Suspense } from "react";
import Layout from "@/components/layout/Layout";
import Seo from "@/components/Seo";
import HeroMobile from "./HeroMobile";
import ShowcaseMobile from "./ShowcaseMobile";
import FeaturesMobile from "./FeaturesMobile";
import { canonical } from "@/lib/site";
import { barSchema } from "@/lib/negocio";
import { IMAGENES } from "@/assets/imagenes";

const VisitUs = lazy(() => import("@/components/VisitUs"));

const appleEase = [0.25, 0.1, 0.25, 1] as const;

const IndexMobile = () => {
  return (
    <Layout>
      <Seo
        title="Touza - Cocktail Bar Premium en Crevillente"
        description="Touza es un cocktail bar premium en Crevillente. Disfruta de cócteles artesanales, ambiente único y nuestro espacio privado El Reservado."
        canonical={canonical("/")}
        keywords={['cocktail bar', 'crevillente', 'cócteles', 'premium', 'reservado', 'eventos']}
        schema={barSchema()}
      />

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

      <Suspense fallback={null}>
        <VisitUs />
      </Suspense>
    </Layout>
  );
};

export default IndexMobile;
