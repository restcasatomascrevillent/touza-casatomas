import { Link } from "react-router-dom";
import { IMAGENES, type ImagenResponsive } from "@/assets/imagenes";
import FotoPortada from "./FotoPortada";

/**
 * Las «tres puertas» de la portada (rediseño A, 21/11/2026): justo bajo el
 * hero, tres fotos grandes que llevan a su pestaña de /carta, cada una con
 * una palabra grande. Sin precios ni datos (pedido del dueño, 21/11/2026).
 *
 * - Móvil: carrusel horizontal con scroll-snap, cada puerta al 78 % del
 *   ancho (se ve asomar la siguiente) y 430 px de alto.
 * - Desde md: tres columnas de 600 px de alto.
 *
 * Las fotos son las del repo (AVIF/WebP hasta 1600 px), diferidas: el LCP
 * sigue siendo la foto del salón del hero.
 */
interface Puerta {
  id: string;
  palabra: string;
  href: string;
  imagen: ImagenResponsive;
  alt: string;
}

const PUERTAS: readonly Puerta[] = [
  {
    id: "cocteles",
    palabra: "Cócteles",
    href: "/carta#cocteles",
    imagen: IMAGENES.copaRoja,
    alt: "Cóctel rojo con espuma en copa coupé, sobre la barra de Touza",
  },
  {
    id: "champagne",
    palabra: "Champagne",
    href: "/carta#champagne",
    imagen: IMAGENES.champanMesa,
    alt: "Botellas de champagne Laurent-Perrier y una copa servida sobre el mármol",
  },
  {
    id: "destilados",
    palabra: "Destilados",
    href: "/carta#destilados",
    imagen: IMAGENES.botellero,
    alt: "El botellero de Touza iluminado en dorado, con whiskies y tequilas",
  },
];

const TresPuertas = () => {
  const puertas = PUERTAS;

  return (
    <section aria-labelledby="puertas-titulo" className="relative z-20 pt-10 md:pt-20">
      <h2 id="puertas-titulo" className="sr-only">
        La carta de Touza
      </h2>
      <ul className="mx-auto flex max-w-7xl snap-x snap-mandatory gap-2.5 overflow-x-auto scroll-px-5 px-5 pb-1 scrollbar-hide md:grid md:grid-cols-3 md:gap-4 md:overflow-visible md:px-8 lg:px-10">
        {puertas.map((puerta) => (
          <li key={puerta.id} className="w-[78%] shrink-0 snap-center md:w-auto">
            <Link
              to={puerta.href}
              className="fondo-foto group relative block h-[430px] overflow-hidden rounded-[18px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-4 focus-visible:ring-offset-background md:h-[600px]"
            >
              <FotoPortada
                imagen={puerta.imagen}
                alt={puerta.alt}
                sizes="(min-width: 1280px) 400px, (min-width: 768px) 33vw, 78vw"
                className="transition-transform duration-[1200ms] ease-[cubic-bezier(.2,.8,.2,1)] group-hover:scale-[1.04] motion-reduce:transition-none"
              />
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,transparent_45%,rgb(0_0_0/0.8))]"
              />
              <div className="absolute inset-x-5 bottom-5 flex items-end md:inset-x-7 md:bottom-7">
                <span className="font-serif text-[2.6rem] font-medium leading-[0.95] text-white md:text-5xl lg:text-[4rem]">
                  {puerta.palabra}
                </span>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
};

export default TresPuertas;
