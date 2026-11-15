import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import Reveal from "@/components/Reveal";
import type { ImagenResponsive } from "@/assets/imagenes";
import Encabezado from "./Encabezado";
import FotoPortada from "./FotoPortada";

interface FotoShowcase {
  imagen: ImagenResponsive;
  alt: string;
}

interface ShowcaseProps {
  /** `id` del título, para el `aria-labelledby` de la sección. */
  id: string;
  antetitulo: string;
  /** El título, ya cortado en líneas. */
  titulo: string[];
  /** Una frase con hechos, no un eslogan. */
  texto: string;
  foto: FotoShowcase;
  /** Segunda foto pequeña que se superpone a la grande (solo en ≥ lg). */
  detalle?: FotoShowcase;
  cta: { texto: string; ruta: string };
  /** Lo que va debajo dentro de la misma sección (el carrusel de cócteles). */
  children?: ReactNode;
}

/**
 * Vitrina de la portada: la foto de la «T» con la del bartender colando
 * superpuesta (el acierto que la auditoría del 15/11/2026 pidió conservar),
 * el título y una frase con hechos.
 *
 * Movimiento: solo la foto grande se destapa (máscara que sube y zoom de 1,1
 * a 1) y el título entra por líneas. Fuera el parallax de las dos fotos y la
 * numeración «01/02», que no era ninguna secuencia.
 */
const Showcase = ({ id, antetitulo, titulo, texto, foto, detalle, cta, children }: ShowcaseProps) => (
  <section aria-labelledby={id} className="py-20 md:py-28 lg:py-36">
    <div className="mx-auto grid max-w-7xl gap-10 px-5 md:px-8 lg:grid-cols-12 lg:items-center lg:gap-x-12 lg:px-10">
      <div className="relative lg:col-span-6 lg:pb-20">
        <Reveal efecto="destapar" className="aspect-[4/5] overflow-hidden rounded-2xl bg-white/5 md:rounded-3xl">
          <FotoPortada imagen={foto.imagen} alt={foto.alt} sizes="(min-width: 1280px) 600px, (min-width: 1024px) 50vw, 100vw" />
        </Reveal>

        {detalle && (
          <div className="absolute bottom-0 -right-10 hidden aspect-[3/4] w-[40%] overflow-hidden rounded-2xl bg-white/5 shadow-[0_30px_60px_-20px_rgb(0_0_0/0.9)] ring-1 ring-white/10 lg:block xl:-right-16">
            <FotoPortada imagen={detalle.imagen} alt={detalle.alt} sizes="260px" />
          </div>
        )}
      </div>

      <div className="lg:col-span-5 lg:col-start-8">
        <Encabezado
          id={id}
          antetitulo={antetitulo}
          lineas={titulo}
          tituloClassName="text-[2.75rem] leading-[0.98] md:text-6xl lg:text-7xl"
        />
        <p className="mt-5 max-w-md text-base leading-relaxed text-white/75 md:mt-7 md:text-lg" style={{ textWrap: "pretty" }}>
          {texto}
        </p>
        <Link to={cta.ruta} className="boton boton-contorno mt-8 md:mt-10">
          {cta.texto}
        </Link>
      </div>
    </div>

    {children}
  </section>
);

export default Showcase;
