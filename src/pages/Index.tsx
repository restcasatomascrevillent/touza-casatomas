import { useRef } from "react";
import { ArrowRight, Star, MapPin, Clock } from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { OptimizedImage } from "@/components/ui/optimized-image";
import Seo from "@/components/Seo";
import ScrollTextReveal from "@/components/ScrollTextReveal";
import StickyScrollSection from "@/components/StickyScrollSection";
import VisitUs from "@/components/VisitUs";

const Index = () => {
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
      {/* Hero Section - Cinematic & Immersive */}
      <section className="relative h-[100dvh] flex items-center justify-center overflow-hidden w-full">
        {/* Background Image - Slow Zoom Out */}
        <motion.div
          initial={{ scale: 1.15, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 2, ease: "easeOut" }}
          className="absolute inset-0 z-0"
        >
          <OptimizedImage
            src="https://restaurantecasatomascrevillente.es/wp-content/uploads/2023/11/Touza-2-scaled.webp"
            alt="Bar ambiente oscuro y elegante"
            className="w-full h-full object-cover"
            priority={true}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-background/90" />
        </motion.div>

        {/* Content - Staggered Reveal */}
        <div className="relative z-10 container-custom px-6 h-full flex flex-col justify-center text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
            className="mb-6"
          >
            <span className="inline-block text-white/80 text-xs md:text-sm tracking-[0.4em] uppercase font-medium backdrop-blur-md bg-white/5 px-4 py-2 rounded-full border border-white/10">
              Est. 2023 &bull; Crevillente
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 1.2, delay: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="font-serif text-5xl sm:text-7xl md:text-8xl lg:text-[10rem] font-bold text-white mb-6 md:mb-8 tracking-tighter leading-[0.9]"
          >
            TOUZA
          </motion.h1>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.5, delay: 1.2 }}
            className="flex justify-center mb-12"
          >
            <ScrollTextReveal className="text-xl md:text-2xl lg:text-3xl text-white/80 font-light leading-relaxed max-w-2xl mx-auto justify-center">
              Donde la alquimia de los cócteles se encuentra con la excelencia. Un refugio para los sentidos.
            </ScrollTextReveal>
          </motion.div>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.5, ease: "easeOut" }}
            className="flex flex-col sm:flex-row gap-5 justify-center items-center"
          >
            <Button
              asChild
              size="lg"
              className="h-14 px-10 bg-white text-black hover:bg-white/90 text-base font-semibold rounded-full transition-all duration-300 shadow-xl"
            >
              <Link to="/carta">
                Nuestra Carta
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="h-14 px-10 border-white/20 text-white hover:bg-white/10 hover:border-white/40 text-base font-medium rounded-full backdrop-blur-md transition-all duration-300"
            >
              <Link to="/reservado">El Reservado</Link>
            </Button>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 2.5 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce"
        >
          <div className="flex flex-col items-center gap-3">
            <span className="text-[10px] text-white/50 tracking-[0.2em] uppercase">Descubre</span>
            <div className="w-[1px] h-16 bg-gradient-to-b from-transparent via-white/50 to-transparent" />
          </div>
        </motion.div>
      </section>

      {/* Intro Section - Scroll Text Reveal */}
      <section className="py-16 md:py-24 bg-background relative z-20">
        <div className="container-custom max-w-4xl mx-auto px-6 text-center">
          <span className="text-primary text-xs tracking-[0.3em] uppercase mb-8 block font-semibold">
            Filosofía
          </span>
          <ScrollTextReveal className="font-serif text-2xl md:text-5xl lg:text-6xl text-foreground/20 leading-tight justify-center">
            Touza no es solo un bar; es una declaración de intenciones. Un espacio donde el tiempo se detiene y los detalles cobran vida. Fusionamos la tradición gallega con la sofisticación contemporánea.
          </ScrollTextReveal>
        </div>
      </section>

      {/* Sticky Cocktail Showcase */}
      <StickyScrollSection
        title="Cócteles de Autor"
        description="Cada copa que servimos cuenta una historia. Ingredientes seleccionados, técnicas de vanguardia y una presentación que desafía lo convencional para sorprender a tu paladar."
        image="https://restaurantecasatomascrevillente.es/wp-content/uploads/2023/11/Touza-5-scaled.webp"
        ctaText="Ver Carta Completa"
        ctaLink="/carta"
      />

      {/* Sticky Reserved Showcase (Reversed) */}
      <StickyScrollSection
        title="El Privado"
        description="Un espacio exclusivo diseñado para la intimidad. Perfecto para celebraciones especiales o simplemente para desconectar del mundo exterior en un ambiente inigualable."
        image="https://restaurantecasatomascrevillente.es/wp-content/uploads/2023/11/Touza-10.webp"
        ctaText="Reservar ahora"
        ctaLink="/reservado"
        reversed={true}
      />

      {/* Features Grid */}
      <section className="py-16 bg-[#050505] text-white border-t border-white/5">
        <div className="container-custom">
          <div className="grid md:grid-cols-3 gap-8 md:gap-12">
            {features.map((feature, index) => (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                key={index}
                className="text-center group"
              >
                <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-primary/20 transition-colors duration-500">
                  <feature.icon className="w-6 h-6 text-white/70 group-hover:text-primary transition-colors" />
                </div>
                <h4 className="font-serif text-xl text-white mb-3">{feature.title}</h4>
                <p className="text-white/50 leading-relaxed font-light">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* VISIT US SECTION - NUEVA SECCIÓN */}
      <VisitUs />

    </Layout>
  );
};

const features = [
  { icon: Star, title: "Coctelería de Autor", description: "Creaciones únicas que desafían lo convencional." },
  { icon: MapPin, title: "Ubicación Privilegiada", description: "En el corazón de Crevillente, un oasis urbano." },
  { icon: Clock, title: "Ambiente Nocturno", description: "El lugar perfecto para acabar tus noches." }
];

export default Index;
