import { useMemo } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useCocteles, transformCoctelesToUI } from "@/hooks/useCocteles";
import { sinDuplicados } from "@/lib/negocio";
import { elegirCoctelesPortada, slugCarta } from "@/lib/carta";
import { FOTO_PORTADA, fotoResponsive, volverAFotoOriginal } from "@/lib/foto";
import Encabezado from "./Encabezado";

/**
 * «La carta» en la portada: lo primero tras el hero (16/11/2026: el dueño
 * quiere una web sencilla donde lo importante sea la carta).
 *
 * Una cuadrícula limpia de hasta ocho cócteles con su foto, su nombre y su
 * precio, y un botón grande a la carta completa. Salen de la misma consulta
 * que /carta (con la instantánea del build, así que van en el HTML del SSG):
 * los precios y las fotos son los del panel, sin copiarlos a mano. Solo los
 * que tienen foto propia; la genérica de la «T» no cuenta.
 *
 * Cada tarjeta lleva a su ficha (`/carta#moscow-mule`). Sin descripción ni
 * alérgenos: eso está en la carta. Cuáles salen lo decide
 * `elegirCoctelesPortada` (lib/carta.ts).
 */
const CoctelesDeLaCarta = () => {
  const { data } = useCocteles();
  const cocteles = useMemo(() => elegirCoctelesPortada(transformCoctelesToUI(sinDuplicados(data ?? []))), [data]);
  const columnas = cocteles.length === 6 || cocteles.length === 3 ? "md:grid-cols-3" : "md:grid-cols-4";

  return (
    <section aria-labelledby="cocteles-titulo" className="mx-auto max-w-7xl px-5 pb-20 pt-14 md:px-8 md:pb-28 md:pt-20 lg:px-10">
      <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between md:gap-12">
        <Encabezado
          id="cocteles-titulo"
          antetitulo="La carta"
          lineas={["Cócteles", "de autor"]}
          tituloClassName="text-[2.75rem] leading-[0.95] md:text-6xl lg:text-7xl"
        />
        <p className="max-w-md text-base leading-relaxed text-white/75 md:pb-2 md:text-[17px]">
          Recetas de la casa y clásicos bien hechos, también sin alcohol. Para acompañar, champagne, cava y whisky.
        </p>
      </div>

      {cocteles.length > 0 && (
        <ul aria-label="Algunos cócteles de la carta" className={`mt-10 grid grid-cols-2 gap-x-3 gap-y-8 md:mt-14 md:gap-x-5 md:gap-y-12 ${columnas}`}>
          {cocteles.map((coctel) => (
            <li key={coctel.id}>
              <Link
                to={`/carta#${slugCarta(coctel.name)}`}
                className="group block rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-4 focus-visible:ring-offset-background"
              >
                {/* Mientras llega la foto, el fondo cálido de las tarjetas (no gris). */}
                <div className="fondo-foto aspect-[3/4] overflow-hidden rounded-2xl">
                  <img
                    {...fotoResponsive(coctel.image, FOTO_PORTADA.anchos, FOTO_PORTADA.sizes)}
                    alt={`${coctel.name}, cóctel de la carta de Touza`}
                    width={900}
                    height={1200}
                    loading="lazy"
                    decoding="async"
                    onError={(evento) => volverAFotoOriginal(evento.currentTarget, coctel.image)}
                    className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                  />
                </div>
                <div className="mt-3 flex items-baseline justify-between gap-3 md:mt-4">
                  <h3 className="min-w-0 font-serif text-[1.05rem] leading-tight tracking-normal text-white transition-colors duration-300 group-hover:text-[#D8B47E] md:text-xl">
                    {coctel.name}
                  </h3>
                  {coctel.price && (
                    <span className="shrink-0 font-serif text-[1.05rem] leading-tight text-primary [font-variant-numeric:lining-nums_tabular-nums] md:text-xl">
                      {coctel.price}
                    </span>
                  )}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-12 flex justify-center md:mt-16">
        <Link
          to="/carta"
          className="inline-flex min-h-14 w-full max-w-sm items-center justify-center gap-3 rounded-full bg-[#D8B47E] px-8 text-base font-medium text-black transition-colors hover:bg-[#e6c796] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-background md:w-auto md:max-w-none md:min-h-16 md:px-12 md:text-lg"
        >
          Ver la carta completa
          <ArrowRight className="h-5 w-5" aria-hidden="true" />
        </Link>
      </div>
    </section>
  );
};

export default CoctelesDeLaCarta;
