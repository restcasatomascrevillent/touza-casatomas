import { Link } from "react-router-dom";
import { Navigation } from "lucide-react";
import { URL_COMO_LLEGAR } from "@/lib/negocio";
import HeroVideo, { HeroFondo } from "./HeroVideo";
import LineaHechos from "./LineaHechos";

/**
 * Hero de la portada: un escenario a pantalla completa (100svh), a sangre,
 * en móvil y en escritorio. Es el momento fuerte de la web; en la primera
 * pantalla no compite nada más (la cabecera va transparente y sin logo, y la
 * barra «Cómo llegar» del móvil no aparece hasta bajar; ver index.css).
 *
 * - El vídeo es vertical (9:16) y no se estira. En el móvil llena la
 *   pantalla. En escritorio ocupa toda la altura, desplazado a la derecha, y
 *   los laterales son la misma imagen muy desenfocada y oscura (HeroFondo).
 * - TOUZA, enorme, abajo a la izquierda: su T habla con la T iluminada del
 *   vídeo y en escritorio entra un poco en él.
 * - Debajo, solo la línea de hechos, «Cómo llegar» (el único botón blanco,
 *   a la ruta de Google Maps) y «Ver la carta», discreto.
 *
 * Un solo momento de scroll, en CSS (`.hero-escenario` en index.css): al
 * empezar a bajar, el hero se queda fijo un tramo corto (`sticky`, 25svh)
 * mientras el vídeo hace un zoom lento hacia dentro y el título se
 * desvanece; después sube la sección de cócteles, que entra por encima del
 * final del hero (`.tras-hero`). Antes el tramo era de 50svh y el velo
 * llegaba al 80 % de negro: al bajar quedaba casi una pantalla en negro
 * (auditoría visual v0.10, fallo 2).
 *
 * En escritorio el vídeo vertical se funde por los lados con el fondo
 * desenfocado (máscara), en vez de una caja con sombra y bordes duros. Sin `animation-timeline`, con «reducir
 * movimiento» o con muy poco alto (móvil en horizontal) no hay ni tramo fijo
 * ni efecto: el hero es una pantalla normal. En el HTML del SSG todo se ve.
 *
 * LCP: el póster (o la foto) es un <img fetchpriority="high"> en el HTML; el
 * vídeo entra después de `load` (HeroVideo).
 */
const Hero = () => (
  <div className="hero-escenario relative">
    {/* Fondo cálido (la pared trenzada y la luz de la T del póster) en vez de
        negro: es lo que se ve en el primer instante, mientras llega el póster. */}
    <section className="sticky top-0 isolate h-[100svh] min-h-[30rem] overflow-hidden bg-[radial-gradient(75%_85%_at_68%_45%,#3d2c1c_0%,#1b130c_55%,hsl(var(--background))_100%)] apaisado:relative apaisado:h-auto apaisado:min-h-[100svh]">
      {/* Lo que hace el zoom: el fondo desenfocado y el vídeo. El marco que lo
          recorta acaba 2 px antes del borde: con el zoom, la capa ampliada
          dejaba una línea de 1 px de la foto bajo el degradado al salir. */}
      <div className="absolute inset-x-0 top-0 bottom-[2px] overflow-hidden">
        <div className="hero-zoom absolute inset-0 lg:origin-[70%_50%]">
          <div aria-hidden="true" className="absolute inset-0 hidden overflow-hidden lg:block">
            <HeroFondo />
          </div>
          <div className="absolute inset-0 lg:left-auto lg:right-[9%] lg:aspect-[9/16] lg:h-full lg:[mask-image:linear-gradient(to_right,transparent,#000_14%,#000_86%,transparent)] xl:right-[11%]">
            {/* En el móvil, bien separado del botón del menú (antes, a 28 px). */}
            <HeroVideo botonClassName="right-4 top-[6.75rem] lg:top-auto lg:bottom-8 lg:right-[16%]" />
          </div>
        </div>
      </div>

      {/* Legibilidad del texto: oscurece abajo y acaba en el color de fondo,
          para que al subir el hero no quede un corte con la sección siguiente. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,rgb(0_0_0/0.45)_0%,rgb(0_0_0/0)_20%,rgb(0_0_0/0.1)_42%,rgb(0_0_0/0.78)_72%,hsl(var(--background))_97%)] lg:bg-[linear-gradient(to_bottom,rgb(0_0_0/0.35)_0%,rgb(0_0_0/0)_25%,rgb(0_0_0/0.15)_50%,rgb(0_0_0/0.82)_86%,hsl(var(--background))_97%)]"
      />
      {/* Se oscurece del todo al final del tramo fijo (transparente en reposo). */}
      <div aria-hidden="true" className="hero-velo pointer-events-none absolute inset-0" />

      {/* `pointer-events-none`: deja pulsar el botón de pausa del vídeo. */}
      <div className="hero-contenido pointer-events-none relative z-10 mx-auto flex h-full max-w-[110rem] flex-col justify-end px-5 pt-24 md:px-8 lg:px-12 apaisado:pt-20">
        <h1 className="hero-titulo text-cream">
          <span
            className="entrada-marca block font-serif font-bold leading-[0.78] tracking-[-0.04em] [text-shadow:0_8px_60px_rgb(0_0_0/0.5)] text-[26vw] md:text-[24vw] lg:text-[clamp(9rem,21vw,26rem)] apaisado:text-[6rem]"
            style={{ animationDelay: "0.1s" }}
          >
            TOUZA
          </span>
          <span className="sr-only"> · Coctelería y bar de copas en Crevillent</span>
        </h1>

        {/* Dos capas: la de fuera se desvanece con el scroll (`.hero-pie`) y la
            de dentro hace la entrada (`.entrada-hero`); en el mismo elemento
            una animación pisaría a la otra. */}
        <div className="hero-pie mt-6 md:mt-8 lg:mt-10 apaisado:mt-4">
          <div
            className="entrada-hero flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between lg:gap-12 apaisado:gap-4"
            style={{ animationDelay: "0.3s" }}
          >
            <LineaHechos />
            <div className="pointer-events-auto flex shrink-0 items-center gap-7">
              <a
                href={URL_COMO_LLEGAR}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Cómo llegar a Touza (abre Google Maps)"
                className="boton boton-macizo"
              >
                <Navigation className="h-4 w-4" aria-hidden="true" />
                Cómo llegar
              </a>
              <Link
                to="/carta"
                className="inline-flex min-h-11 items-center rounded text-[15px] font-medium text-white/80 underline decoration-white/30 underline-offset-[6px] transition-colors hover:text-white hover:decoration-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary md:text-base"
              >
                Ver la carta
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
);

export default Hero;
