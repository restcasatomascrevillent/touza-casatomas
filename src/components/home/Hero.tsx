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
 * - Móvil: contenido abajo (al alcance del pulgar) sobre un degradado que lo
 *   hace legible encima de la foto, y dos botones en una fila. El alto es
 *   `100svh` (el viewport con la barra del navegador desplegada: no salta al
 *   hacer scroll, a diferencia de `dvh`) y es un MÍNIMO: en horizontal o con
 *   la letra del sistema grande el hero crece en vez de recortar el texto.
 *   El padding inferior deja libre la barra fija "Cómo llegar"
 *   (BarraAccionesMovil), con su zona segura (`--barra-movil`).
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
      className="alto-pantalla relative flex items-end justify-center overflow-hidden px-5 pt-28 pb-[calc(var(--barra-movil)+1.75rem)] md:h-[100dvh] md:min-h-[34rem] md:items-center md:px-6 md:pt-0 md:pb-0 apaisado:h-auto apaisado:min-h-[100svh] apaisado:pt-[4.5rem] apaisado:pb-[calc(var(--barra-movil)+1.5rem)]"
    >
      <motion.div style={efectos ? { y } : undefined} className="absolute inset-0 z-0 bg-black">
        <div className="absolute inset-0 md:ken-burns">
          <OptimizedImage
            imagen={IMAGENES.interior}
            alt="Interior de Touza: sofá corrido color mostaza, mesas de mármol y luz cálida"
            className="w-full h-full object-cover opacity-75 md:opacity-60"
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

        {/* En móvil el texto va en la mitad de abajo: la foto se ve viva arriba y
            se oscurece donde está el texto (antes, foto al 50 % y degradado
            suave: el conjunto quedaba apagado y el texto, justo). */}
        <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(to_bottom,rgb(0_0_0/0.55)_0%,rgb(0_0_0/0.05)_22%,rgb(0_0_0/0.35)_45%,rgb(0_0_0/0.85)_68%,hsl(var(--background))_100%)] md:bg-gradient-to-b md:from-black/70 md:via-black/40 md:to-black/90" />
      </motion.div>

      {/* Fundido con la sección siguiente: con el parallax la foto baja y
          dejaba un corte duro. */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 h-40 z-[1] bg-gradient-to-t from-background to-transparent pointer-events-none"
      />

      {/* En el móvil, mientras está abierto el aviso de cookies (primera
          visita), el texto y los botones suben lo que mide el aviso
          (`--aviso-cookies`, lo publica CookieConsent) para que no queden
          debajo. Con `transform`: no mueve el diseño ni cuenta para el CLS. */}
      <motion.div
        style={efectos ? { opacity } : undefined}
        className="relative z-10 w-full text-center md:w-auto -translate-y-[var(--aviso-cookies,0px)] transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] md:translate-y-0 apaisado:translate-y-0"
      >
        {/* El h1 ya dice "Cocktail Bar en Crevillente" para lectores de
            pantalla; esta línea es solo visual. */}
        <p
          aria-hidden="true"
          className="entrada-hero text-primary text-xs tracking-[0.32em] md:text-white/70 md:tracking-[0.5em] uppercase font-medium md:font-light mb-3 md:mb-8 apaisado:mb-3"
          style={{ animationDelay: "0.05s" }}
        >
          Cocktail bar · Crevillente
        </p>

        <h1
          className="entrada-hero font-serif font-bold text-white leading-[0.85] tracking-tighter mb-4 md:mb-8 [text-shadow:0_4px_30px_rgb(0_0_0/0.45)] md:[text-shadow:none] text-[4.25rem] min-[400px]:text-[5rem] min-[420px]:text-[5.5rem] sm:text-[7rem] md:text-[8.5rem] lg:text-[10rem] xl:text-[12rem] apaisado:text-[4.5rem] apaisado:mb-3"
          style={{ animationDelay: "0.15s" }}
        >
          TOUZA
          <span className="sr-only"> · Cocktail Bar en Crevillente</span>
        </h1>

        <p
          className="entrada-hero text-white/85 font-light leading-relaxed mx-auto text-base max-w-[18rem] mb-7 md:text-xl md:text-white/80 md:max-w-lg md:mb-14 apaisado:text-base apaisado:mb-5"
          style={{ textWrap: "balance", animationDelay: "0.3s" }}
        >
          Donde la alquimia de los cócteles se encuentra con la excelencia.
        </p>

        <div
          className="entrada-hero grid grid-cols-2 gap-3 w-full max-w-sm mx-auto md:flex md:max-w-none md:justify-center md:gap-5 md:w-auto"
          style={{ animationDelay: "0.45s" }}
        >
          <Button
            asChild
            size="lg"
            className={cn(
              "h-12 w-full px-3 rounded-full bg-white text-black hover:bg-white/90 text-[15px] font-medium",
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
              "h-12 w-full px-3 rounded-full border-white/30 bg-black/20 text-white hover:bg-white/10 hover:text-white hover:border-white/50 text-[15px] font-normal backdrop-blur-sm md:border-white/20 md:bg-transparent md:font-light",
              "transition-all duration-300 active:scale-[0.98]",
              "md:h-14 md:w-auto md:px-10 md:rounded-full md:text-base"
            )}
          >
            {/* Antes "El Reservado": Touza ya no acepta reservas por la web
                (01/10/2026). La segunda salida es dónde está y cuándo abre. */}
            <Link to="/contacto">Visítanos</Link>
          </Button>
        </div>

        {/* Pista de scroll en tablet: en línea, porque abajo está la barra fija.
            En el móvil sobra: la barra ya ocupa ese sitio y el contenido de
            debajo asoma. */}
        <div aria-hidden="true" className="pista-scroll mt-8 hidden md:flex justify-center lg:hidden apaisado:hidden">
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
