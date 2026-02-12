import { motion } from "framer-motion";
import Layout from "@/components/layout/Layout";
import Seo from "@/components/Seo";
import ScrollTextReveal from "@/components/ScrollTextReveal";
import HeroMobile from "./HeroMobile";
import ShowcaseMobile from "./ShowcaseMobile";
import FeaturesMobile from "./FeaturesMobile";
import VisitUs from "@/components/VisitUs";

const appleEase = [0.25, 0.1, 0.25, 1] as const;

const IndexMobile = () => {
  return (
    <Layout>
      <Seo
        title="Touza - Cocktail Bar Premium en Crevillente"
        description="Touza es un cocktail bar premium en Crevillente. Disfruta de cócteles artesanales, ambiente único y nuestro espacio privado El Reservado."
        keywords={['cocktail bar', 'crevillente', 'cócteles', 'premium', 'reservado', 'eventos']}
        schema={{
          "@context": "https://schema.org",
          "@type": "BarOrPub",
          "name": "Touza Cocktail Bar",
          "image": "https://restaurantecasatomascrevillente.es/wp-content/uploads/2023/11/Touza-2-scaled.webp",
          "telephone": "966 782 000",
          "email": "info@touzabar.es",
          "address": {
            "@type": "PostalAddress",
            "streetAddress": "C/ San Vicente, 14",
            "addressLocality": "Crevillente",
            "addressRegion": "Alicante",
            "postalCode": "03330",
            "addressCountry": "ES"
          },
          "url": "https://touzabar.es/",
          "priceRange": "$$"
        }}
      />

      <HeroMobile />

      {/* Philosophy */}
      <section className="py-20 px-8">
        <motion.span
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: appleEase }}
          className="text-primary text-xs tracking-[0.3em] uppercase mb-6 block font-medium text-center"
        >
          Filosofía
        </motion.span>
        <ScrollTextReveal className="font-serif text-2xl text-foreground leading-tight justify-center text-center">
          Touza no es solo un bar; es una declaración de intenciones. Un espacio donde el tiempo se detiene.
        </ScrollTextReveal>
      </section>

      <ShowcaseMobile
        title="Cócteles de Autor"
        description="Cada copa que servimos cuenta una historia. Ingredientes seleccionados y técnicas de vanguardia."
        image="https://restaurantecasatomascrevillente.es/wp-content/uploads/2023/11/Touza-5-scaled.webp"
        ctaText="Ver Carta Completa"
        ctaLink="/carta"
        label="Descubre"
      />

      <ShowcaseMobile
        title="El Privado"
        description="Un espacio exclusivo diseñado para la intimidad. Perfecto para celebraciones especiales."
        image="https://restaurantecasatomascrevillente.es/wp-content/uploads/2023/11/Touza-10.webp"
        ctaText="Reservar ahora"
        ctaLink="/reservado"
        label="Espacio Exclusivo"
      />

      <FeaturesMobile />
      <VisitUs />
    </Layout>
  );
};

export default IndexMobile;
