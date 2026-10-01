import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Link } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OptimizedImage } from "@/components/ui/optimized-image";
import { HERO_VARIANTE_MOVIL, IMAGENES } from "@/assets/imagenes";
import { HeroBackgroundSVG } from "@/components/ui/svg/HeroBackgroundSVG";
import { QUERY_EFECTOS_SCROLL, useMediaQuery } from "@/hooks/use-media-query";
import { cn } from "@/lib/utils";

/**
 * Hero único de la portada (antes HeroDesktop + HeroMobile, dos árboles que
 * el HTML estático llevaba a la vez). La composición cambia solo con clases
 * responsive, así que el SSG sirve la buena desde el primer pintado:
 *
 * - Móvil: contenido abajo (al alcance del pulgar), botones a lo ancho y una
 *   pista de scroll en línea. `pb-24` deja libre la franja de la barra fija
 *   "Llamar / Reservar" (MobileReserveCTA).
 * - ≥ md: contenido centrado, titular enorme, botones en fila, ondas doradas
 *   y halo. El parallax y el fundido del contenido con el scroll solo se
 *   activan en el navegador (≥ md y sin reduced-motion); en el HTML y en
 *   móvil la foto está quieta.
 *
 * La foto es el LCP: `priority`, sin fundido de opacidad, y el recorte
 * vertical (`HERO_VARIANTE_MOVIL`) en pantallas verticales. Las entradas del
 * texto son CSS (`.entrada-hero`), que arranca sin esperar al JS.
 *
 * La escena 3D se retiró a propósito; para recuperarla, ver el historial
 * (src/components/3d/Scene3D.tsx).
 */
const Hero = () => {
  const ref = useRef<HTMLElement>(null);
  const efectos = useMediaQuery(QUERY_EFECTOS_SCROLL);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <section
      ref={ref}
      className="relative h-[100dvh] min-h-[34rem] flex items-end justify-center overflow-hidden px-5 pb-24 md:items-center md:px-6 md:pb-0"
    >
      <motion.div style={efectos ? { y } : undefined} className="absolute inset-0 z-0 bg-black">
        <div className="absolute inset-0 md:ken-burns">
          <OptimizedImage
            imagen={IMAGENES.interior}
            alt="Interior de Touza: sofá corrido color mostaza, mesas de mármol y luz cálida"
            className="w-full h-full object-cover opacity-50 md:opacity-60"
            sizes="100vw"
            variante={HERO_VARIANTE_MOVIL}
            priority={true}
          />
        </div>

        <HeroBackgroundSVG className="hidden md:block" />

        {/* Halo cálido estático detrás del titular. */}
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none hidden md:block bg-[radial-gradient(ellipse_45%_40%_at_50%_48%,hsl(var(--gold)/0.14),transparent_70%)]"
        />

        <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-black/40 via-black/20 to-black md:from-black/70 md:via-black/40 md:to-black/90" />
      </motion.div>

      {/* Fundido con la sección siguiente: con el parallax la foto baja y
          dejaba un corte duro. */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 h-40 z-[1] bg-gradient-to-t from-background to-transparent pointer-events-none"
      />

      <motion.div style={efectos ? { opacity } : undefined} className="relative z-10 w-full text-center md:w-auto">
        {/* El h1 ya dice "Cocktail Bar en Crevillente" para lectores de
            pantalla; esta línea es solo visual. */}
        <p
          aria-hidden="true"
          className="entrada-hero text-white/70 text-[10px] min-[360px]:text-[11px] md:text-xs tracking-[0.3em] md:tracking-[0.5em] uppercase font-light mb-4 md:mb-8"
          style={{ animationDelay: "0.05s" }}
        >
          Cocktail bar · Crevillente
        </p>

        <h1
          className="entrada-hero font-serif font-bold text-white leading-[0.85] tracking-tighter mb-4 md:mb-8 text-[4.25rem] min-[400px]:text-[5rem] sm:text-[7rem] md:text-[8.5rem] lg:text-[10rem] xl:text-[12rem]"
          style={{ animationDelay: "0.15s" }}
        >
          TOUZA
          <span className="sr-only"> · Cocktail Bar en Crevillente</span>
        </h1>

        <p
          className="entrada-hero text-white/80 font-light leading-relaxed mx-auto text-[15px] max-w-[260px] mb-8 md:text-xl md:max-w-lg md:mb-14"
          style={{ textWrap: "balance", animationDelay: "0.3s" }}
        >
          Donde la alquimia de los cócteles se encuentra con la excelencia.
        </p>

        <div
          className="entrada-hero flex flex-col gap-3 w-full md:flex-row md:justify-center md:gap-5 md:w-auto"
          style={{ animationDelay: "0.45s" }}
        >
          <Button
            asChild
            size="lg"
            className={cn(
              "h-[52px] w-full rounded-2xl bg-white text-black hover:bg-white/90 text-[15px] font-medium",
              "transition-all duration-300 active:scale-[0.98]",
              "md:h-14 md:w-auto md:px-10 md:rounded-full md:text-base"
            )}
          >
            <Link to="/carta">Nuestra Carta</Link>
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            className={cn(
              "h-[52px] w-full rounded-2xl border-white/20 bg-transparent text-white hover:bg-white/10 hover:text-white hover:border-white/40 text-[15px] font-light backdrop-blur-sm",
              "transition-all duration-300 active:scale-[0.98]",
              "md:h-14 md:w-auto md:px-10 md:rounded-full md:text-base"
            )}
          >
            <Link to="/reservado">El Reservado</Link>
          </Button>
        </div>

        {/* Pista de scroll hasta lg: en línea, porque abajo está la barra fija. */}
        <div aria-hidden="true" className="pista-scroll mt-4 flex justify-center md:mt-8 lg:hidden">
          <ChevronDown className="oscilar w-5 h-5 text-white/40" />
        </div>
      </motion.div>

      {/* Pista de scroll en escritorio: una línea al pie del hero. */}
      {/* Centrado con flex y no con translate: la animación de entrada usa
          `transform` y lo pisaría. */}
      <div aria-hidden="true" className="pista-scroll absolute inset-x-0 bottom-10 z-10 hidden lg:flex justify-center pointer-events-none">
        <div className="oscilar w-px h-12 bg-gradient-to-b from-white/50 to-transparent" />
      </div>
    </section>
  );
};

export default Hero;
