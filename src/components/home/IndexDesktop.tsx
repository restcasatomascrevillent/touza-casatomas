import { motion } from "framer-motion";
import Layout from "@/components/layout/Layout";
import Seo from "@/components/Seo";
import ScrollTextReveal from "@/components/ScrollTextReveal";
import HeroDesktop from "./HeroDesktop";
import ShowcaseSection from "./ShowcaseSection";
import FeaturesGrid from "./FeaturesGrid";
import VisitUs from "@/components/VisitUs";

const appleEase = [0.25, 0.1, 0.25, 1] as const;

const IndexDesktop = () => {
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

      <HeroDesktop />

      {/* Philosophy */}
      <section className="py-40 bg-background">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.span
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: appleEase }}
            className="text-primary text-xs tracking-[0.3em] uppercase mb-10 block font-medium"
          >
            Filosofía
          </motion.span>
          <ScrollTextReveal className="font-serif text-4xl lg:text-6xl text-foreground/80 leading-tight justify-center">
            Touza no es solo un bar; es una declaración de intenciones. Un espacio donde el tiempo se detiene y los detalles cobran vida.
          </ScrollTextReveal>
        </div>
      </section>

      <ShowcaseSection
        title="Cócteles de Autor"
        description="Cada copa que servimos cuenta una historia. Ingredientes seleccionados, técnicas de vanguardia y una presentación que desafía lo convencional."
        image="https://restaurantecasatomascrevillente.es/wp-content/uploads/2023/11/Touza-5-scaled.webp"
        ctaText="Ver Carta Completa"
        ctaLink="/carta"
      />

      <ShowcaseSection
        title="El Privado"
        description="Un espacio exclusivo diseñado para la intimidad. Perfecto para celebraciones especiales o simplemente para desconectar del mundo exterior."
        image="https://restaurantecasatomascrevillente.es/wp-content/uploads/2023/11/Touza-10.webp"
        ctaText="Reservar ahora"
        ctaLink="/reservado"
        label="Espacio Exclusivo"
      />

      <FeaturesGrid />
      <VisitUs />
    </Layout>
  );
};

export default IndexDesktop;
