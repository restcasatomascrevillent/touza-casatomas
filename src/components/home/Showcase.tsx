import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OptimizedImage } from "@/components/ui/optimized-image";
import Reveal from "@/components/Reveal";
import type { ImagenResponsive } from "@/assets/imagenes";
import { QUERY_EFECTOS_SCROLL, useMediaQuery } from "@/hooks/use-media-query";
import { cn } from "@/lib/utils";

interface FotoShowcase {
  imagen: ImagenResponsive;
  alt: string;
}

interface ShowcaseProps {
  /** Número de la vitrina ("01", "02"): marca el ritmo editorial. */
  indice: string;
  label: string;
  title: string;
  description: string;
  foto: FotoShowcase;
  /** Segunda foto pequeña que se superpone a la grande (solo en ≥ lg). */
  detalle?: FotoShowcase;
  ctaText: string;
  ctaLink: string;
  /** Foto a la derecha y texto a la izquierda (≥ md). */
  invertido?: boolean;
}

/**
 * Vitrina de la portada (antes ShowcaseSection + ShowcaseMobile).
 *
 * Antes las dos vitrinas eran idénticas: foto 16:9 a todo el ancho y texto
 * centrado debajo, dos veces seguidas. Ahora, a partir de md, son de dos
 * columnas y se alternan (`invertido`), con la foto en vertical (las fotos
 * del local lo son: el 16:9 las recortaba mucho) y una segunda foto pequeña
 * superpuesta en escritorio. En móvil se mantiene lo que ya funcionaba: foto
 * 3:4, título, texto y botón blanco a lo ancho.
 */
const Showcase = ({ indice, label, title, description, foto, detalle, ctaText, ctaLink, invertido = false }: ShowcaseProps) => {
  const fotoRef = useRef<HTMLDivElement>(null);
  const parallax = useMediaQuery(QUERY_EFECTOS_SCROLL);
  const { scrollYProgress } = useScroll({ target: fotoRef, offset: ["start end", "end start"] });
  const fotoY = useTransform(scrollYProgress, [0, 1], ["-6%", "6%"]);
  const detalleY = useTransform(scrollYProgress, [0, 1], ["30px", "-30px"]);

  return (
    <section className={cn("px-5 py-8 md:px-6 md:py-20 lg:py-28", detalle && "lg:pb-40")}>
      <div className="max-w-7xl mx-auto grid gap-6 md:grid-cols-12 md:gap-x-8 md:items-center lg:gap-x-12">
        <Reveal
          y={32}
          scale={0.98}
          className={cn(
            "relative md:row-start-1 md:col-span-6",
            invertido ? "md:col-start-7" : "md:col-start-1"
          )}
        >
          <div
            ref={fotoRef}
            className="relative aspect-[3/4] md:aspect-[4/5] rounded-2xl md:rounded-3xl overflow-hidden bg-muted"
          >
            <motion.div
              style={parallax ? { y: fotoY } : undefined}
              className="absolute inset-0 md:-inset-y-[7%]"
            >
              <OptimizedImage
                imagen={foto.imagen}
                alt={foto.alt}
                className="w-full h-full object-cover"
                sizes="(min-width: 1280px) 640px, (min-width: 768px) 50vw, calc(100vw - 2.5rem)"
              />
            </motion.div>
            <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent pointer-events-none" />
          </div>

          {detalle && (
            <motion.div
              style={parallax ? { y: detalleY } : undefined}
              className={cn(
                "hidden lg:block absolute -bottom-16 w-[38%] aspect-[3/4] rounded-2xl overflow-hidden",
                "ring-1 ring-white/10 shadow-[0_30px_60px_-20px_rgba(0,0,0,0.9)]",
                invertido ? "-left-16" : "-right-16"
              )}
            >
              <OptimizedImage
                imagen={detalle.imagen}
                alt={detalle.alt}
                className="w-full h-full object-cover"
                sizes="260px"
              />
            </motion.div>
          )}
        </Reveal>

        <div
          className={cn(
            "md:row-start-1 md:col-span-6 lg:col-span-5",
            invertido ? "md:col-start-1" : "md:col-start-7 lg:col-start-8"
          )}
        >
          <Reveal className="flex items-center gap-3 mb-3 md:mb-6">
            <span className="font-serif text-primary text-lg md:text-xl tabular-nums leading-none">{indice}</span>
            <span aria-hidden="true" className="h-px w-8 md:w-12 bg-primary/40" />
            <span className="text-primary text-[11px] md:text-xs tracking-[0.3em] uppercase font-medium">{label}</span>
          </Reveal>

          <Reveal
            as="h2"
            delay={0.08}
            className="font-serif text-[2rem] leading-[1.05] md:text-5xl lg:text-6xl xl:text-7xl md:leading-[0.95] text-foreground mb-4 md:mb-6"
            style={{ textWrap: "balance" }}
          >
            {title}
          </Reveal>

          <Reveal
            as="p"
            delay={0.16}
            className="text-white/70 text-[15px] md:text-lg lg:text-xl font-light leading-relaxed mb-6 md:mb-10 max-w-md"
            style={{ textWrap: "pretty" }}
          >
            {description}
          </Reveal>

          <Reveal delay={0.24}>
            <Button
              asChild
              size="lg"
              className={cn(
                "group w-full h-12 rounded-full bg-white text-black hover:bg-white/90 text-[15px] font-medium active:scale-[0.98] transition-all duration-300",
                "md:w-auto md:h-14 md:px-10 md:rounded-full md:bg-transparent md:text-foreground md:border md:border-foreground/20",
                "md:hover:bg-foreground md:hover:text-background md:text-lg md:font-light"
              )}
            >
              <Link to={ctaLink}>
                {ctaText}
                <ArrowRight className="w-4 h-4 md:w-5 md:h-5 transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true" />
              </Link>
            </Button>
          </Reveal>
        </div>
      </div>
    </section>
  );
};

export default Showcase;
