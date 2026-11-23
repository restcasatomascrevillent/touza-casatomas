import { useMemo } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useCocteles, transformCoctelesToUI } from "@/hooks/useCocteles";
import { sinDuplicados } from "@/lib/negocio";
import { slugCarta } from "@/lib/carta";
import { FOTO_TIRA, fotoResponsive, volverAFotoOriginal } from "@/lib/foto";

/** Cuántos cócteles caben en la tira. */
export const COCTELES_TIRA = 8;

/**
 * «De la casa» (rediseño A, 21/11/2026): bajo las tres puertas, una tira
 * horizontal de ocho cócteles con su foto, nombre y precio, y «Carta
 * completa». Solo los que tienen foto propia (la genérica de la «T» no
 * cuenta), en el orden de la carta. Cada uno lleva a su ficha
 * (`/carta#moscow-mule`). Misma consulta que /carta, con la instantánea del
 * build: va en el HTML del SSG.
 */
const DeLaCasa = () => {
  const { data } = useCocteles();
  const cocteles = useMemo(
    () =>
      transformCoctelesToUI(sinDuplicados(data ?? []))
        .filter((c) => c.image && !c.fotoGenerica)
        .slice(0, COCTELES_TIRA),
    [data]
  );

  if (cocteles.length === 0) return null;

  return (
    <section aria-labelledby="de-la-casa-titulo" className="mx-auto max-w-7xl overflow-hidden px-5 pb-16 pt-12 md:px-8 md:pb-24 md:pt-20 lg:px-10">
      <div className="mb-5 flex items-baseline justify-between gap-4 md:mb-8">
        <h2 id="de-la-casa-titulo" className="font-serif text-[2rem] font-medium leading-none text-cream md:text-[3.25rem]">
          De la casa
        </h2>
        <Link
          to="/carta"
          className="inline-flex min-h-11 items-center gap-1.5 whitespace-nowrap rounded-sm text-sm text-primary transition-colors hover:text-[#e6c796] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          Carta completa
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>

      <ul
        aria-label="Algunos cócteles de la carta"
        className="-mx-5 flex gap-3 overflow-x-auto px-5 scrollbar-hide md:-mx-8 md:gap-[18px] md:px-8 lg:-mx-10 lg:px-10"
      >
        {cocteles.map((coctel) => (
          <li key={coctel.id} className="w-[150px] shrink-0 md:w-[230px]">
            <Link
              to={`/carta#${slugCarta(coctel.name)}`}
              className="group block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-4 focus-visible:ring-offset-background"
            >
              <div className="fondo-foto mb-2.5 aspect-[3/4] overflow-hidden rounded-xl">
                <img
                  {...fotoResponsive(coctel.image, FOTO_TIRA.anchos, FOTO_TIRA.sizes)}
                  alt={`${coctel.name}, cóctel de la carta de Touza`}
                  width={900}
                  height={1200}
                  loading="lazy"
                  decoding="async"
                  onError={(evento) => volverAFotoOriginal(evento.currentTarget, coctel.image)}
                  className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                />
              </div>
              <div className="flex items-baseline justify-between gap-2">
                <h3 className="min-w-0 font-serif text-[1.05rem] font-semibold leading-tight tracking-normal text-white transition-colors group-hover:text-[#D8B47E] md:text-lg">
                  {coctel.name}
                </h3>
                {coctel.price && (
                  <span className="shrink-0 text-sm text-primary [font-variant-numeric:lining-nums_tabular-nums]">{coctel.price}</span>
                )}
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
};

export default DeLaCasa;
