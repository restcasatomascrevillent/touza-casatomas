import { motion } from "framer-motion";
import { lazy, Suspense } from "react";
import Layout from "@/components/layout/Layout";
import Seo from "@/components/Seo";
import HeroMobile from "./HeroMobile";
import ShowcaseMobile from "./ShowcaseMobile";
import FeaturesMobile from "./FeaturesMobile";

const VisitUs = lazy(() => import("@/components/VisitUs"));

const appleEase = [0.25, 0.1, 0.25, 1] as const;

const IndexMobile = () => {
  return (
    <Layout>
      <Seo
        title="Touza - Cocktail Bar Premium en Crevillente"
        description="Touza es un cocktail bar premium en Crevillente. Disfruta de cócteles artesanales, ambiente único y nuestro espacio privado El Reservado."
        canonical="https://touzabar.es/"
        keywords={['cocktail bar', 'crevillente', 'cócteles', 'premium', 'reservado', 'eventos']}
        schema={{
          "@context": "https://schema.org",
          "@type": "BarOrPub",
          "name": "Touza Cocktail Bar",
          "image": "https://restaurantecasatomascrevillente.es/wp-content/uploads/2023/11/Touza-2-scaled.webp",
          "telephone": "+34966782000",
          "email": "info@touzabar.es",
          "address": {
            "@type": "PostalAddress",
            "streetAddress": "C/ San Vicente, 14",
            "addressLocality": "Crevillente",
            "addressRegion": "Alicante",
            "postalCode": "03330",
            "addressCountry": "ES"
          },
          "geo": {
            "@type": "GeoCoordinates",
            "latitude": 38.2493699,
            "longitude": -0.8111399
          },
          "url": "https://touzabar.es/",
          "sameAs": [
            "https://www.instagram.com/touzabar/",
            "https://www.facebook.com/touzabar/"
          ],
          "acceptsReservations": true,
          "servesCuisine": ["Cócteles", "Tapas"],
          "priceRange": "$$"
        }}
      />

      <HeroMobile />

      {/* Philosophy — simple fade, no scroll-reveal on mobile */}
      <section className="py-16 px-5">
        <motion.span
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: appleEase }}
          className="text-primary text-[11px] tracking-[0.3em] uppercase mb-4 block font-medium text-center"
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

      <Suspense fallback={null}>
        <VisitUs />
      </Suspense>
    </Layout>
  );
};

export default IndexMobile;
