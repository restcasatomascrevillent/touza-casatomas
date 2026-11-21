import { useMemo } from "react";
import { Link } from "react-router-dom";
import { IMAGENES, type ImagenResponsive } from "@/assets/imagenes";
import { useCocteles } from "@/hooks/useCocteles";
import { useEspumosos, esChampagne } from "@/hooks/useVinos";
import { useBebidasTouza } from "@/hooks/useBebidas";
import { sinDuplicados } from "@/lib/negocio";
import { datoPuertaChampagne, datoPuertaCocteles, datoPuertaDestilados } from "@/lib/carta";
import { agruparDestilados, familiasDestilados } from "@/lib/destilados";
import FotoPortada from "./FotoPortada";

/**
 * Las «tres puertas» de la portada (rediseño A, 21/11/2026): justo bajo el
 * hero y montadas un poco encima, tres fotos grandes que llevan a su pestaña
 * de /carta. Una palabra grande y un dato pequeño sacado de la carta (cuántos
 * cócteles, desde cuánto la copa de champagne, qué destilados hay).
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
  dato: string[] | null;
}

const TresPuertas = () => {
  const { data: cocteles } = useCocteles();
  const { data: espumosos } = useEspumosos();
  const { data: bebidas } = useBebidasTouza();

  const puertas = useMemo<Puerta[]>(() => {
    const listaBebidas = sinDuplicados(bebidas ?? []);
    const copasChampagne = listaBebidas.filter((b) => b.categoria === "Copas" && /^champagne$/i.test(b.tipo ?? ""));
    const botellasChampagne = sinDuplicados(espumosos ?? []).filter((v) => esChampagne(v.categoria));
    const grupos = agruparDestilados(listaBebidas);
    return [
      {
        id: "cocteles",
        palabra: "Cócteles",
        href: "/carta#cocteles",
        imagen: IMAGENES.copaRoja,
        alt: "Cóctel rojo con espuma en copa coupé, sobre la barra de Touza",
        dato: datoPuertaCocteles(sinDuplicados(cocteles ?? [])),
      },
      {
        id: "champagne",
        palabra: "Champagne",
        href: "/carta#champagne",
        imagen: IMAGENES.champanMesa,
        alt: "Botellas de champagne Laurent-Perrier y una copa servida sobre el mármol",
        dato: datoPuertaChampagne(copasChampagne, botellasChampagne),
      },
      {
        id: "destilados",
        palabra: "Destilados",
        href: "/carta#destilados",
        imagen: IMAGENES.botellero,
        alt: "El botellero de Touza iluminado en dorado, con whiskies y tequilas",
        dato: datoPuertaDestilados(familiasDestilados(grupos), grupos.flatMap((g) => g.items)),
      },
    ];
  }, [cocteles, espumosos, bebidas]);

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
              <div className="absolute inset-x-5 bottom-5 flex items-end justify-between gap-3 md:inset-x-7 md:bottom-7">
                <span className="font-serif text-[2.6rem] font-medium leading-[0.95] text-white md:text-5xl lg:text-[4rem]">
                  {puerta.palabra}
                </span>
                {puerta.dato && (
                  <span className="max-w-[45%] pb-1 text-right text-[11.5px] leading-snug text-[#e7dcc6] [font-variant-numeric:lining-nums] md:text-sm">
                    {puerta.dato.map((linea, i) => (
                      <span key={linea} className="block">
                        {i > 0 && <span className="sr-only">, </span>}
                        {linea}
                      </span>
                    ))}
                  </span>
                )}
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
};

export default TresPuertas;
