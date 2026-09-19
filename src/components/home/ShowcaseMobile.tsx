import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OptimizedImage } from "@/components/ui/optimized-image";
import type { ImagenResponsive } from "@/assets/imagenes";

const appleEase = [0.25, 0.1, 0.25, 1] as const;

interface ShowcaseMobileProps {
  title: string;
  description: string;
  imagen: ImagenResponsive;
  ctaText?: string;
  ctaLink?: string;
  label?: string;
}

const ShowcaseMobile = ({
  title,
  description,
  imagen,
  ctaText = "Descubrir",
  ctaLink = "/carta",
  label = "Touza Experience",
}: ShowcaseMobileProps) => {
  return (
    <section className="py-12 px-5">
      {/* Label */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-30px" }}
        transition={{ duration: 0.5, ease: appleEase }}
        className="flex flex-col items-center gap-2 mb-5"
      >
        <span className="text-primary text-[11px] tracking-[0.3em] uppercase font-medium">
          {label}
        </span>
        <motion.div
          animate={{ y: [0, 4, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          className="w-px h-5 bg-gradient-to-b from-primary/50 to-transparent"
        />
      </motion.div>

      {/* Image — no parallax on mobile for perf */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, margin: "-30px" }}
        transition={{ duration: 0.6, ease: appleEase }}
        className="aspect-[3/4] rounded-2xl overflow-hidden mb-6"
      >
        <OptimizedImage
          imagen={imagen}
          alt={title}
          className="w-full h-full object-cover"
          sizes="100vw"
        />
      </motion.div>

      <motion.h2
        initial={{ opacity: 0, y: 15 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, ease: appleEase }}
        className="font-serif text-[1.75rem] text-foreground mb-3 leading-tight"
      >
        {title}
      </motion.h2>

      <motion.p
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.05, ease: appleEase }}
        className="text-white/70 text-[15px] font-light leading-relaxed mb-6"
      >
        {description}
      </motion.p>

      <Button
        asChild
        size="lg"
        className="w-full h-[52px] bg-white text-black hover:bg-white/90 text-[15px] font-medium rounded-2xl active:scale-[0.98] transition-transform"
      >
        <Link to={ctaLink} className="flex items-center justify-center gap-2">
          {ctaText}
          <ArrowRight className="w-4 h-4" />
        </Link>
      </Button>

      <div className="mt-10 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
    </section>
  );
};

export default ShowcaseMobile;
