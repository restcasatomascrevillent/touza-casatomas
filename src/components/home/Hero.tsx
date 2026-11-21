import { Link } from "react-router-dom";
import { HERO_VARIANTE_MOVIL, IMAGENES } from "@/assets/imagenes";
import { LOCALIDAD } from "./hechos";

// React 18 aún no conoce `fetchPriority` en camelCase: se escribe en minúsculas.
const PRIORIDAD_ALTA = { fetchpriority: "high" } as Record<string, string>;

/**
 * Hero de la portada: el de la web de antes (v0.0), que es el que quiere el
 * dueño (16/11/2026). La foto del salón (`touza-2`: el sofá mostaza visto
 * desde arriba) a pantalla completa, TOUZA centrado y dos botones.
 *
 * Sin texto (17/11/2026, el dueño: «una cosa es el SEO, pero es más
 * importante que se vea bien»): solo el rótulo pequeño, TOUZA y los dos
 * botones. Lo que había debajo de TOUZA ha bajado de sitio: «Coctelería y bar
 * de copas en Crevillent, junto a Casa Tomás.» está en «El local» y «Sin
 * reservas: ven directamente.», en «Visítanos», junto al horario. Para
 * buscadores y lectores de pantalla, el <h1> sigue diciendo «Coctelería y
 * bar de copas en Crevillent» (la parte que no se ve).
 *
 * - Móvil: el texto abajo, al alcance del pulgar, sobre un degradado que lo
 *   hace legible; los dos botones en una fila. El alto es `100svh` (no salta
 *   al esconderse la barra del navegador) y es un MÍNIMO: en horizontal o con
 *   la letra grande el hero crece en vez de recortar el texto.
 * - Desde md: todo centrado y el titular enorme.
 *
 * Sin vídeo, sin tramo fijo y sin parallax: una foto quieta y nítida. Lo
 * único que se mueve es la entrada del texto (CSS, `.entrada-hero`).
 *
 * Nitidez. La foto es un <picture> con dirección de arte:
 * - Pantallas verticales (`HERO_VARIANTE_MOVIL`): el recorte central
 *   1080×1708, a toda la altura del maestro. `sizes="64vh"` es el ancho real
 *   con el que `object-cover` lo pinta (alto de pantalla × 1080/1708).
 * - El resto: la apaisada, con variantes hasta 2560 px (el ancho del
 *   maestro). `sizes` es el mayor de 100vw y 150vh: en una pantalla más
 *   cuadrada que 3:2, `object-cover` la pinta más ancha que la ventana.
 * Es el LCP: `fetchpriority="high"`, sin carga diferida y sin fundido.
 */
const Hero = () => (
  <section className="hero-portada alto-pantalla relative flex items-end justify-center overflow-hidden px-5 pt-28 md:h-[100svh] md:min-h-[36rem] md:items-center md:px-6 md:pt-0 apaisado:h-auto apaisado:min-h-[100svh] apaisado:pt-[4.5rem] apaisado:pb-[calc(var(--barra-movil)+1.5rem)]">
    <div className="absolute inset-0 z-0 bg-black">
      <picture>
        <source
          type="image/avif"
          media={HERO_VARIANTE_MOVIL.media}
          srcSet={HERO_VARIANTE_MOVIL.imagen.avif}
          sizes={HERO_VARIANTE_MOVIL.sizes}
        />
        <source
          type="image/webp"
          media={HERO_VARIANTE_MOVIL.media}
          srcSet={HERO_VARIANTE_MOVIL.imagen.webp}
          sizes={HERO_VARIANTE_MOVIL.sizes}
        />
        <source type="image/avif" srcSet={IMAGENES.interior.avif} sizes={SIZES_APAISADA} />
        <source type="image/webp" srcSet={IMAGENES.interior.webp} sizes={SIZES_APAISADA} />
        <img
          src={IMAGENES.interior.src}
          alt="El salón de Touza: sofá corrido color mostaza, mesas de mármol y luz cálida"
          width={IMAGENES.interior.width}
          height={IMAGENES.interior.height}
          loading="eager"
          decoding="sync"
          {...PRIORIDAD_ALTA}
          className="h-full w-full object-cover opacity-80 md:opacity-65"
        />
      </picture>

      {/* Desde md, sombra suave detrás del texto: la foto se queda viva en
          los bordes y la letra pequeña se lee encima del sofá y del mármol. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 hidden bg-[radial-gradient(ellipse_42%_46%_at_50%_46%,rgb(0_0_0/0.5),transparent_78%)] md:block"
      />

      {/* En el móvil el texto va abajo: la foto se ve viva arriba y se
          oscurece donde está el texto. Desde md, un velo parejo. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,rgb(0_0_0/0.5)_0%,rgb(0_0_0/0.05)_20%,rgb(0_0_0/0.3)_48%,rgb(0_0_0/0.86)_72%,hsl(var(--background))_100%)] md:bg-none md:bg-gradient-to-b md:from-black/65 md:via-black/35 md:to-black/85"
      />
    </div>

    {/* Fundido con la sección siguiente. */}
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] hidden h-32 bg-gradient-to-t from-background to-transparent md:block"
    />

    <div className="relative z-10 w-full text-center md:w-auto">
      {/* El h1 ya dice «Coctelería y bar de copas en Crevillent» para lectores
          de pantalla; esta línea es solo visual. */}
      <p
        aria-hidden="true"
        className="entrada-hero mb-4 text-xs font-medium uppercase tracking-[0.32em] text-primary md:mb-10 md:text-sm md:tracking-[0.45em] md:text-white md:[text-shadow:0_1px_3px_rgb(0_0_0/0.9),0_2px_18px_rgb(0_0_0/0.85)] apaisado:mb-3"
        style={{ animationDelay: "0.05s" }}
      >
        Coctelería · {LOCALIDAD}
      </p>

      <h1
        className="entrada-marca mb-9 font-serif text-[4.25rem] font-bold leading-[0.85] tracking-tighter text-white [text-shadow:0_4px_30px_rgb(0_0_0/0.45)] min-[400px]:text-[5rem] min-[420px]:text-[5.5rem] sm:text-[7rem] md:mb-16 md:text-[8.5rem] md:[text-shadow:0_6px_50px_rgb(0_0_0/0.4)] lg:text-[10rem] xl:text-[12rem] apaisado:mb-6 apaisado:text-[4.5rem]"
        style={{ animationDelay: "0.15s" }}
      >
        TOUZA
        <span className="sr-only"> · Coctelería y bar de copas en {LOCALIDAD}</span>
      </h1>

      <div
        className="entrada-hero mx-auto grid w-full max-w-sm grid-cols-2 gap-3 md:flex md:w-auto md:max-w-none md:justify-center md:gap-5"
        style={{ animationDelay: "0.3s" }}
      >
        <Link to="/carta" className="boton boton-macizo px-3 md:px-10">
          Ver la carta
        </Link>
        <Link to="/contacto" className="boton boton-contorno border-white/60 bg-black/40 px-3 font-normal backdrop-blur-md hover:bg-black/55 md:px-10 md:font-medium">
          Cómo llegar
        </Link>
      </div>
    </div>
  </section>
);

/**
 * `object-cover` pinta la apaisada (3:2) al ancho de la ventana o, si la
 * ventana es más cuadrada que 3:2, a 1,5 veces su alto.
 */
const SIZES_APAISADA = "max(100vw, 150vh)";

export default Hero;
